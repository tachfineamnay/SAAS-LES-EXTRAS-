import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { ConversationsService } from '../conversations/conversations.service';
import { BookingStatus, ReliefMissionStatus, UserRole, UserStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;
  let notifications: NotificationsService;
  let mailService: MailService;

  const mockPrisma = {
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    reliefMission: {
      update: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    invoice: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((run: any) => {
      if (Array.isArray(run)) {
        return Promise.all(run);
      }
      return run(mockPrisma);
    }),
  } as any;

  const mockNotifications = {
    create: jest.fn(),
  };

  const mockMail = {
    sendMissionConfirmedEmail: jest.fn().mockResolvedValue(undefined),
    sendMissionCompletedEmail: jest.fn().mockResolvedValue(undefined),
    sendCandidatureDeclinedEmail: jest.fn().mockResolvedValue(undefined),
    sendReviewInvitationEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockConversations = {
    getOrCreateConversation: jest.fn().mockResolvedValue({ id: 'conv-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: MailService, useValue: mockMail },
        { provide: ConversationsService, useValue: mockConversations },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
    notifications = module.get<NotificationsService>(NotificationsService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  describe('completeBooking', () => {
    it('should complete a confirmed booking, create invoice and notify both parties', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        establishmentId: 'est-1',
        freelanceId: 'free-1',
        reliefMissionId: 'mission-1',
        reliefMission: { 
          establishmentId: 'est-1',
          title: 'Mission Test',
          dateStart: new Date('2026-03-20T08:00:00Z'),
          dateEnd: new Date('2026-03-22T12:00:00Z'),
          hourlyRate: 25,
          slots: [
            {
              dateStart: '2026-03-20',
              heureDebut: '08:00',
              dateEnd: '2026-03-20',
              heureFin: '12:00',
            },
            {
              dateStart: '2026-03-22',
              heureDebut: '08:00',
              dateEnd: '2026-03-22',
              heureFin: '12:00',
            },
          ],
        },
        invoice: null,
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, status: BookingStatus.COMPLETED });
      mockPrisma.reliefMission.update.mockResolvedValue({ id: 'mission-1', status: ReliefMissionStatus.COMPLETED });
      mockPrisma.invoice.count.mockResolvedValue(0);
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'free-1', email: 'free@test.com' });

      await service.completeBooking('booking-1', user);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 230,
          }),
        }),
      );
      // Should notify both freelance and establishment
      expect(mockNotifications.create).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequest if booking is not CONFIRMED', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        reliefMission: { establishmentId: 'est-1' },
        invoice: null,
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.completeBooking('booking-1', user)).rejects.toThrow(BadRequestException);
    });

    it('should throw Forbidden if user is not the establishment owner', async () => {
      const user = { id: 'other-user', email: 'other@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        establishmentId: 'est-1',
        reliefMission: { establishmentId: 'est-1' },
        invoice: null,
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.completeBooking('booking-1', user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markPaymentSettled', () => {
    it('should mark a completed booking as PAID and update invoice', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.COMPLETED,
        establishmentId: 'est-1',
        freelanceId: 'free-1',
        invoice: { id: 'inv-1', status: 'UNPAID' },
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, paymentStatus: 'PAID' });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID' });

      await service.markPaymentSettled('booking-1', user);

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { paymentStatus: 'PAID' },
      });
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'PAID' },
      });
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    it('should throw Forbidden if user is not the establishment', async () => {
      const user = { id: 'free-1', email: 'free@est.com', role: UserRole.FREELANCE, status: UserStatus.VERIFIED, onboardingStep: 4 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.COMPLETED,
        establishmentId: 'est-1',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.markPaymentSettled('booking-1', user)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequest if booking is not COMPLETED', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED, // Not completed yet
        establishmentId: 'est-1',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.markPaymentSettled('booking-1', user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('acknowledgeBooking', () => {
    const freelanceUser = { id: 'free-1', email: 'free@test.com', role: UserRole.FREELANCE, status: UserStatus.VERIFIED, onboardingStep: 4 };
    const estUser = { id: 'est-1', email: 'est@test.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };

    it('should acknowledge a confirmed booking', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        freelanceId: 'free-1',
        freelanceAcknowledged: false,
        establishmentId: 'est-1',
        reliefMission: { title: 'Mission Test' },
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, freelanceAcknowledged: true });

      await service.acknowledgeBooking('booking-1', freelanceUser);

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { freelanceAcknowledged: true },
      });
      expect(mockNotifications.create).toHaveBeenCalledWith({
        userId: 'est-1',
        message: expect.stringContaining('confirmé sa venue'),
        type: 'SUCCESS',
      });
    });

    it('should be idempotent when already acknowledged', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        freelanceId: 'free-1',
        freelanceAcknowledged: true,
        establishmentId: 'est-1',
        reliefMission: { title: 'Mission Test' },
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      const result = await service.acknowledgeBooking('booking-1', freelanceUser);

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    it('should throw Forbidden if user is not FREELANCE', async () => {
      await expect(service.acknowledgeBooking('booking-1', estUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw Forbidden if booking belongs to another freelance', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        freelanceId: 'other-free',
        freelanceAcknowledged: false,
        establishmentId: 'est-1',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.acknowledgeBooking('booking-1', freelanceUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequest if booking is not CONFIRMED', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        freelanceId: 'free-1',
        freelanceAcknowledged: false,
        establishmentId: 'est-1',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.acknowledgeBooking('booking-1', freelanceUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmBooking', () => {
    const estUser = { id: 'est-1', email: 'est@test.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };

    it('should confirm booking, create conversation and notify rejected freelances', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        establishmentId: 'est-1',
        freelanceId: 'free-1',
        reliefMissionId: 'mission-1',
        reliefMission: { 
          establishmentId: 'est-1',
          title: 'Mission Test',
          dateStart: new Date('2026-03-20T08:00:00Z'),
        },
        service: null,
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.profile.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.booking.update.mockResolvedValue({ ...booking, status: BookingStatus.CONFIRMED });
      mockPrisma.booking.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.reliefMission.update.mockResolvedValue({ id: 'mission-1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'free-1', email: 'free@test.com', profile: { firstName: 'Karim' } });
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: 'booking-2',
          freelanceId: 'free-2',
          freelance: { email: 'free2@test.com', profile: { firstName: 'Ali' } },
        },
      ]);

      await service.confirmBooking('booking-1', estUser);

      expect(mockPrisma.profile.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'est-1',
          availableCredits: { gte: 1 },
        },
        data: {
          availableCredits: { decrement: 1 },
        },
      });
      // Should create conversation
      expect(mockConversations.getOrCreateConversation).toHaveBeenCalledWith('free-1', 'est-1');
      // Should notify the confirmed freelance
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'free-1', type: 'SUCCESS' }),
      );
      // Should notify rejected freelances
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'free-2', type: 'WARNING' }),
      );
    });

    it("should reject mission confirmation when the establishment has no available credits", async () => {
      const booking = {
        id: "booking-1",
        status: BookingStatus.PENDING,
        establishmentId: "est-1",
        freelanceId: "free-1",
        reliefMissionId: "mission-1",
        reliefMission: {
          establishmentId: "est-1",
          title: "Mission Test",
          dateStart: new Date("2026-03-20T08:00:00Z"),
        },
        service: null,
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.profile.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.confirmBooking("booking-1", estUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
      expect(mockConversations.getOrCreateConversation).not.toHaveBeenCalled();
    });
  });

  describe('cancelBookingLine — lineType BOOKING', () => {
    const estUser = { id: 'est-1', email: 'est@test.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
    const freeUser = { id: 'free-1', email: 'free@test.com', role: UserRole.FREELANCE, status: UserStatus.VERIFIED, onboardingStep: 4 };

    it('annule le booking PENDING et retourne { ok: true }', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        freelanceId: 'free-1',
        reliefMission: { establishmentId: 'est-1' },
      };
      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, status: BookingStatus.CANCELLED });

      const result = await service.cancelBookingLine(
        { lineType: 'BOOKING', lineId: 'booking-1' },
        estUser,
      );

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BookingStatus.CANCELLED },
      });
    });

    it('lève ForbiddenException si le rôle est FREELANCE', async () => {
      await expect(
        service.cancelBookingLine({ lineType: 'BOOKING', lineId: 'booking-1' }, freeUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.booking.findUnique).not.toHaveBeenCalled();
    });

    it('lève NotFoundException si le booking est introuvable', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelBookingLine({ lineType: 'BOOKING', lineId: 'ghost-id' }, estUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('lève ForbiddenException si la mission appartient à un autre établissement', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        freelanceId: 'free-1',
        reliefMission: { establishmentId: 'other-est' },
      };
      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(
        service.cancelBookingLine({ lineType: 'BOOKING', lineId: 'booking-1' }, estUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lève BadRequestException si le booking n\'est pas PENDING', async () => {
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        freelanceId: 'free-1',
        reliefMission: { establishmentId: 'est-1' },
      };
      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(
        service.cancelBookingLine({ lineType: 'BOOKING', lineId: 'booking-1' }, estUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
