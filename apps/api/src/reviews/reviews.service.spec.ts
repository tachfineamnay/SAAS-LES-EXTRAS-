import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, ReviewType } from "@prisma/client";
import { ReviewsService } from "./reviews.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedUser } from "../auth/types/jwt-payload.type";

// ─── Helpers ─────────────────────────────────────────────────────────────

const ESTABLISHMENT_USER: AuthenticatedUser = {
  id: "estab-1",
  email: "etablissement@test.fr",
  role: "ESTABLISHMENT",
};

const FREELANCE_USER: AuthenticatedUser = {
  id: "freelance-1",
  email: "freelance@test.fr",
  role: "FREELANCE",
};

const OUTSIDER_USER: AuthenticatedUser = {
  id: "outsider-1",
  email: "outsider@test.fr",
  role: "FREELANCE",
};

function makeBooking(overrides: Record<string, unknown> = {}) {
  return {
    id: "booking-1",
    status: BookingStatus.COMPLETED,
    establishmentId: ESTABLISHMENT_USER.id,
    freelanceId: FREELANCE_USER.id,
    review: null,
    ...overrides,
  };
}

// ─── Mock PrismaService ──────────────────────────────────────────────────

function createMockPrisma() {
  return {
    booking: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe("ReviewsService", () => {
  let service: ReviewsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // ── create ──────────────────────────────────────────────────────────

  describe("create", () => {
    it("should create a review when establishment reviews freelance after completed booking", async () => {
      const booking = makeBooking();
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.create.mockResolvedValue({ id: "review-1", rating: 4 });

      const result = await service.create(
        {
          bookingId: "booking-1",
          rating: 4,
          comment: "Très bon travail",
          type: ReviewType.ESTABLISHMENT_TO_FREELANCE,
        },
        ESTABLISHMENT_USER,
      );

      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          authorId: ESTABLISHMENT_USER.id,
          targetId: FREELANCE_USER.id,
          rating: 4,
          comment: "Très bon travail",
          type: ReviewType.ESTABLISHMENT_TO_FREELANCE,
        },
      });
      expect(result).toEqual({ id: "review-1", rating: 4 });
    });

    it("should create a review when freelance reviews establishment after completed booking", async () => {
      const booking = makeBooking();
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.create.mockResolvedValue({ id: "review-2", rating: 5 });

      const result = await service.create(
        {
          bookingId: "booking-1",
          rating: 5,
          type: ReviewType.FREELANCE_TO_ESTABLISHMENT,
        },
        FREELANCE_USER,
      );

      expect(prisma.review.create).toHaveBeenCalledWith({
        data: {
          bookingId: "booking-1",
          authorId: FREELANCE_USER.id,
          targetId: ESTABLISHMENT_USER.id,
          rating: 5,
          comment: undefined,
          type: ReviewType.FREELANCE_TO_ESTABLISHMENT,
        },
      });
      expect(result).toEqual({ id: "review-2", rating: 5 });
    });

    it("should allow review on PAID booking", async () => {
      const booking = makeBooking({ status: BookingStatus.PAID });
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.create.mockResolvedValue({ id: "review-3" });

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 3, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).resolves.toBeDefined();
    });

    it("should allow review on COMPLETED_AWAITING_PAYMENT booking", async () => {
      const booking = makeBooking({ status: BookingStatus.COMPLETED_AWAITING_PAYMENT });
      prisma.booking.findUnique.mockResolvedValue(booking);
      prisma.review.create.mockResolvedValue({ id: "review-4" });

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 5, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).resolves.toBeDefined();
    });

    // ── Error cases ──────────────────────────────────────────────────

    it("should throw NotFoundException when booking does not exist", async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { bookingId: "nonexistent", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException when booking is PENDING", async () => {
      prisma.booking.findUnique.mockResolvedValue(
        makeBooking({ status: BookingStatus.PENDING }),
      );

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when booking is CONFIRMED (not completed)", async () => {
      prisma.booking.findUnique.mockResolvedValue(
        makeBooking({ status: BookingStatus.CONFIRMED }),
      );

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when booking is CANCELLED", async () => {
      prisma.booking.findUnique.mockResolvedValue(
        makeBooking({ status: BookingStatus.CANCELLED }),
      );

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException when a review already exists for the booking", async () => {
      prisma.booking.findUnique.mockResolvedValue(
        makeBooking({ review: { id: "existing-review" } }),
      );

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ForbiddenException when user is not a participant", async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          OUTSIDER_USER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw BadRequestException when establishment tries FREELANCE_TO_ESTABLISHMENT type", async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.FREELANCE_TO_ESTABLISHMENT },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when freelance tries ESTABLISHMENT_TO_FREELANCE type", async () => {
      prisma.booking.findUnique.mockResolvedValue(makeBooking());

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          FREELANCE_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when booking has no freelance (no target)", async () => {
      prisma.booking.findUnique.mockResolvedValue(
        makeBooking({ freelanceId: null }),
      );

      await expect(
        service.create(
          { bookingId: "booking-1", rating: 4, type: ReviewType.ESTABLISHMENT_TO_FREELANCE },
          ESTABLISHMENT_USER,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── findByTarget ────────────────────────────────────────────────────

  describe("findByTarget", () => {
    it("should return reviews for a target user ordered by createdAt desc", async () => {
      const reviews = [
        { id: "r1", rating: 5, createdAt: new Date("2026-03-15") },
        { id: "r2", rating: 3, createdAt: new Date("2026-03-10") },
      ];
      prisma.review.findMany.mockResolvedValue(reviews);

      const result = await service.findByTarget("freelance-1");

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { targetId: "freelance-1" },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(reviews);
    });
  });

  // ── getAverageRating ────────────────────────────────────────────────

  describe("getAverageRating", () => {
    it("should return average and count", async () => {
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 12 },
      });

      const result = await service.getAverageRating("freelance-1");

      expect(result).toEqual({ average: 4.5, count: 12 });
    });

    it("should return 0 average and 0 count when no reviews exist", async () => {
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });

      const result = await service.getAverageRating("unknown-user");

      expect(result).toEqual({ average: 0, count: 0 });
    });
  });

  // ── findByBooking ──────────────────────────────────────────────────

  describe("findByBooking", () => {
    it("should return review for a booking", async () => {
      const review = { id: "r1", bookingId: "booking-1", rating: 4 };
      prisma.review.findUnique.mockResolvedValue(review);

      const result = await service.findByBooking("booking-1");

      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: { bookingId: "booking-1" },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: { firstName: true, lastName: true, avatar: true },
              },
            },
          },
        },
      });
      expect(result).toEqual(review);
    });

    it("should return null when no review exists for booking", async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      const result = await service.findByBooking("booking-no-review");
      expect(result).toBeNull();
    });
  });
});
