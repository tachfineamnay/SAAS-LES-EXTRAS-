import { NotFoundException } from "@nestjs/common";
import { BookingStatus, ReliefMissionStatus } from "@prisma/client";
import { AdminOffersService } from "./admin-offers.service";

describe("AdminOffersService", () => {
  const prisma = {
    reliefMission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      updateMany: jest.fn(),
    },
    service: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    adminActionLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((queries: Array<Promise<unknown>>) => Promise.all(queries)),
  } as any;

  let service: AdminOffersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminOffersService(prisma);
  });

  it("journalise la suppression logique d'une mission", async () => {
    prisma.reliefMission.findUnique.mockResolvedValue({
      id: "mission-1",
      status: ReliefMissionStatus.OPEN,
    });
    prisma.reliefMission.update.mockResolvedValue({});
    prisma.booking.updateMany.mockResolvedValue({ count: 1 });
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.deleteMission("mission-1", "admin-1")).resolves.toEqual({ ok: true });

    expect(prisma.reliefMission.update).toHaveBeenCalledWith({
      where: { id: "mission-1" },
      data: { status: ReliefMissionStatus.CANCELLED },
    });
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: {
        reliefMissionId: "mission-1",
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
      data: { status: BookingStatus.CANCELLED },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "MISSION",
        entityId: "mission-1",
        action: "MISSION_DELETE",
      }),
    });
  });

  it("retourne le détail d'une mission avec ses demandes Desk liées", async () => {
    prisma.reliefMission.findUnique.mockResolvedValue({
      id: "mission-1",
      title: "Mission de nuit",
      status: ReliefMissionStatus.OPEN,
      address: "12 rue du Test, Paris",
      dateStart: new Date("2026-04-20T08:00:00.000Z"),
      dateEnd: new Date("2026-04-20T16:00:00.000Z"),
      hourlyRate: 28,
      establishment: {
        email: "est@example.com",
        profile: {
          firstName: "Luc",
          lastName: "Martin",
        },
      },
      bookings: [{ id: "booking-1" }, { id: "booking-2" }],
      deskRequests: [
        {
          id: "desk-1",
          status: "OPEN",
          priority: "HIGH",
          createdAt: new Date("2026-04-18T10:00:00.000Z"),
          message: "Bonjour, je voudrais des informations complémentaires sur le rythme de nuit prévu sur cette mission.",
        },
      ],
    });

    await expect(service.getMissionById("mission-1")).resolves.toEqual({
      id: "mission-1",
      title: "Mission de nuit",
      status: ReliefMissionStatus.OPEN,
      establishmentName: "Luc Martin",
      establishmentEmail: "est@example.com",
      address: "12 rue du Test, Paris",
      dateStart: "2026-04-20T08:00:00.000Z",
      dateEnd: "2026-04-20T16:00:00.000Z",
      hourlyRate: 28,
      candidatesCount: 2,
      linkedDeskRequests: [
        expect.objectContaining({
          id: "desk-1",
          status: "OPEN",
          priority: "HIGH",
          createdAt: "2026-04-18T10:00:00.000Z",
        }),
      ],
    });
  });

  it("toggle isFeatured et journalise l'action", async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: "service-1",
      isFeatured: false,
    });
    prisma.service.update.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.featureService("service-1", "admin-1")).resolves.toEqual({ ok: true });

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: "service-1" },
      data: { isFeatured: true },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "SERVICE",
        entityId: "service-1",
        action: "SERVICE_FEATURE",
        meta: {
          previousIsFeatured: false,
          nextIsFeatured: true,
        },
      }),
    });
  });

  it("retourne le détail d'un service", async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: "service-1",
      title: "Atelier mémoire",
      type: "WORKSHOP",
      price: 140,
      isFeatured: true,
      isHidden: false,
      description: "Un atelier en petit groupe.",
      createdAt: new Date("2026-04-10T08:00:00.000Z"),
      owner: {
        email: "freelance@example.com",
        profile: {
          firstName: "Nora",
          lastName: "Diallo",
        },
      },
    });

    await expect(service.getServiceById("service-1")).resolves.toEqual({
      id: "service-1",
      title: "Atelier mémoire",
      type: "WORKSHOP",
      price: 140,
      freelanceName: "Nora Diallo",
      freelanceEmail: "freelance@example.com",
      isFeatured: true,
      isHidden: false,
      description: "Un atelier en petit groupe.",
      createdAt: "2026-04-10T08:00:00.000Z",
    });
  });

  it("toggle isHidden et journalise l'action", async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: "service-1",
      isHidden: true,
    });
    prisma.service.update.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.hideService("service-1", "admin-1")).resolves.toEqual({ ok: true });

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: "service-1" },
      data: { isHidden: false },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "SERVICE",
        entityId: "service-1",
        action: "SERVICE_HIDE",
        meta: {
          previousIsHidden: true,
          nextIsHidden: false,
        },
      }),
    });
  });

  it("lève NotFoundException si le service à modérer n'existe pas", async () => {
    prisma.service.findUnique.mockResolvedValue(null);

    await expect(service.featureService("missing", "admin-1")).rejects.toThrow(NotFoundException);
  });
});
