import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreditPackType } from "./dto/buy-credits.dto";

describe("UsersService", () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    profile: {
      upsert: jest.fn(),
    },
    packPurchase: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback: (tx: typeof prisma) => unknown) => callback(prisma));
    service = new UsersService(prisma);
  });

  describe("buyCredits", () => {
    it("achète un pack et incrémente les crédits disponibles", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "est-1" });
      prisma.packPurchase.create.mockResolvedValue({ id: "pack-1" });
      prisma.profile.upsert.mockResolvedValue({ availableCredits: 4 });

      const result = await service.buyCredits("est-1", { packType: CreditPackType.PRO });

      expect(prisma.packPurchase.create).toHaveBeenCalledWith({
        data: {
          establishmentId: "est-1",
          amount: 400,
          creditsAdded: 3,
        },
      });
      expect(prisma.profile.upsert).toHaveBeenCalledWith({
        where: { userId: "est-1" },
        create: {
          userId: "est-1",
          firstName: "",
          lastName: "",
          skills: [],
          availableCredits: 3,
        },
        update: {
          availableCredits: {
            increment: 3,
          },
        },
        select: {
          availableCredits: true,
        },
      });
      expect(result).toEqual({ availableCredits: 4 });
    });

    it("autorise aussi un freelance à acheter un pack", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "free-1" });
      prisma.packPurchase.create.mockResolvedValue({ id: "pack-2" });
      prisma.profile.upsert.mockResolvedValue({ availableCredits: 1 });

      const result = await service.buyCredits("free-1", { packType: CreditPackType.STARTER });

      expect(prisma.packPurchase.create).toHaveBeenCalledWith({
        data: {
          establishmentId: "free-1",
          amount: 150,
          creditsAdded: 1,
        },
      });
      expect(result).toEqual({ availableCredits: 1 });
    });

    it("rejette un pack invalide proprement", async () => {
      await expect(
        service.buyCredits("est-1", { packType: "INVALID" as CreditPackType }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("rejette l'achat si l'utilisateur n'existe pas", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.buyCredits("missing-user", { packType: CreditPackType.STARTER }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("getCredits", () => {
    it("retourne le solde de crédits du profil", async () => {
      prisma.user.findUnique.mockResolvedValue({
        profile: {
          availableCredits: 2,
        },
      });

      await expect(service.getCredits("user-1")).resolves.toEqual({
        availableCredits: 2,
      });
    });

    it("retourne 0 si le profil existe sans crédits initialisés", async () => {
      prisma.user.findUnique.mockResolvedValue({
        profile: null,
      });

      await expect(service.getCredits("user-1")).resolves.toEqual({
        availableCredits: 0,
      });
    });
  });

  describe("getCreditHistory", () => {
    it("retourne les 10 derniers achats du solde", async () => {
      const createdAt = new Date("2026-04-18T10:00:00.000Z");
      prisma.user.findUnique.mockResolvedValue({ id: "est-1" });
      prisma.packPurchase.findMany.mockResolvedValue([
        {
          id: "purchase-1",
          amount: 400,
          creditsAdded: 3,
          createdAt,
        },
      ]);

      const result = await service.getCreditHistory("est-1");

      expect(prisma.packPurchase.findMany).toHaveBeenCalledWith({
        where: { establishmentId: "est-1" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          creditsAdded: true,
          createdAt: true,
        },
      });
      expect(result).toEqual([
        {
          id: "purchase-1",
          amount: 400,
          creditsAdded: 3,
          createdAt,
        },
      ]);
    });

    it("rejette la lecture si l'utilisateur n'existe pas", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCreditHistory("missing-user")).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.packPurchase.findMany).not.toHaveBeenCalled();
    });
  });

  describe("findAllFreelances", () => {
    it("retourne uniquement les freelances VERIFIED pour l'annuaire", async () => {
      const freelances = [
        {
          id: "free-verified",
          email: "verified@example.com",
          role: "FREELANCE",
          status: "VERIFIED",
          profile: null,
        },
      ];
      prisma.user.findMany.mockResolvedValue(freelances);

      await expect(service.findAllFreelances()).resolves.toEqual(freelances);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: "FREELANCE",
          status: "VERIFIED",
        },
        include: {
          profile: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });
  });
});
