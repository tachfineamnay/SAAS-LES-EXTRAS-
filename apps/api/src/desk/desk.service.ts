import { Injectable, NotFoundException } from "@nestjs/common";
import { DeskRequestStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AssignDeskRequestDto } from "./dto/assign-desk-request.dto";
import { UpdateDeskRequestStatusDto } from "./dto/update-desk-request-status.dto";
import { RespondDeskRequestDto } from "./dto/respond-desk-request.dto";

const REQUESTER_SELECT = {
  id: true,
  email: true,
  profile: { select: { firstName: true, lastName: true } },
};

const MISSION_SELECT = {
  id: true,
  title: true,
};

const ANSWERED_BY_SELECT = {
  id: true,
  email: true,
  profile: { select: { firstName: true, lastName: true } },
};

const ADMIN_SELECT = ANSWERED_BY_SELECT;

function getDisplayName(user: {
  email: string;
  profile: { firstName: string; lastName: string } | null;
}) {
  if (user.profile) {
    return `${user.profile.firstName} ${user.profile.lastName}`.trim();
  }

  return user.email;
}

@Injectable()
export class DeskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deskRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mission: { select: MISSION_SELECT },
        requester: { select: REQUESTER_SELECT },
        assignedToAdmin: { select: ADMIN_SELECT },
        answeredBy: { select: ANSWERED_BY_SELECT },
      },
    });
  }

  async findMine(requesterId: string) {
    return this.prisma.deskRequest.findMany({
      where: { requesterId },
      orderBy: { createdAt: "desc" },
      include: {
        mission: { select: MISSION_SELECT },
        answeredBy: { select: ANSWERED_BY_SELECT },
      },
    });
  }

  async findContactBypassEvents() {
    const events = await this.prisma.contactBypassEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        conversationId: true,
        blockedReason: true,
        rawExcerpt: true,
        createdAt: true,
        sender: { select: REQUESTER_SELECT },
      },
    });

    return events.map((event) => ({
      id: event.id,
      conversationId: event.conversationId,
      blockedReason: event.blockedReason,
      rawExcerpt: event.rawExcerpt,
      createdAt: event.createdAt.toISOString(),
      sender: {
        id: event.sender.id,
        email: event.sender.email,
        name: getDisplayName(event.sender),
      },
    }));
  }

  async updateStatus(id: string, adminId: string, dto: UpdateDeskRequestStatusDto) {
    const request = await this.prisma.deskRequest.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!request) throw new NotFoundException("Demande introuvable");

    const [updated] = await this.prisma.$transaction([
      this.prisma.deskRequest.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "DESK_REQUEST",
          entityId: id,
          action: "DESK_REQUEST_STATUS_UPDATE",
          meta: {
            previousStatus: request.status,
            nextStatus: dto.status,
          },
        },
      }),
    ]);

    return updated;
  }

  async assign(id: string, adminId: string, dto: AssignDeskRequestDto) {
    const nextAssignedToAdminId = dto.adminId?.trim() || null;
    const request = await this.prisma.deskRequest.findUnique({
      where: { id },
      select: { id: true, assignedToAdminId: true },
    });
    if (!request) throw new NotFoundException("Demande introuvable");

    if (nextAssignedToAdminId) {
      const assignedAdmin = await this.prisma.user.findFirst({
        where: { id: nextAssignedToAdminId, role: UserRole.ADMIN },
        select: { id: true },
      });
      if (!assignedAdmin) throw new NotFoundException("Admin introuvable");
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.deskRequest.update({
        where: { id },
        data: { assignedToAdminId: nextAssignedToAdminId },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "DESK_REQUEST",
          entityId: id,
          action: "DESK_REQUEST_ASSIGN",
          meta: {
            previousAssignedToAdminId: request.assignedToAdminId,
            nextAssignedToAdminId,
          },
        },
      }),
    ]);

    return updated;
  }

  async respond(id: string, adminId: string, dto: RespondDeskRequestDto) {
    const request = await this.prisma.deskRequest.findUnique({
      where: { id },
      select: {
        id: true,
        requesterId: true,
        missionId: true,
        status: true,
        response: true,
        mission: { select: { title: true } },
      },
    });
    if (!request) throw new NotFoundException("Demande introuvable");

    const [updated] = await this.prisma.$transaction([
      this.prisma.deskRequest.update({
        where: { id },
        data: {
          response: dto.response,
          answeredById: adminId,
          answeredAt: new Date(),
          status: DeskRequestStatus.ANSWERED,
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: request.requesterId,
          type: "INFO",
          message: `Votre demande sur la mission « ${request.mission.title} » a reçu une réponse. Consultez-la dans votre espace Mes demandes.`,
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "DESK_REQUEST",
          entityId: id,
          action: "DESK_REQUEST_RESPOND",
          meta: {
            previousStatus: request.status,
            nextStatus: DeskRequestStatus.ANSWERED,
            hadExistingResponse: Boolean(request.response),
          },
        },
      }),
    ]);

    return updated;
  }
}
