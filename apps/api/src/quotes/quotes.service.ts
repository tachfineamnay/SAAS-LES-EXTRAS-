import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuoteDto: CreateQuoteDto) {
    return this.prisma.quote.create({
      data: {
        amount: createQuoteDto.amount ?? 0,
        description: createQuoteDto.description ?? '',
        startDate: createQuoteDto.startDate ? new Date(createQuoteDto.startDate) : undefined,
        endDate: createQuoteDto.endDate ? new Date(createQuoteDto.endDate) : undefined,
        freelance: { connect: { id: createQuoteDto.freelanceId } },
        establishment: { connect: { id: createQuoteDto.establishmentId } },
        ...(createQuoteDto.reliefMissionId && {
          reliefMission: { connect: { id: createQuoteDto.reliefMissionId } },
        }),
      },
    });
  }

  async findAll(role: 'CLIENT' | 'TALENT', userId: string) {
    const where = role === 'CLIENT'
      ? { establishmentId: userId }
      : { freelanceId: userId };

    return this.prisma.quote.findMany({
      where,
      include: {
        freelance: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true, jobTitle: true } } } },
        establishment: { select: { id: true, profile: { select: { companyName: true, firstName: true, lastName: true } } } },
        service: { select: { id: true, title: true, type: true, category: true } },
        booking: { select: { id: true, status: true, scheduledAt: true, nbParticipants: true, message: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        freelance: { include: { profile: true } },
        establishment: { include: { profile: true } },
        service: true,
        booking: true,
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async update(id: string, dto: UpdateQuoteDto, userId: string) {
    const quote = await this.findOne(id);

    if (quote.freelanceId !== userId) {
      throw new ForbiddenException('Only the talent can edit this quote');
    }

    if (quote.status === QuoteStatus.ACCEPTED || quote.status === QuoteStatus.REJECTED) {
      throw new BadRequestException('Cannot edit a processed quote');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async accept(id: string, userId: string) {
    const quote = await this.findOne(id);

    if (quote.establishmentId !== userId) {
      throw new BadRequestException('Only the target establishment can accept this quote');
    }

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Quote is already processed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedQuote = await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.ACCEPTED },
      });

      // If a Booking already exists (service quote flow), update it
      if (quote.booking) {
        await tx.booking.update({
          where: { id: quote.booking.id },
          data: { status: BookingStatus.CONFIRMED },
        });
        return { quote: updatedQuote };
      }

      // Otherwise create a new booking (legacy direct quote flow)
      await tx.booking.create({
        data: {
          status: BookingStatus.CONFIRMED,
          clientId: quote.establishmentId,
          talentId: quote.freelanceId,
          quoteId: quote.id,
          reliefMissionId: quote.reliefMissionId ?? undefined,
          scheduledAt: quote.startDate ?? new Date(),
        },
      });

      return { quote: updatedQuote };
    });
  }

  async reject(id: string, userId: string) {
    const quote = await this.findOne(id);

    if (quote.establishmentId !== userId) {
      throw new BadRequestException('Only the target establishment can reject this quote');
    }

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Quote is already processed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedQuote = await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.REJECTED },
      });

      // Cancel the linked booking if it exists
      if (quote.booking) {
        await tx.booking.update({
          where: { id: quote.booking.id },
          data: { status: BookingStatus.CANCELLED },
        });
      }

      return updatedQuote;
    });
  }
}
