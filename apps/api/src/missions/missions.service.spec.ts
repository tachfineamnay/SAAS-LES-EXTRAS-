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
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    deskRequest: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((queries: Array<Promise<unknown>>) => Promise.all(queries)),
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
    it("creates one multi-day mission from sorted planning", async () => {
      (mockPrisma.reliefMission.create as jest.Mock).mockResolvedValue({ id: "mission-longue" });

      const result = await service.createMission(
        {
          title: "Renfort",
          hourlyRate: 28,
          address: "1 rue des Lilas",
          publicationMode: "MULTI_DAY_SINGLE_BOOKING",
          planning: [
            {
              dateStart: "2026-05-07",
              heureDebut: "14:00",
              dateEnd: "2026-05-07",
              heureFin: "18:00",
            },
            {
              dateStart: "2026-05-05",
              heureDebut: "08:00",
              dateEnd: "2026-05-06",
              heureFin: "07:00",
            },
          ],
        },
        "est-1",
      );

      expect(result).toEqual({
        createdMissionIds: ["mission-longue"],
        createdCount: 1,
        publicationMode: "MULTI_DAY_SINGLE_BOOKING",
      });
      expect(mockPrisma.reliefMission.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.reliefMission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-05T08:00:00"),
            dateEnd: new Date("2026-05-07T18:00:00"),
            slots: [
              {
                dateStart: "2026-05-05",
                heureDebut: "08:00",
                dateEnd: "2026-05-06",
                heureFin: "07:00",
              },
              {
                dateStart: "2026-05-07",
                heureDebut: "14:00",
                dateEnd: "2026-05-07",
                heureFin: "18:00",
              },
            ],
          }),
        }),
      );
    });

    it("creates one mission per planning line in batch mode", async () => {
      (mockPrisma.reliefMission.create as jest.Mock)
        .mockResolvedValueOnce({ id: "mission-1" })
        .mockResolvedValueOnce({ id: "mission-2" });

      const result = await service.createMission(
        {
          title: "Renfort",
          hourlyRate: 28,
          address: "1 rue des Lilas",
          publicationMode: "MULTI_MISSION_BATCH",
          planning: [
            {
              dateStart: "2026-05-05",
              heureDebut: "08:00",
              dateEnd: "2026-05-05",
              heureFin: "12:00",
            },
            {
              dateStart: "2026-05-07",
              heureDebut: "14:00",
              dateEnd: "2026-05-07",
              heureFin: "18:00",
            },
          ],
        },
        "est-1",
      );

      expect(result).toEqual({
        createdMissionIds: ["mission-1", "mission-2"],
        createdCount: 2,
        publicationMode: "MULTI_MISSION_BATCH",
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.reliefMission.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.reliefMission.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-05T08:00:00"),
            dateEnd: new Date("2026-05-05T12:00:00"),
            slots: [
              {
                dateStart: "2026-05-05",
                heureDebut: "08:00",
                dateEnd: "2026-05-05",
                heureFin: "12:00",
              },
            ],
          }),
        }),
      );
      expect(mockPrisma.reliefMission.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-07T14:00:00"),
            dateEnd: new Date("2026-05-07T18:00:00"),
            slots: [
              {
                dateStart: "2026-05-07",
                heureDebut: "14:00",
                dateEnd: "2026-05-07",
                heureFin: "18:00",
              },
            ],
          }),
        }),
      );
    });

    it("rejects overlapping planning lines", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-05-01T09:00:00.000Z"));

      await expect(
        service.createMission(
          {
            title: "Renfort",
            hourlyRate: 28,
            address: "1 rue des Lilas",
            planning: [
              {
                dateStart: "2026-05-10",
                heureDebut: "08:00",
                dateEnd: "2026-05-10",
                heureFin: "12:00",
              },
              {
                dateStart: "2026-05-10",
                heureDebut: "11:00",
                dateEnd: "2026-05-10",
                heureFin: "14:00",
              },
            ],
          },
          "est-1",
        ),
      ).rejects.toThrow(BadRequestException);

      jest.useRealTimers();
    });

    it("keeps the single-mission legacy flow when old slots are provided", async () => {
      (mockPrisma.reliefMission.create as jest.Mock).mockResolvedValue({ id: "mission-legacy-slots" });

      const result = await service.createMission(
        {
          title: "Renfort",
          hourlyRate: 28,
          address: "1 rue des Lilas",
          slots: [
            { date: "2026-05-12", heureDebut: "08:00", heureFin: "18:00" },
          ],
        },
        "est-1",
      );

      expect(result).toEqual({
        createdMissionIds: ["mission-legacy-slots"],
        createdCount: 1,
        publicationMode: "MULTI_DAY_SINGLE_BOOKING",
      });
      expect(mockPrisma.reliefMission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dateStart: new Date("2026-05-12T08:00:00"),
            dateEnd: new Date("2026-05-12T18:00:00"),
            slots: [
              {
                dateStart: "2026-05-12",
                heureDebut: "08:00",
                dateEnd: "2026-05-12",
                heureFin: "18:00",
              },
            ],
          }),
        }),
      );
    });

    it("keeps the legacy envelope when planning is omitted", async () => {
      (mockPrisma.reliefMission.create as jest.Mock).mockResolvedValue({ id: "mission-legacy" });

      const result = await service.createMission(
        {
          title: "Renfort",
          dateStart: "2026-05-12T08:00:00.000Z",
          dateEnd: "2026-05-12T18:00:00.000Z",
          hourlyRate: 28,
          address: "1 rue des Lilas",
        },
        "est-1",
      );

      expect(result).toEqual({
        createdMissionIds: ["mission-legacy"],
        createdCount: 1,
        publicationMode: "MULTI_DAY_SINGLE_BOOKING",
      });
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
    it("ne demande à Prisma que les missions OPEN pour le catalogue freelance", async () => {
      (mockPrisma.reliefMission.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAll({});

      expect(mockPrisma.reliefMission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: ReliefMissionStatus.OPEN,
          },
        }),
      );
    });

    it("filters by planning overlap on the requested date and keeps the legacy fallback", async () => {
      (mockPrisma.reliefMission.findMany as jest.Mock).mockResolvedValue([
        {
          id: "mission-nuit",
          title: "Mission de nuit",
          dateStart: new Date("2026-05-05T21:00:00.000Z"),
          dateEnd: new Date("2026-05-06T07:00:00.000Z"),
          hourlyRate: 28,
          address: "1 rue des Lilas",
          status: ReliefMissionStatus.OPEN,
          city: "Paris",
          slots: [
            {
              dateStart: "2026-05-05",
              heureDebut: "21:00",
              dateEnd: "2026-05-06",
              heureFin: "07:00",
            },
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
        {
          id: "mission-other-day",
          title: "Mission other day",
          dateStart: new Date("2026-05-07T08:00:00.000Z"),
          dateEnd: new Date("2026-05-07T18:00:00.000Z"),
          hourlyRate: 30,
          address: "3 rue Victor Hugo",
          status: ReliefMissionStatus.OPEN,
          city: "Paris",
          slots: [
            {
              dateStart: "2026-05-07",
              heureDebut: "08:00",
              dateEnd: "2026-05-07",
              heureFin: "18:00",
            },
          ],
          establishment: { profile: null },
        },
      ]);

      const results = await service.findAll({ date: "2026-05-06" });

      expect(results.map((mission: { id: string }) => mission.id)).toEqual([
        "mission-nuit",
        "mission-legacy",
      ]);
      expect(results[0]).toMatchObject({
        planning: [
          {
            dateStart: "2026-05-05",
            heureDebut: "21:00",
            dateEnd: "2026-05-06",
            heureFin: "07:00",
          },
        ],
      });
    });
  });

  describe("requestInfo", () => {
    it("crée une demande Desk sans notification directe établissement", async () => {
      (mockPrisma.reliefMission.findUnique as jest.Mock).mockResolvedValue({
        id: "mission-1",
        title: "Mission de nuit",
      });

      await expect(
        service.requestInfo("mission-1", "free-1", "Pouvez-vous préciser les horaires ?"),
      ).resolves.toEqual({ ok: true });

      expect(mockPrisma.deskRequest.create).toHaveBeenCalledWith({
        data: {
          type: "MISSION_INFO_REQUEST",
          missionId: "mission-1",
          requesterId: "free-1",
          message: "Pouvez-vous préciser les horaires ?",
        },
      });
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });
});
