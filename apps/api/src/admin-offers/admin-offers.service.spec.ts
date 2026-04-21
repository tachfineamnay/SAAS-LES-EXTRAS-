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
