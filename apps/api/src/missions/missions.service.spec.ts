import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ReliefMissionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MissionsService } from "./missions.service";

describe("MissionsService", () => {
  let service: MissionsService;

  const mockPrisma = {
    reliefMission: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MissionsService>(MissionsService);
    jest.clearAllMocks();
  });

  describe("createMission", () => {
    it("derives the persisted envelope from sorted slots", async () => {
      (mockPrisma.reliefMission.create as jest.Mock).mockResolvedValue({ id: "mission-1" });

      await service.createMission(
        {
          title: "Renfort",
          dateStart: "2026-05-01T08:00:00.000Z",
          dateEnd: "2026-05-01T18:00:00.000Z",
          hourlyRate: 28,
          address: "1 rue des Lilas",
          slots: [
            { date: "2026-05-07", heureDebut: "14:00", heureFin: "18:00" },
            { date: "2026-05-05", heureDebut: "08:00", heureFin: "12:00" },
          ],
        },
        "est-1",
      );

      expect(mockPrisma.reliefMission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-05T08:00:00"),
            dateEnd: new Date("2026-05-07T18:00:00"),
            slots: [
              { date: "2026-05-05", heureDebut: "08:00", heureFin: "12:00" },
              { date: "2026-05-07", heureDebut: "14:00", heureFin: "18:00" },
            ],
          }),
        }),
      );
    });

    it("rejects overlapping slots", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-05-01T09:00:00.000Z"));

      await expect(
        service.createMission(
          {
            title: "Renfort",
            dateStart: "2026-05-10T08:00:00.000Z",
            dateEnd: "2026-05-10T18:00:00.000Z",
            hourlyRate: 28,
            address: "1 rue des Lilas",
            slots: [
              { date: "2026-05-10", heureDebut: "08:00", heureFin: "12:00" },
              { date: "2026-05-10", heureDebut: "11:00", heureFin: "14:00" },
            ],
          },
          "est-1",
        ),
      ).rejects.toThrow(BadRequestException);

      jest.useRealTimers();
    });

    it("keeps the legacy envelope when slots are omitted", async () => {
      (mockPrisma.reliefMission.create as jest.Mock).mockResolvedValue({ id: "mission-legacy" });

      await service.createMission(
        {
          title: "Renfort",
          dateStart: "2026-05-12T08:00:00.000Z",
          dateEnd: "2026-05-12T18:00:00.000Z",
          hourlyRate: 28,
          address: "1 rue des Lilas",
        },
        "est-1",
      );

      expect(mockPrisma.reliefMission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-12T08:00:00.000Z"),
            dateEnd: new Date("2026-05-12T18:00:00.000Z"),
            slots: null,
          }),
        }),
      );
    });
  });

  describe("findAll", () => {
    it("filters by slot presence on the requested date and keeps the legacy fallback", async () => {
      (mockPrisma.reliefMission.findMany as jest.Mock).mockResolvedValue([
        {
          id: "mission-sparse",
          title: "Mission sparse",
          dateStart: new Date("2026-05-05T08:00:00.000Z"),
          dateEnd: new Date("2026-05-07T18:00:00.000Z"),
          hourlyRate: 28,
          address: "1 rue des Lilas",
          status: ReliefMissionStatus.OPEN,
          city: "Paris",
          slots: [
            { date: "2026-05-05", heureDebut: "08:00", heureFin: "12:00" },
            { date: "2026-05-07", heureDebut: "14:00", heureFin: "18:00" },
          ],
          establishment: { profile: null },
        },
        {
          id: "mission-legacy",
          title: "Mission legacy",
          dateStart: new Date("2026-05-06T08:00:00.000Z"),
          dateEnd: new Date("2026-05-06T18:00:00.000Z"),
          hourlyRate: 30,
          address: "2 rue Victor Hugo",
          status: ReliefMissionStatus.OPEN,
          city: "Paris",
          slots: null,
          establishment: { profile: null },
        },
      ]);

      const results = await service.findAll({ date: "2026-05-06" });

      expect(results.map((mission: { id: string }) => mission.id)).toEqual(["mission-legacy"]);
    });
  });
});
