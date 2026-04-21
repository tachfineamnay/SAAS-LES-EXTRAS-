import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import { AdminUsersService } from "./admin-users.service";

describe("AdminUsersService", () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    adminActionLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((queries: Array<Promise<unknown>>) => Promise.all(queries)),
  } as any;

  let service: AdminUsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminUsersService(prisma);
  });

  it("valide un utilisateur et journalise l'action", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      status: UserStatus.PENDING,
    });
    prisma.user.update.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.verifyUser("user-1", "admin-1")).resolves.toEqual({ ok: true });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { status: UserStatus.VERIFIED },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "USER",
        entityId: "user-1",
        action: "USER_VERIFY",
        meta: {
          previousStatus: UserStatus.PENDING,
          nextStatus: UserStatus.VERIFIED,
        },
      }),
    });
  });

  it("bannit un utilisateur et journalise l'action", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      status: UserStatus.VERIFIED,
    });
    prisma.user.update.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.banUser("user-1", "admin-1")).resolves.toEqual({ ok: true });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { status: UserStatus.BANNED },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "USER",
        entityId: "user-1",
        action: "USER_BAN",
        meta: {
          previousStatus: UserStatus.VERIFIED,
          nextStatus: UserStatus.BANNED,
        },
      }),
    });
  });

  it("interdit à un admin de bannir son propre compte", async () => {
    await expect(service.banUser("admin-1", "admin-1")).rejects.toThrow(BadRequestException);
  });

  it("lève NotFoundException si l'utilisateur à valider n'existe pas", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.verifyUser("missing", "admin-1")).rejects.toThrow(NotFoundException);
  });
});
