import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookingStatus, QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createQuoteDto: CreateQuoteDto) {
    return this.prisma.quote.create({
      data: {
        amount: createQuoteDto.amount,
        description: createQuoteDto.description,
        startDate: new Date(createQuoteDto.startDate),
        endDate: new Date(createQuoteDto.endDate),
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
        freelance: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
        establishment: { select: { id: true, profile: { select: { companyName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { freelance: true, establishment: true },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return quote;
  }

  async accept(id: string, userId: string) {
    const quote = await this.findOne(id);

    if (quote.establishmentId !== userId) {
      throw new BadRequestException('Only the target establishment can accept this quote');
    }

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Quote is already processed');
    }

    // Transaction: Update Quote -> Create Booking
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Quote
      const updatedQuote = await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.ACCEPTED },
      });

      // 2. Create Booking
      const booking = await tx.booking.create({
        data: {
          status: BookingStatus.CONFIRMED,
          clientId: quote.establishmentId,
          talentId: quote.freelanceId,
          quoteId: quote.id,
          // If linked to a mission, link it. Else, it's a direct quote.
          reliefMissionId: quote.reliefMissionId,
          scheduledAt: quote.startDate,
          // We can assume hourlyRate or total price logic here. 
          // For now, Booking model doesn't have 'price' field directly, 
          // usually price is calculated from mission or service.
          // BUT the requirement says: "price = Quote.amount".
          // Looking at schema, Booking doesn't have 'price' or 'amount'.
          // Invoice has 'amount'.
          // We'll store the quote connection, and Invoice generation will use Quote.amount.
        },
      });

      return { quote: updatedQuote, booking };
    });
  }

  async reject(id: string, userId: string) {
    const quote = await this.findOne(id);
    if (quote.establishmentId !== userId) {
      throw new BadRequestException('Only the target establishment can reject this quote');
    }
    return this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.REJECTED },
    });
  }

  update(id: number, updateQuoteDto: UpdateQuoteDto) {
    return `This action updates a #${id} quote`;
  }

  remove(id: number) {
    return `This action removes a #${id} quote`;
  }
}
