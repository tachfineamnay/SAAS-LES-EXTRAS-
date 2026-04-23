import { BadRequestException, NotFoundException } from "@nestjs/common";
import { DeskRequestStatus, UserRole } from "@prisma/client";
import { DeskService } from "./desk.service";

describe("DeskService", () => {
  const prisma = {
    deskRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    contactBypassEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    adminActionLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((queries: Array<Promise<unknown>>) => Promise.all(queries)),
  } as any;
  const mailService = {
    sendAdminOutreachEmail: jest.fn().mockResolvedValue(undefined),
  };

  let service: DeskService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeskService(prisma, mailService as any);
  });

  it("met à jour le statut et journalise l'action", async () => {
    prisma.deskRequest.findUnique.mockResolvedValue({
      id: "desk-1",
      status: DeskRequestStatus.OPEN,
    });
    prisma.deskRequest.update.mockResolvedValue({
      id: "desk-1",
      status: DeskRequestStatus.IN_PROGRESS,
    });
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(
      service.updateStatus("desk-1", "admin-1", { status: DeskRequestStatus.IN_PROGRESS }),
    ).resolves.toMatchObject({ status: DeskRequestStatus.IN_PROGRESS });

    expect(prisma.deskRequest.update).toHaveBeenCalledWith({
      where: { id: "desk-1" },
      data: { status: DeskRequestStatus.IN_PROGRESS },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "DESK_REQUEST",
        entityId: "desk-1",
        action: "DESK_REQUEST_STATUS_UPDATE",
        meta: {
          previousStatus: DeskRequestStatus.OPEN,
          nextStatus: DeskRequestStatus.IN_PROGRESS,
        },
      }),
    });
  });

  it("assigne une demande à un admin et journalise l'action", async () => {
    prisma.deskRequest.findUnique.mockResolvedValue({
      id: "desk-1",
      assignedToAdminId: null,
    });
    prisma.user.findFirst.mockResolvedValue({ id: "admin-2" });
    prisma.deskRequest.update.mockResolvedValue({
      id: "desk-1",
      assignedToAdminId: "admin-2",
    });
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.assign("desk-1", "admin-1", { adminId: "admin-2" })).resolves.toMatchObject({
      assignedToAdminId: "admin-2",
    });

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: "admin-2", role: UserRole.ADMIN },
      select: { id: true },
    });
    expect(prisma.deskRequest.update).toHaveBeenCalledWith({
      where: { id: "desk-1" },
      data: { assignedToAdminId: "admin-2" },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "DESK_REQUEST_ASSIGN",
        meta: {
          previousAssignedToAdminId: null,
          nextAssignedToAdminId: "admin-2",
        },
      }),
    });
  });

  it("répond à une demande, notifie le candidat et journalise l'action", async () => {
    prisma.deskRequest.findUnique.mockResolvedValue({
      id: "desk-1",
      requesterId: "free-1",
      missionId: "mission-1",
      status: DeskRequestStatus.IN_PROGRESS,
      response: null,
      mission: { title: "Mission de nuit" },
    });
    prisma.deskRequest.update.mockResolvedValue({
      id: "desk-1",
      status: DeskRequestStatus.ANSWERED,
    });
    prisma.notification.create.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(
      service.respond("desk-1", "admin-1", { response: "Réponse complète." }),
    ).resolves.toMatchObject({ status: DeskRequestStatus.ANSWERED });

    expect(prisma.deskRequest.update).toHaveBeenCalledWith({
      where: { id: "desk-1" },
      data: {
        response: "Réponse complète.",
        answeredById: "admin-1",
        answeredAt: expect.any(Date),
        status: DeskRequestStatus.ANSWERED,
      },
    });
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "free-1",
        type: "INFO",
      }),
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "DESK_REQUEST",
        entityId: "desk-1",
        action: "DESK_REQUEST_RESPOND",
        meta: {
          previousStatus: DeskRequestStatus.IN_PROGRESS,
          nextStatus: DeskRequestStatus.ANSWERED,
          hadExistingResponse: false,
        },
      }),
    });
  });

  it("lève NotFoundException si la demande n'existe pas", async () => {
    prisma.deskRequest.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus("missing", "admin-1", { status: DeskRequestStatus.CLOSED }),
    ).rejects.toThrow(NotFoundException);
  });

  it("retourne les événements de contournement avec le résumé expéditeur", async () => {
    prisma.contactBypassEvent.findMany.mockResolvedValue([
      {
        id: "event-1",
        conversationId: "conv-1",
        conversation: { bookingId: "booking-1" },
        blockedReason: "EMAIL",
        rawExcerpt: "jo@example.com",
        createdAt: new Date("2026-04-23T09:00:00.000Z"),
        sender: {
          id: "user-1",
          email: "sender@example.com",
          role: "FREELANCE",
          status: "VERIFIED",
          profile: {
            firstName: "Aya",
            lastName: "Benali",
          },
        },
      },
    ]);

    await expect(service.findContactBypassEvents()).resolves.toEqual([
      {
        id: "event-1",
        conversationId: "conv-1",
        bookingId: "booking-1",
        blockedReason: "EMAIL",
        rawExcerpt: "jo@example.com",
        createdAt: "2026-04-23T09:00:00.000Z",
        sender: {
          id: "user-1",
          email: "sender@example.com",
          name: "Aya Benali",
          role: "FREELANCE",
          status: "VERIFIED",
        },
      },
    ]);
  });

  it("envoie un outreach Desk, notifie le user et journalise l'action", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "aya@example.com",
      role: "FREELANCE",
      status: "VERIFIED",
      profile: {
        firstName: "Aya",
        lastName: "Benali",
      },
    });
    prisma.notification.create.mockResolvedValue({});
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(
      service.sendAdminOutreach("user-1", "admin-1", {
        message: "Merci de passer par la plateforme.",
        origin: "CONTACT_BYPASS",
        contextId: "event-1",
      }),
    ).resolves.toEqual({ ok: true });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "INFO",
        message: "Message du Desk : Merci de passer par la plateforme.",
      },
    });
    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: "admin-1",
        entityType: "USER",
        entityId: "user-1",
        action: "USER_OUTREACH_SEND",
      }),
    });
    expect(mailService.sendAdminOutreachEmail).toHaveBeenCalledWith(
      "aya@example.com",
      "Aya Benali",
      "Merci de passer par la plateforme.",
    );
  });

  it("refuse un outreach Desk vers un admin", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "admin-2",
      email: "admin2@example.com",
      role: "ADMIN",
      status: "VERIFIED",
      profile: null,
    });

    await expect(
      service.sendAdminOutreach("admin-2", "admin-1", { message: "Test outreach" }),
    ).rejects.toThrow(BadRequestException);
  });

  it("journalise la mise sous surveillance d'un contournement", async () => {
    prisma.contactBypassEvent.findUnique.mockResolvedValue({
      id: "event-1",
      senderId: "user-1",
      blockedReason: "EMAIL",
      conversationId: "conv-1",
    });
    prisma.adminActionLog.create.mockResolvedValue({});

    await expect(service.monitorContactBypassEvent("event-1", "admin-1")).resolves.toEqual({
      ok: true,
    });

    expect(prisma.adminActionLog.create).toHaveBeenCalledWith({
      data: {
        adminId: "admin-1",
        entityType: "CONTACT_BYPASS_EVENT",
        entityId: "event-1",
        action: "CONTACT_BYPASS_MONITOR",
        meta: {
          senderId: "user-1",
          blockedReason: "EMAIL",
          conversationId: "conv-1",
        },
      },
    });
  });
});
