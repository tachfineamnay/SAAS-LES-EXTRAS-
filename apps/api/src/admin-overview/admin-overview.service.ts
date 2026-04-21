import { Injectable } from "@nestjs/common";
import {
  DeskRequestStatus,
  ReliefMissionStatus,
  UserStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdminOverview } from "./types/admin-overview.types";

const URGENT_MISSION_WINDOW_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class AdminOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(now = new Date()): Promise<AdminOverview> {
    const urgentUntil = new Date(now.getTime() + URGENT_MISSION_WINDOW_MS);

    const [
      pendingUsersCount,
      openDeskRequestsCount,
      urgentOpenMissionsCount,
      featuredServicesCount,
      hiddenServicesCount,
      pendingInvoicesCount,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: { status: UserStatus.PENDING },
      }),
      this.prisma.deskRequest.count({
        where: { status: DeskRequestStatus.OPEN },
      }),
      this.prisma.reliefMission.count({
        where: {
          status: ReliefMissionStatus.OPEN,
          dateEnd: { gte: now },
          dateStart: {
            gte: now,
            lte: urgentUntil,
          },
        },
      }),
      this.prisma.service.count({
        where: { isFeatured: true },
      }),
      this.prisma.service.count({
        where: { isHidden: true },
      }),
      this.prisma.invoice.count({
        where: { status: "UNPAID" },
      }),
    ]);

    return {
      pendingUsersCount,
      openDeskRequestsCount,
      urgentOpenMissionsCount,
      featuredServicesCount,
      hiddenServicesCount,
      pendingInvoicesCount,
    };
  }
}
