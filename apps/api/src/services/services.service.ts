import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        isHidden: false,
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

  async createService(dto: CreateServiceDto, ownerId: string) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        type: dto.type,
        capacity: dto.capacity,
        pricingType: dto.pricingType ?? "SESSION",
        pricePerParticipant: dto.pricePerParticipant,
        durationMinutes: dto.durationMinutes ?? 120,
        category: dto.category,
        publicCible: dto.publicCible ?? [],
        materials: dto.materials,
        objectives: dto.objectives,
        methodology: dto.methodology,
        evaluation: dto.evaluation,
        slots: dto.slots ?? [],
        ownerId,
      },
    });
  }

  async bookService(
    serviceId: string,
    clientId: string,
    date: Date,
    message?: string,
    nbParticipants?: number,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        ownerId: true,
        pricingType: true,
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    // Check for existing pending booking for same service/client
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        serviceId,
        clientId,
        status: BookingStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException("Une demande est déjà en cours pour ce service");
    }

    // For QUOTE services: create Booking + a draft Quote atomically
    if (service.pricingType === "QUOTE") {
      return this.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            status: BookingStatus.PENDING,
            clientId,
            talentId: service.ownerId,
            serviceId: service.id,
            scheduledAt: date,
            message,
            nbParticipants,
          },
        });

        const quote = await tx.quote.create({
          data: {
            amount: 0,
            description: "",
            freelanceId: service.ownerId,
            establishmentId: clientId,
            serviceId: service.id,
            booking: { connect: { id: booking.id } },
          },
        });

        return { booking, quote };
      });
    }

    return this.prisma.booking.create({
      data: {
        status: BookingStatus.PENDING,
        clientId,
        talentId: service.ownerId,
        serviceId: service.id,
        scheduledAt: date,
        message,
        nbParticipants,
      },
    });
  }
}
