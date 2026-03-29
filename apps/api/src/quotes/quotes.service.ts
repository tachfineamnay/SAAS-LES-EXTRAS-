import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConversationsService } from '../conversations/conversations.service';
import { CreateQuoteDto, RejectQuoteDto } from './dto/quotes.dto';
import { EventsService } from '../events/events.service';
import type { OrderEvent } from '../events/events.types';

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly conversations: ConversationsService,
    private readonly events: EventsService,
  ) {}

  /**
   * Generate a quote for a booking. Only the assigned freelance can do this.
   */
  async generateQuote(freelanceId: string, dto: CreateQuoteDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        reliefMission: true,
        service: true,
        freelance: { include: { profile: true } },
        establishment: { include: { profile: true } },
        conversation: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking introuvable.');
    if (booking.freelanceId !== freelanceId) {
      throw new ForbiddenException('Seul le freelance assigné peut créer un devis.');
    }
    if (booking.status !== 'PENDING' && booking.status !== 'QUOTE_SENT') {
      throw new BadRequestException('Un devis ne peut être envoyé qu\'à ce stade.');
    }

    // Mark any existing SENT quotes as REVISED
    await this.prisma.quote.updateMany({
      where: { bookingId: dto.bookingId, status: 'SENT' },
      data: { status: 'REVISED' },
    });

    const vatRate = dto.vatRate ?? 0.20;
    const lines = dto.lines.map((line) => {
      const totalHT = Math.round(line.quantity * line.unitPrice * 100) / 100;
      return { ...line, unit: line.unit ?? 'heure', totalHT };
    });
    const subtotalHT = Math.round(lines.reduce((sum, l) => sum + l.totalHT, 0) * 100) / 100;
    const vatAmount = Math.round(subtotalHT * vatRate * 100) / 100;
    const totalTTC = Math.round((subtotalHT + vatAmount) * 100) / 100;

    const quote = await this.prisma.quote.create({
      data: {
        bookingId: dto.bookingId,
        issuedBy: freelanceId,
        status: 'SENT',
        subtotalHT,
        vatRate,
        vatAmount,
        totalTTC,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        conditions: dto.conditions,
        notes: dto.notes,
        lines: { create: lines },
      },
      include: { lines: true },
    });

    // Update booking status
    await this.prisma.booking.update({
      where: { id: dto.bookingId },
      data: { status: 'QUOTE_SENT' },
    });

    // Create system message in conversation
    const conversation = booking.conversation
      ?? await this.conversations.getOrCreateConversation(freelanceId, booking.establishmentId);

    // Link conversation to booking if not yet
    if (!booking.conversation) {
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { bookingId: booking.id },
      });
    }

    const freelanceName = booking.freelance?.profile?.firstName ?? 'Le freelance';
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: freelanceId,
        receiverId: booking.establishmentId,
        content: `📋 ${freelanceName} a envoyé un devis de ${totalTTC.toFixed(2)} € TTC`,
        type: 'SYSTEM',
        metadata: { quoteId: quote.id, totalTTC, event: 'QUOTE_SENT' },
      },
    });

    // Notify establishment
    await this.notifications.create({
      userId: booking.establishmentId,
      message: `Nouveau devis reçu (${totalTTC.toFixed(2)} € TTC) — en attente de validation`,
      type: 'INFO',
    });

    // SSE event
    const sseEvent: OrderEvent = {
      type: 'QUOTE_SENT',
      bookingId: dto.bookingId,
      payload: { quoteId: quote.id, totalTTC },
      timestamp: new Date().toISOString(),
    };
    this.events.emitToMany([booking.establishmentId, freelanceId], sseEvent);

    return quote;
  }

  /**
   * Accept a quote. Only the establishment owner of the booking can do this.
   */
  async acceptQuote(quoteId: string, establishmentId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        booking: {
          include: {
            conversation: true,
            freelance: { include: { profile: true } },
            establishment: { include: { profile: true } },
          },
        },
      },
    });

    if (!quote) throw new NotFoundException('Devis introuvable.');
    if (quote.booking.establishmentId !== establishmentId) {
      throw new ForbiddenException('Seul l\'établissement peut accepter ce devis.');
    }
    if (quote.status !== 'SENT') {
      throw new BadRequestException('Ce devis ne peut plus être accepté.');
    }

    const now = new Date();
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED', acceptedAt: now },
    });

    await this.prisma.booking.update({
      where: { id: quote.bookingId },
      data: { status: 'QUOTE_ACCEPTED' },
    });

    // System message
    if (quote.booking.conversation) {
      const estName = quote.booking.establishment?.profile?.firstName ?? 'L\'établissement';
      await this.prisma.message.create({
        data: {
          conversationId: quote.booking.conversation.id,
          senderId: establishmentId,
          receiverId: quote.booking.freelanceId ?? establishmentId,
          content: `✅ ${estName} a accepté le devis de ${quote.totalTTC.toFixed(2)} € TTC`,
          type: 'SYSTEM',
          metadata: { quoteId, event: 'QUOTE_ACCEPTED' },
        },
      });
    }

    // Notify freelance
    if (quote.booking.freelanceId) {
      await this.notifications.create({
        userId: quote.booking.freelanceId,
        message: `Votre devis a été accepté (${quote.totalTTC.toFixed(2)} € TTC)`,
        type: 'SUCCESS',
      });
    }

    // SSE event
    const userIds = [quote.booking.establishmentId, quote.booking.freelanceId].filter(Boolean) as string[];
    this.events.emitToMany(userIds, {
      type: 'QUOTE_ACCEPTED',
      bookingId: quote.bookingId,
      payload: { quoteId },
      timestamp: new Date().toISOString(),
    });

    return quote;
  }

  /**
   * Reject a quote. Only the establishment can do this.
   */
  async rejectQuote(quoteId: string, establishmentId: string, dto?: RejectQuoteDto) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        booking: {
          include: {
            conversation: true,
            establishment: { include: { profile: true } },
          },
        },
      },
    });

    if (!quote) throw new NotFoundException('Devis introuvable.');
    if (quote.booking.establishmentId !== establishmentId) {
      throw new ForbiddenException('Seul l\'établissement peut refuser ce devis.');
    }
    if (quote.status !== 'SENT') {
      throw new BadRequestException('Ce devis ne peut plus être refusé.');
    }

    const now = new Date();
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'REJECTED', rejectedAt: now },
    });

    // Booking goes back to PENDING so freelance can revise
    await this.prisma.booking.update({
      where: { id: quote.bookingId },
      data: { status: 'PENDING' },
    });

    // System message
    if (quote.booking.conversation) {
      const estName = quote.booking.establishment?.profile?.firstName ?? 'L\'établissement';
      const reasonSuffix = dto?.reason ? ` — Motif : ${dto.reason}` : '';
      await this.prisma.message.create({
        data: {
          conversationId: quote.booking.conversation.id,
          senderId: establishmentId,
          receiverId: quote.booking.freelanceId ?? establishmentId,
          content: `❌ ${estName} a refusé le devis${reasonSuffix}`,
          type: 'SYSTEM',
          metadata: { quoteId, event: 'QUOTE_REJECTED', reason: dto?.reason },
        },
      });
    }

    // Notify freelance
    if (quote.booking.freelanceId) {
      await this.notifications.create({
        userId: quote.booking.freelanceId,
        message: `Votre devis a été refusé${dto?.reason ? ` — ${dto.reason}` : ''}`,
        type: 'WARNING',
      });
    }

    // SSE event
    const rejectUserIds = [quote.booking.establishmentId, quote.booking.freelanceId].filter(Boolean) as string[];
    this.events.emitToMany(rejectUserIds, {
      type: 'QUOTE_REJECTED',
      bookingId: quote.bookingId,
      payload: { quoteId, reason: dto?.reason },
      timestamp: new Date().toISOString(),
    });

    return quote;
  }

  /**
   * Get all quotes for a booking, ordered newest first.
   */
  async getQuotesByBooking(bookingId: string) {
    return this.prisma.quote.findMany({
      where: { bookingId },
      include: { lines: true, issuer: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get quote prefill data based on booking type.
   */
  async getQuotePrefill(bookingId: string, freelanceId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { reliefMission: true, service: true },
    });

    if (!booking) throw new NotFoundException('Booking introuvable.');
    if (booking.freelanceId !== freelanceId) {
      throw new ForbiddenException('Accès refusé.');
    }

    // Relief Mission: hours × hourlyRate
    if (booking.reliefMission) {
      const mission = booking.reliefMission;
      const hours = Math.max(
        1,
        Math.round(
          (mission.dateEnd.getTime() - mission.dateStart.getTime()) / (1000 * 60 * 60) * 100,
        ) / 100,
      );
      return {
        lines: [
          {
            description: `${mission.title}${mission.shift ? ` — ${mission.shift}` : ''}`,
            quantity: hours,
            unitPrice: mission.hourlyRate,
            unit: 'heure',
          },
        ],
      };
    }

    // Service: depends on pricingType
    if (booking.service) {
      const svc = booking.service;
      if (svc.pricingType === 'SESSION') {
        return {
          lines: [
            {
              description: svc.title,
              quantity: 1,
              unitPrice: svc.price,
              unit: 'séance',
            },
          ],
        };
      }
      if (svc.pricingType === 'PER_PARTICIPANT' && svc.pricePerParticipant) {
        return {
          lines: [
            {
              description: `${svc.title} — par participant`,
              quantity: booking.nbParticipants ?? svc.capacity,
              unitPrice: svc.pricePerParticipant,
              unit: 'participant',
            },
          ],
        };
      }
      // QUOTE type: empty lines for manual fill
      return { lines: [] };
    }

    return { lines: [] };
  }
}
