import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, ReviewType, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { CreateReviewDto } from "./dto/create-review.dto";

const REVIEWABLE_STATUSES = new Set<BookingStatus>([
  BookingStatus.COMPLETED,
  BookingStatus.COMPLETED_AWAITING_PAYMENT,
  BookingStatus.PAID,
]);

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, user: AuthenticatedUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: {
        id: true,
        status: true,
        establishmentId: true,
        freelanceId: true,
        review: { select: { id: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Only completed/paid bookings can be reviewed
    if (!REVIEWABLE_STATUSES.has(booking.status)) {
      throw new BadRequestException(
        "Impossible de laisser un avis : la mission n'est pas terminée",
      );
    }

    // Only one review per booking
    if (booking.review) {
      throw new ConflictException("Un avis existe déjà pour cette réservation");
    }

    // Determine who can review whom
    const isEstablishment = booking.establishmentId === user.id;
    const isFreelance = booking.freelanceId === user.id;

    if (!isEstablishment && !isFreelance) {
      throw new ForbiddenException("Vous n'êtes pas participant de cette réservation");
    }

    // Validate review type matches the user's role in this booking
    if (isEstablishment && dto.type !== ReviewType.ESTABLISHMENT_TO_FREELANCE) {
      throw new BadRequestException(
        "Un établissement ne peut laisser qu'un avis de type ESTABLISHMENT_TO_FREELANCE",
      );
    }
    if (isFreelance && dto.type !== ReviewType.FREELANCE_TO_ESTABLISHMENT) {
      throw new BadRequestException(
        "Un freelance ne peut laisser qu'un avis de type FREELANCE_TO_ESTABLISHMENT",
      );
    }

    // Determine target
    const targetId = isEstablishment ? booking.freelanceId : booking.establishmentId;

    if (!targetId) {
      throw new BadRequestException("Aucun destinataire pour cet avis");
    }

    return this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        authorId: user.id,
        targetId,
        rating: dto.rating,
        comment: dto.comment,
        type: dto.type,
      },
    });
  }

  async findByTarget(targetId: string) {
    return this.prisma.review.findMany({
      where: { targetId },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAverageRating(targetId: string) {
    const result = await this.prisma.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating ?? 0,
      count: result._count.rating,
    };
  }

  async findByBooking(bookingId: string) {
    return this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });
  }
}
