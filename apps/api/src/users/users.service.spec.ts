import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreditPackType } from "./dto/buy-credits.dto";

describe("UsersService", () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    profile: {
      upsert: jest.fn(),
    },
    packPurchase: {
      create: jest.fn(),
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
});
