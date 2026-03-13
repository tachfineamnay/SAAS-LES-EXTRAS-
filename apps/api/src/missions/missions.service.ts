import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BookingStatus,
  Prisma,
  ReliefMissionStatus,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ApplyMissionDto } from "./dto/apply-mission.dto";
import { CreateMissionDto } from "./dto/create-mission.dto";
import { FindMissionsQueryDto } from "./dto/find-missions-query.dto";

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) { }

  async createMission(dto: CreateMissionDto, clientId: string) {
    const dateStart = new Date(dto.dateStart);
    const dateEnd = new Date(dto.dateEnd);

    if (dateEnd <= dateStart) {
      throw new BadRequestException("dateEnd must be after dateStart");
    }

    return this.prisma.reliefMission.create({
      data: {
        title: dto.title,
        dateStart,
        dateEnd,
        hourlyRate: dto.hourlyRate,
        address: dto.address,
        isRenfort: dto.isRenfort ?? false,
        clientId,
        status: ReliefMissionStatus.OPEN,
        // Extended SOS Renfort fields
        metier: dto.metier,
        shift: dto.shift,
        city: dto.city,
        zipCode: dto.zipCode,
        slots: dto.slots ? (dto.slots as unknown as Prisma.InputJsonValue) : undefined,
        // SOS Renfort v2 — contexte clinique
        description: dto.description,
        establishmentType: dto.establishmentType,
        targetPublic: dto.targetPublic ?? [],
        unitSize: dto.unitSize,
        requiredSkills: dto.requiredSkills ?? [],
        diplomaRequired: dto.diplomaRequired ?? true,
        // SOS Renfort v2 — logistique
        hasTransmissions: dto.hasTransmissions ?? false,
        transmissionTime: dto.transmissionTime,
        perks: dto.perks ?? [],
        exactAddress: dto.exactAddress,
        accessInstructions: dto.accessInstructions,
      },
    });
  }

  async findAll(filter: FindMissionsQueryDto) {
    const where: Prisma.ReliefMissionWhereInput = {
      status: ReliefMissionStatus.OPEN,
    };

    if (filter.city) {
      where.address = {
        contains: filter.city,
        mode: "insensitive",
      };
    }

    if (filter.date) {
      const dayStart = new Date(`${filter.date}T00:00:00.000Z`);
      const dayEnd = new Date(`${filter.date}T23:59:59.999Z`);

      if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
        throw new BadRequestException("Invalid date");
      }

      where.AND = [{ dateStart: { lte: dayEnd } }, { dateEnd: { gte: dayStart } }];
    }

    return this.prisma.reliefMission.findMany({
      where,
      orderBy: {
        dateStart: "asc",
      },
      include: {
        client: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async apply(missionId: string, talentId: string, dto: ApplyMissionDto = {}) {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        clientId: true,
        dateStart: true,
        status: true,
      },
    });

    if (!mission) {
      throw new NotFoundException("Mission not found");
    }

    if (mission.status !== ReliefMissionStatus.OPEN) {
      throw new BadRequestException("Mission is not open");
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        reliefMissionId: missionId,
        talentId,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException("Already applied to this mission");
    }

    return this.prisma.booking.create({
      data: {
        status: BookingStatus.PENDING,
        clientId: mission.clientId,
        talentId,
        reliefMissionId: mission.id,
        scheduledAt: mission.dateStart,
        motivation: dto.motivation,
        proposedRate: dto.proposedRate,
      },
    });
  }

  async getManagedMissions(clientId: string) {
    return this.prisma.reliefMission.findMany({
      where: {
        clientId,
        status: { in: [ReliefMissionStatus.OPEN, ReliefMissionStatus.ASSIGNED] },
      },
      orderBy: { dateStart: 'asc' },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            talent: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });
  }
}
