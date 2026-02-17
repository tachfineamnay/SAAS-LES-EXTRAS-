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
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createService(dto: CreateServiceDto, ownerId: string) {
    return this.prisma.service.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        type: dto.type,
        capacity: dto.capacity,
        ownerId,
      },
    });
  }

  async bookService(serviceId: string, clientId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        serviceId,
        clientId,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException("Service already booked");
    }

    return this.prisma.booking.create({
      data: {
        status: BookingStatus.PENDING,
        clientId,
        talentId: service.ownerId,
        serviceId: service.id,
        scheduledAt: new Date(),
      },
    });
  }
}
