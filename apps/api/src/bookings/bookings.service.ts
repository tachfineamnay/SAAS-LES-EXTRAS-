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
import { ActionBookingDto } from "./dto/action-booking.dto";
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
  "COMPLETED",
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
  constructor(private readonly prisma: PrismaService) { }

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
                id: true,
                status: true,
                talent: {
                  select: {
                    email: true,
                  },
                },
                invoice: {
                  select: {
                    url: true,
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
            invoice: {
              select: {
                url: true,
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
          relatedBookingId: mission.bookings.find(
            (b) =>
              b.status !== BookingStatus.CANCELLED && Boolean(b.talent?.email),
          )?.id,
          invoiceUrl: mission.bookings.find(
            (b) => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.PAID,
          )?.invoice?.url,
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
          relatedBookingId: booking.id,
          invoiceUrl: booking.invoice?.url,
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
            id: true,
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
            invoice: {
              select: {
                url: true,
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
            invoice: {
              select: {
                url: true,
              },
            },
          },
        }),
      ]);

      for (const mb of missionBookings) {
        if (!mb.reliefMission) {
          continue;
        }

        const interlocutor = mb.reliefMission.client.email ?? UNKNOWN_COUNTERPART;

        lines.push({
          lineId: mb.reliefMission.id,
          lineType: "MISSION",
          date: mb.reliefMission.dateStart.toISOString(),
          typeLabel: "Mission SOS",
          interlocutor,
          status: normalizeMissionStatus(mb.reliefMission.status),
          address: mb.reliefMission.address,
          contactEmail: interlocutor,
          relatedBookingId: mb.id,
          invoiceUrl: mb.invoice?.url,
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
          relatedBookingId: booking.id,
          invoiceUrl: booking.invoice?.url,
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

  async confirmBooking(
    bookingId: string,
    user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        reliefMission: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    const isMissionClient =
      booking.reliefMission && booking.reliefMission.clientId === user.id;
    const isServiceOwner =
      booking.service && booking.service.ownerId === user.id;

    if (!isMissionClient && !isServiceOwner) {
      throw new ForbiddenException("You cannot confirm this booking");
    }

    if (booking.status !== "PENDING") {
      throw new BadRequestException("Booking is not pending");
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
      },
    });

    return { ok: true };
  }

  async completeBooking(
    bookingId: string,
    user: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        reliefMission: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Authorization: Mission Client (Director) or Service Client (Attendee?? No, usually Provider marks complete? Or Client?)
    // In "les-extras", the Client recruits. So Client validates work is done.

    // For Service (Atelier):
    // If I buy a ticket, the event happens.
    // Maybe the Owner checks me in -> Completed?
    // Let's assume for now Client (Booking owner) or Mission Client can complete.

    // Actually, usually the one paying validates completion?
    // Mission: Client pays Talent. Client validates.
    // Service: Client pays Owner. Client attends?

    // Let's restrain to Mission Client for now as that's the main "extras" flow.
    const isMissionClient =
      booking.reliefMission && booking.reliefMission.clientId === user.id;

    if (!isMissionClient) {
      // If it's a service, maybe just auto-complete on date?
      // For now, allow simple completion if user is involved?
      // Let's start with Mission Client only for manual completion.
      if (booking.service) {
        // Service flow might be different (e.g. scan QR).
        // Let's allow Service Owner to complete?
        if (booking.service.ownerId !== user.id) {
          throw new ForbiddenException("You cannot complete this booking");
        }
      } else {
        throw new ForbiddenException("You cannot complete this booking");
      }
    }

    if (booking.status !== "CONFIRMED") {
      throw new BadRequestException("Booking must be confirmed before completion");
    }

    const amount = booking.reliefMission
      ? (booking.reliefMission.hourlyRate *
        (booking.reliefMission.dateEnd.getTime() - booking.reliefMission.dateStart.getTime())) /
      (1000 * 60 * 60)
      : (booking.service?.price ?? 0);

    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      }),
      this.prisma.invoice.create({
        data: {
          bookingId: booking.id,
          amount: Math.round(amount * 100) / 100,
          url: `/invoices/${booking.id}.pdf`,
        },
      }),
    ]);

    return { ok: true };
  }
}
