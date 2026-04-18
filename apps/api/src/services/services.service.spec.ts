import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { ServicesService } from "./services.service";

describe("ServicesService", () => {
  const prisma = {
    service: {
      findUnique: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as any;

  const mailService = {
    sendWorkshopBookingEmail: jest.fn().mockResolvedValue(undefined),
  };

  let service: ServicesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ServicesService(prisma, mailService as any);
  });

  describe("findOne", () => {
    it("retourne un service ACTIF pour tout utilisateur authentifié", async () => {
      const activeService = {
        id: "service-1",
        ownerId: "free-1",
        status: "ACTIVE",
        owner: { profile: null },
      };

      prisma.service.findUnique.mockResolvedValue(activeService);

      await expect(service.findOne("service-1", "est-1")).resolves.toEqual(activeService);
    });

    it("masque un brouillon à un utilisateur non propriétaire", async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: "service-1",
        ownerId: "free-1",
        status: "DRAFT",
        owner: { profile: null },
      });

      await expect(service.findOne("service-1", "est-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("autorise le propriétaire à lire son brouillon", async () => {
      const draftService = {
        id: "service-1",
        ownerId: "free-1",
        status: "DRAFT",
        owner: { profile: null },
      };

      prisma.service.findUnique.mockResolvedValue(draftService);

      await expect(service.findOne("service-1", "free-1")).resolves.toEqual(draftService);
    });
  });

  describe("bookService", () => {
    const activeService = {
      id: "service-1",
      title: "Atelier mémoire",
      ownerId: "free-1",
      status: "ACTIVE",
      capacity: 10,
      type: "WORKSHOP",
    };

    it("crée une réservation valide", async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      prisma.service.findUnique.mockResolvedValue(activeService);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue({ id: "booking-1" });
      prisma.user.findUnique.mockResolvedValue({ email: "est@example.com" });

      await service.bookService("service-1", "est-1", scheduledAt, "Besoin urgent", 4);

      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
        where: {
          serviceId: "service-1",
          establishmentId: "est-1",
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.QUOTE_SENT,
              BookingStatus.QUOTE_ACCEPTED,
              BookingStatus.CONFIRMED,
              BookingStatus.IN_PROGRESS,
            ],
          },
        },
        select: { id: true },
      });
      expect(prisma.booking.create).toHaveBeenCalledWith({
        data: {
          status: BookingStatus.PENDING,
          establishmentId: "est-1",
          freelanceId: "free-1",
          serviceId: "service-1",
          scheduledAt,
          message: "Besoin urgent",
          nbParticipants: 4,
        },
      });
      expect(mailService.sendWorkshopBookingEmail).toHaveBeenCalled();
    });

    it("rejette un doublon actif", async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      prisma.service.findUnique.mockResolvedValue(activeService);
      prisma.booking.findFirst.mockResolvedValue({ id: "booking-existing" });

      await expect(
        service.bookService("service-1", "est-1", scheduledAt, undefined, 2),
      ).rejects.toThrow(ConflictException);
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it("rejette une réservation au-delà de la capacité", async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      prisma.service.findUnique.mockResolvedValue(activeService);

      await expect(
        service.bookService("service-1", "est-1", scheduledAt, undefined, 11),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.booking.findFirst).not.toHaveBeenCalled();
    });

    it("rejette une date passée", async () => {
      prisma.service.findUnique.mockResolvedValue(activeService);

      await expect(
        service.bookService("service-1", "est-1", new Date(Date.now() - 60 * 1000), undefined, 2),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.booking.findFirst).not.toHaveBeenCalled();
    });
  });
});
