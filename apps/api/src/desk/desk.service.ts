import { Injectable, NotFoundException } from "@nestjs/common";
import { DeskRequestStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
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

@Injectable()
export class DeskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.deskRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mission: { select: MISSION_SELECT },
        requester: { select: REQUESTER_SELECT },
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

  async updateStatus(id: string, dto: UpdateDeskRequestStatusDto) {
    const request = await this.prisma.deskRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("Demande introuvable");

    return this.prisma.deskRequest.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async respond(id: string, adminId: string, dto: RespondDeskRequestDto) {
    const request = await this.prisma.deskRequest.findUnique({
      where: { id },
      select: { id: true, requesterId: true, missionId: true, mission: { select: { title: true } } },
    });
    if (!request) throw new NotFoundException("Demande introuvable");

    const updated = await this.prisma.deskRequest.update({
      where: { id },
      data: {
        response: dto.response,
        answeredById: adminId,
        answeredAt: new Date(),
        status: DeskRequestStatus.ANSWERED,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.requesterId,
        type: "INFO",
        message: `Votre demande sur la mission « ${request.mission.title} » a reçu une réponse. Consultez-la dans votre espace Mes demandes.`,
      },
    });

    return updated;
  }
}
