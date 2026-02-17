import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, ReliefMissionStatus, UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";
import { PrismaService } from "../prisma/prisma.service";
import { CancelBookingLineDto } from "./dto/cancel-booking-line.dto";
import {
  BookingDetails,
  BookingLine,
  BookingLineStatus,
  BookingLineType,
  BookingsPageData,
} from "./types/bookings.types";

const UNKNOWN_COUNTERPART = "À confirmer";
const SERVICE_ADDRESS_PLACEHOLDER = "Adresse non renseignée";

const NEXT_STEP_STATUSES = new Set<BookingLineStatus>([
  "PENDING",
  "CONFIRMED",
  "PAID",
  "ASSIGNED",
]);

function normalizeMissionStatus(status: ReliefMissionStatus): BookingLineStatus {
  if (status === ReliefMissionStatus.OPEN) {
    return "PENDING";
  }

  if (status === ReliefMissionStatus.ASSIGNED) {
    return "ASSIGNED";
  }

  if (status === ReliefMissionStatus.COMPLETED) {
    return "COMPLETED";
  }

  return "CANCELLED";
}

function sortLinesByDate(lines: BookingLine[]): BookingLine[] {
  return [...lines].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

function pickNextStep(lines: BookingLine[]): BookingLine | null {
  const now = new Date();
  return (
    lines.find(
      (line) =>
        new Date(line.date) > now &&
        line.status !== "CANCELLED" &&
        NEXT_STEP_STATUSES.has(line.status),
    ) ?? null
  );
}

function parseLineType(value: string): BookingLineType {
  if (value === "MISSION" || value === "SERVICE_BOOKING") {
    return value;
  }

  throw new BadRequestException("lineType must be MISSION or SERVICE_BOOKING");
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBookingsPageData(user: AuthenticatedUser): Promise<BookingsPageData> {
    const lines: BookingLine[] = [];

    if (user.role === UserRole.CLIENT) {
      const [missions, serviceBookings] = await this.prisma.$transaction([
        this.prisma.reliefMission.findMany({
          where: {
            clientId: user.id,
          },
          orderBy: {
            dateStart: "asc",
          },
          select: {
            id: true,
            dateStart: true,
            address: true,
            status: true,
            bookings: {
              orderBy: {
                createdAt: "desc",
              },
              select: {
                status: true,
                talent: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.booking.findMany({
          where: {
            clientId: user.id,
            serviceId: {
              not: null,
            },
          },
          orderBy: {
            scheduledAt: "asc",
          },
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            talent: {
              select: {
                email: true,
              },
            },
            service: {
              select: {
                owner: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      for (const mission of missions) {
        const interlocutor =
          mission.bookings.find(
            (booking) =>
              booking.status !== BookingStatus.CANCELLED && Boolean(booking.talent?.email),
          )?.talent?.email ?? UNKNOWN_COUNTERPART;

        lines.push({
          lineId: mission.id,
          lineType: "MISSION",
          date: mission.dateStart.toISOString(),
          typeLabel: "Mission SOS",
          interlocutor,
          status: normalizeMissionStatus(mission.status),
          address: mission.address,
          contactEmail: interlocutor,
        });
      }

      for (const booking of serviceBookings) {
        const interlocutor =
          booking.service?.owner.email ?? booking.talent?.email ?? UNKNOWN_COUNTERPART;

        lines.push({
          lineId: booking.id,
          lineType: "SERVICE_BOOKING",
          date: booking.scheduledAt.toISOString(),
          typeLabel: "Atelier",
          interlocutor,
          status: booking.status,
          address: SERVICE_ADDRESS_PLACEHOLDER,
          contactEmail: interlocutor,
        });
      }
    } else {
      const [missionBookings, serviceBookings] = await this.prisma.$transaction([
        this.prisma.booking.findMany({
          where: {
            talentId: user.id,
            reliefMissionId: {
              not: null,
            },
            reliefMission: {
              is: {
                status: {
                  not: ReliefMissionStatus.OPEN,
                },
              },
            },
          },
          orderBy: {
            scheduledAt: "asc",
          },
          select: {
            reliefMission: {
              select: {
                id: true,
                dateStart: true,
                address: true,
                status: true,
                client: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.booking.findMany({
          where: {
            talentId: user.id,
            serviceId: {
              not: null,
            },
          },
          orderBy: {
            scheduledAt: "asc",
          },
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            client: {
              select: {
                email: true,
              },
            },
          },
        }),
      ]);

      for (const booking of missionBookings) {
        if (!booking.reliefMission) {
          continue;
        }

        const interlocutor = booking.reliefMission.client.email ?? UNKNOWN_COUNTERPART;

        lines.push({
          lineId: booking.reliefMission.id,
          lineType: "MISSION",
          date: booking.reliefMission.dateStart.toISOString(),
          typeLabel: "Mission SOS",
          interlocutor,
          status: normalizeMissionStatus(booking.reliefMission.status),
          address: booking.reliefMission.address,
          contactEmail: interlocutor,
        });
      }

      for (const booking of serviceBookings) {
        const interlocutor = booking.client.email ?? UNKNOWN_COUNTERPART;
        lines.push({
          lineId: booking.id,
          lineType: "SERVICE_BOOKING",
          date: booking.scheduledAt.toISOString(),
          typeLabel: "Atelier",
          interlocutor,
          status: booking.status,
          address: SERVICE_ADDRESS_PLACEHOLDER,
          contactEmail: interlocutor,
        });
      }
    }

    const sortedLines = sortLinesByDate(lines);
    return {
      lines: sortedLines,
      nextStep: pickNextStep(sortedLines),
    };
  }

  async cancelBookingLine(
    input: CancelBookingLineDto,
    user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    if (input.lineType === "MISSION") {
      const mission = await this.prisma.reliefMission.findUnique({
        where: { id: input.lineId },
        select: {
          id: true,
          clientId: true,
        },
      });

      if (!mission) {
        throw new NotFoundException("Mission not found");
      }

      if (user.role === UserRole.CLIENT && mission.clientId !== user.id) {
        throw new ForbiddenException("You cannot cancel this mission");
      }

      if (user.role === UserRole.TALENT) {
        const talentBooking = await this.prisma.booking.findFirst({
          where: {
            reliefMissionId: input.lineId,
            talentId: user.id,
          },
          select: { id: true },
        });

        if (!talentBooking) {
          throw new ForbiddenException("You cannot cancel this mission");
        }
      }

      await this.prisma.$transaction([
        this.prisma.reliefMission.update({
          where: { id: input.lineId },
          data: {
            status: ReliefMissionStatus.CANCELLED,
          },
        }),
        this.prisma.booking.updateMany({
          where: {
            reliefMissionId: input.lineId,
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

    const booking = await this.prisma.booking.findUnique({
      where: { id: input.lineId },
      select: {
        id: true,
        clientId: true,
        talentId: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    if (booking.clientId !== user.id && booking.talentId !== user.id) {
      throw new ForbiddenException("You cannot cancel this booking");
    }

    await this.prisma.booking.update({
      where: { id: input.lineId },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    return { ok: true };
  }

  async getBookingLineDetails(
    lineTypeRaw: string,
    lineId: string,
    user: AuthenticatedUser,
  ): Promise<BookingDetails> {
    const lineType = parseLineType(lineTypeRaw);

    if (lineType === "MISSION") {
      const mission = await this.prisma.reliefMission.findUnique({
        where: { id: lineId },
        select: {
          clientId: true,
          address: true,
          client: {
            select: {
              email: true,
            },
          },
          bookings: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              status: true,
              talentId: true,
              talent: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!mission) {
        throw new NotFoundException("Mission not found");
      }

      if (user.role === UserRole.CLIENT && mission.clientId !== user.id) {
        throw new ForbiddenException("You cannot view this mission");
      }

      if (user.role === UserRole.TALENT) {
        const isParticipant = mission.bookings.some((booking) => booking.talentId === user.id);
        if (!isParticipant) {
          throw new ForbiddenException("You cannot view this mission");
        }
      }

      const contactEmail =
        user.role === UserRole.CLIENT
          ? (mission.bookings.find(
              (booking) =>
                booking.status !== BookingStatus.CANCELLED && Boolean(booking.talent?.email),
            )?.talent?.email ?? UNKNOWN_COUNTERPART)
          : (mission.client.email ?? UNKNOWN_COUNTERPART);

      return {
        address: mission.address,
        contactEmail,
      };
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: lineId },
      select: {
        clientId: true,
        talentId: true,
        client: {
          select: {
            email: true,
          },
        },
        service: {
          select: {
            ownerId: true,
            owner: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const isClientOwner = booking.clientId === user.id;
    const isTalentOwner = booking.talentId === user.id || booking.service?.ownerId === user.id;

    if (!isClientOwner && !isTalentOwner) {
      throw new ForbiddenException("You cannot view this booking");
    }

    const contactEmail = isClientOwner
      ? (booking.service?.owner.email ?? UNKNOWN_COUNTERPART)
      : (booking.client.email ?? UNKNOWN_COUNTERPART);

    return {
      address: SERVICE_ADDRESS_PLACEHOLDER,
      contactEmail,
    };
  }
}
