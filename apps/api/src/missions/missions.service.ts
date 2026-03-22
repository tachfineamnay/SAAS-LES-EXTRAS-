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

  async createMission(dto: CreateMissionDto, establishmentId: string) {
    let dateStartStr = dto.dateStart;
    let dateEndStr = dto.dateEnd;

    if (dto.slots && dto.slots.length > 0) {
      const starts = dto.slots.map((s) => new Date(`${s.date}T${s.heureDebut}`).getTime());
      const ends = dto.slots.map((s) => new Date(`${s.date}T${s.heureFin}`).getTime());
      dateStartStr = new Date(Math.min(...starts)).toISOString();
      dateEndStr = new Date(Math.max(...ends)).toISOString();
    }

    const dateStart = new Date(dateStartStr);
    const dateEnd = new Date(dateEndStr);

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
        establishmentId,
        status: ReliefMissionStatus.OPEN,
        metier: dto.metier,
        shift: dto.shift,
        city: dto.city,
        zipCode: dto.zipCode,
        description: dto.description,
        requiredSkills: dto.requiredSkills ?? [],
        exactAddress: dto.exactAddress,
        accessInstructions: dto.accessInstructions,
        establishmentType: dto.establishmentType,
        targetPublic: dto.targetPublic ?? [],
        unitSize: dto.unitSize,
        slots: dto.slots ? (dto.slots as any) : null,
        diplomaRequired: dto.diplomaRequired ?? false,
        hasTransmissions: dto.hasTransmissions ?? false,
        transmissionTime: dto.transmissionTime,
        perks: dto.perks ?? [],
      },
    });
  }

  async findAll(filter: FindMissionsQueryDto) {
    const where: Prisma.ReliefMissionWhereInput = {
      status: ReliefMissionStatus.OPEN,
    };

    if (filter.city) {
      where.city = {
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

    const missions = await this.prisma.reliefMission.findMany({
      where,
      orderBy: {
        dateStart: "asc",
      },
      include: {
        establishment: {
          include: {
            profile: true,
          },
        },
      },
    });
    return missions.map((m: any) => ({ ...m, isRenfort: true as const }));
  }

  async apply(missionId: string, freelanceId: string, dto: ApplyMissionDto = {}) {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        establishmentId: true,
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
        freelanceId,
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new ConflictException("Already applied to this mission");
    }

    return this.prisma.booking.create({
      data: {
        status: BookingStatus.PENDING,
        establishmentId: mission.establishmentId,
        freelanceId,
        reliefMissionId: mission.id,
        scheduledAt: mission.dateStart,
        message: dto.motivation, // mapped from motivation for compatibility
        proposedRate: dto.proposedRate,
      },
    });
  }

  async getManagedMissions(establishmentId: string) {
    const missions = await this.prisma.reliefMission.findMany({
      where: {
        establishmentId,
        // No status filter: returns full history (OPEN, ASSIGNED, COMPLETED, CANCELLED)
      },
      orderBy: { dateStart: 'asc' },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            freelance: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });
    return missions.map((m: any) => ({ ...m, isRenfort: true as const }));
  }

  async getMission(id: string) {
    const mission = await this.prisma.reliefMission.findUnique({
      where: { id },
      include: {
        establishment: {
          include: {
            profile: true,
          },
        },
      },
    });
    if (!mission) {
      throw new NotFoundException("Mission not found");
    }
    return { ...mission, isRenfort: true as const };
  }
}
