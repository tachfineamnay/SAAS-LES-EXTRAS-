import { Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, ReliefMissionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdminMissionRow, AdminServiceRow } from "./types/admin-offers.types";

function getDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email;
}

@Injectable()
export class AdminOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMissions(): Promise<AdminMissionRow[]> {
    const missions = await this.prisma.reliefMission.findMany({
      where: {
        status: {
          in: [ReliefMissionStatus.OPEN, ReliefMissionStatus.ASSIGNED],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        address: true,
        status: true,
        createdAt: true,
        dateStart: true,
        dateEnd: true,
        hourlyRate: true,
        client: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: {
              not: BookingStatus.CANCELLED,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    return missions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      address: mission.address,
      status: mission.status,
      createdAt: mission.createdAt.toISOString(),
      dateStart: mission.dateStart.toISOString(),
      dateEnd: mission.dateEnd.toISOString(),
      hourlyRate: mission.hourlyRate,
      clientName: getDisplayName(
        mission.client.profile?.firstName,
        mission.client.profile?.lastName,
        mission.client.email,
      ),
      clientEmail: mission.client.email,
      candidatesCount: mission.bookings.length,
    }));
  }

  async deleteMission(missionId: string): Promise<{ ok: true }> {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id: missionId },
      select: { id: true, status: true },
    });

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    if (mission.status === ReliefMissionStatus.CANCELLED) {
      return { ok: true };
    }

    await this.prisma.$transaction([
      this.prisma.reliefMission.update({
        where: { id: missionId },
        data: {
          status: ReliefMissionStatus.CANCELLED,
        },
      }),
      this.prisma.booking.updateMany({
        where: {
          reliefMissionId: missionId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PAID],
          },
        },
        data: {
          status: BookingStatus.CANCELLED,
        },
      }),
    ]);

    return { ok: true };
  }

  async getServices(): Promise<AdminServiceRow[]> {
    const services = await this.prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        type: true,
        isFeatured: true,
        isHidden: true,
        createdAt: true,
        owner: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: service.price,
      type: service.type,
      isFeatured: service.isFeatured,
      isHidden: service.isHidden,
      createdAt: service.createdAt.toISOString(),
      talentName: getDisplayName(
        service.owner.profile?.firstName,
        service.owner.profile?.lastName,
        service.owner.email,
      ),
      talentEmail: service.owner.email,
    }));
  }

  async toggleFeatureService(serviceId: string): Promise<{ ok: true }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isFeatured: true },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        isFeatured: !service.isFeatured,
      },
    });

    return { ok: true };
  }

  async toggleHideService(serviceId: string): Promise<{ ok: true }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isHidden: true },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        isHidden: !service.isHidden,
      },
    });

    return { ok: true };
  }
}
