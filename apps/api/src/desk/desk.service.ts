import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DeskRequestStatus, UserRole } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignDeskRequestDto } from "./dto/assign-desk-request.dto";
import { SendAdminOutreachDto } from "./dto/send-admin-outreach.dto";
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
        conversation: { select: { bookingId: true } },
        sender: {
          select: {
            ...REQUESTER_SELECT,
            role: true,
            status: true,
          },
        },
      },
    });

    return events.map((event) => ({
      id: event.id,
      conversationId: event.conversationId,
      bookingId: event.conversation?.bookingId ?? null,
      blockedReason: event.blockedReason,
      rawExcerpt: event.rawExcerpt,
      createdAt: event.createdAt.toISOString(),
      sender: {
        id: event.sender.id,
        email: event.sender.email,
        name: getDisplayName(event.sender),
        role: event.sender.role,
        status: event.sender.status,
      },
    }));
  }

  async sendAdminOutreach(userId: string, adminId: string, dto: SendAdminOutreachDto) {
    if (userId === adminId) {
      throw new BadRequestException("Un admin ne peut pas s'envoyer un message Desk");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException("Le canal Desk cible uniquement les utilisateurs non-admin");
    }

    const message = dto.message.trim();
    if (message.length < 5) {
      throw new BadRequestException("Le message Desk est trop court");
    }
    const notifyByEmail = dto.notifyByEmail ?? true;
    const notificationMessage = `Message du Desk : ${message}`;

    await this.prisma.$transaction([
      this.prisma.notification.create({
        data: {
          userId: user.id,
          type: "INFO",
          message: notificationMessage,
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          entityType: "USER",
          entityId: user.id,
          action: "USER_OUTREACH_SEND",
          meta: {
            origin: dto.origin ?? null,
            contextId: dto.contextId ?? null,
            notifyByEmail,
            targetRole: user.role,
            targetStatus: user.status,
            messagePreview: message.slice(0, 160),
          },
        },
      }),
    ]);

    if (notifyByEmail && user.email) {
      this.mailService
        .sendAdminOutreachEmail(user.email, getDisplayName(user), message)
        .catch((error: unknown) => console.error(error));
    }

    return { ok: true };
  }

  async monitorContactBypassEvent(id: string, adminId: string) {
    const event = await this.prisma.contactBypassEvent.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        blockedReason: true,
        conversationId: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Événement de contournement introuvable");
    }

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        entityType: "CONTACT_BYPASS_EVENT",
        entityId: id,
        action: "CONTACT_BYPASS_MONITOR",
        meta: {
          senderId: event.senderId,
          blockedReason: event.blockedReason,
          conversationId: event.conversationId,
        },
      },
    });

    return { ok: true };
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
