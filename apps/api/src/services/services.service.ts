import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { MailService } from "../mail/mail.service";
import { format } from "date-fns";

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    return service;
  }

  async findMyServices(ownerId: string) {
    return this.prisma.service.findMany({
      where: { ownerId },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            nbParticipants: true,
            establishment: {
              select: {
                id: true,
                profile: { select: { firstName: true, lastName: true, companyName: true } },
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createService(dto: CreateServiceDto, ownerId: string) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        capacity: dto.capacity,
        durationMinutes: dto.durationMinutes ?? 120,
        category: dto.category,
        type: dto.type,
        pricingType: dto.pricingType,
        publicCible: dto.publicCible ?? [],
        slots: dto.slots ? (dto.slots as any) : null,
        pricePerParticipant: dto.pricePerParticipant,
        materials: dto.materials,
        objectives: dto.objectives,
        methodology: dto.methodology,
        evaluation: dto.evaluation,
        ownerId,
      },
    });
  }

  async bookService(
    serviceId: string,
    establishmentId: string,
    date: Date,
    message?: string,
    nbParticipants?: number,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        title: true,
        ownerId: true,
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    if (date < new Date()) {
      throw new BadRequestException("La date de réservation ne peut pas être dans le passé");
    }

    // Check for existing pending booking for same service/client
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        serviceId,
        establishmentId,
        status: BookingStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException("Une demande est déjà en cours pour ce service");
    }

    const booking = await this.prisma.booking.create({
      data: {
        status: BookingStatus.PENDING,
        establishmentId,
        freelanceId: service.ownerId,
        serviceId: service.id,
        scheduledAt: date,
        message,
        nbParticipants,
      },
    });

    // C2: Send workshop booking confirmation email (non-blocking)
    const establishment = await this.prisma.user.findUnique({
      where: { id: establishmentId },
      select: { email: true },
    });

    if (establishment?.email) {
      const dateStr = format(date, "dd/MM/yyyy");
      this.mailService
        .sendWorkshopBookingEmail(establishment.email, service.title, dateStr)
        .catch((e: unknown) => console.error("workshopBookingEmail failed:", e));
    }

    return booking;
  }
}
