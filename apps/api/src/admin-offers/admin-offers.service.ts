import { Injectable, NotFoundException } from "@nestjs/common";
import { BookingStatus, ReliefMissionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  AdminMissionDetail,
  AdminMissionRow,
  AdminServiceDetail,
  AdminServiceRow,
} from "./types/admin-offers.types";

function getDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email;
}

function toMessageExcerpt(message: string, maxLength = 140) {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
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
        establishment: {
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
      establishmentName: getDisplayName(
        mission.establishment.profile?.firstName,
        mission.establishment.profile?.lastName,
        mission.establishment.email,
      ),
      establishmentEmail: mission.establishment.email,
      candidatesCount: mission.bookings.length,
    }));
  }

  async getMissionById(missionId: string): Promise<AdminMissionDetail> {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        title: true,
        status: true,
        address: true,
        dateStart: true,
        dateEnd: true,
        hourlyRate: true,
        establishment: {
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
        deskRequests: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
            message: true,
          },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    return {
      id: mission.id,
      title: mission.title,
      status: mission.status,
      establishmentName: getDisplayName(
        mission.establishment.profile?.firstName,
        mission.establishment.profile?.lastName,
        mission.establishment.email,
      ),
      establishmentEmail: mission.establishment.email,
      address: mission.address,
      dateStart: mission.dateStart.toISOString(),
      dateEnd: mission.dateEnd.toISOString(),
      hourlyRate: mission.hourlyRate,
      candidatesCount: mission.bookings.length,
      linkedDeskRequests: mission.deskRequests.map((deskRequest) => ({
        id: deskRequest.id,
        status: deskRequest.status,
        priority: deskRequest.priority,
        createdAt: deskRequest.createdAt.toISOString(),
        messageExcerpt: toMessageExcerpt(deskRequest.message),
      })),
    };
  }

  async deleteMission(missionId: string, adminId: string): Promise<{ ok: true }> {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id: missionId },
      select: { id: true, status: true },
    });

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    if (mission.status === ReliefMissionStatus.CANCELLED) {
      await this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "MISSION",
          entityId: missionId,
          action: "MISSION_DELETE",
          meta: {
            previousStatus: mission.status,
            nextStatus: ReliefMissionStatus.CANCELLED,
            alreadyCancelled: true,
          },
        },
      });
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
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
        data: {
          status: BookingStatus.CANCELLED,
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "MISSION",
          entityId: missionId,
          action: "MISSION_DELETE",
          meta: {
            previousStatus: mission.status,
            nextStatus: ReliefMissionStatus.CANCELLED,
          },
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
      freelanceName: getDisplayName(
        service.owner.profile?.firstName,
        service.owner.profile?.lastName,
        service.owner.email,
      ),
      freelanceEmail: service.owner.email,
    }));
  }

  async getServiceById(serviceId: string): Promise<AdminServiceDetail> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        isFeatured: true,
        isHidden: true,
        description: true,
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

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    return {
      id: service.id,
      title: service.title,
      type: service.type,
      price: service.price,
      freelanceName: getDisplayName(
        service.owner.profile?.firstName,
        service.owner.profile?.lastName,
        service.owner.email,
      ),
      freelanceEmail: service.owner.email,
      isFeatured: service.isFeatured,
      isHidden: service.isHidden,
      description: service.description,
      createdAt: service.createdAt.toISOString(),
    };
  }

  async featureService(serviceId: string, adminId: string): Promise<{ ok: true }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isFeatured: true },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const nextIsFeatured = !service.isFeatured;

    await this.prisma.$transaction([
      this.prisma.service.update({
        where: { id: serviceId },
        data: { isFeatured: nextIsFeatured },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "SERVICE",
          entityId: serviceId,
          action: "SERVICE_FEATURE",
          meta: {
            previousIsFeatured: service.isFeatured,
            nextIsFeatured,
          },
        },
      }),
    ]);

    return { ok: true };
  }

  async hideService(serviceId: string, adminId: string): Promise<{ ok: true }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isHidden: true },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const nextIsHidden = !service.isHidden;

    await this.prisma.$transaction([
      this.prisma.service.update({
        where: { id: serviceId },
        data: { isHidden: nextIsHidden },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "SERVICE",
          entityId: serviceId,
          action: "SERVICE_HIDE",
          meta: {
            previousIsHidden: service.isHidden,
            nextIsHidden,
          },
        },
      }),
    ]);

    return { ok: true };
  }
}
