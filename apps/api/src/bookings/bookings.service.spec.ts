import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
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
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    reliefMission: {
      update: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((run: any) => {
      // Very basic transaction mock
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
    notifications = module.get<NotificationsService>(NotificationsService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  describe('completeBooking', () => {
    it('should complete a confirmed booking and its relief mission', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.CONFIRMED,
        establishmentId: 'est-1',
        reliefMissionId: 'mission-1',
        reliefMission: { establishmentId: 'est-1' },
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, status: BookingStatus.COMPLETED });
      mockPrisma.reliefMission.update.mockResolvedValue({ id: 'mission-1', status: ReliefMissionStatus.COMPLETED });

      await service.completeBooking('booking-1', user);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BookingStatus.COMPLETED },
      });
      expect(mockPrisma.reliefMission.update).toHaveBeenCalledWith({
        where: { id: 'mission-1' },
        data: { status: ReliefMissionStatus.COMPLETED },
      });
    });

    it('should throw BadRequest if booking is not CONFIRMED', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.PENDING,
        reliefMission: { establishmentId: 'est-1' },
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
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      await expect(service.completeBooking('booking-1', user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markPaymentSettled', () => {
    it('should mark a completed booking as PAID', async () => {
      const user = { id: 'est-1', email: 'est@est.com', role: UserRole.ESTABLISHMENT, status: UserStatus.VERIFIED, onboardingStep: 3 };
      const booking = {
        id: 'booking-1',
        status: BookingStatus.COMPLETED,
        establishmentId: 'est-1',
        freelanceId: 'free-1',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({ ...booking, paymentStatus: 'PAID' });

      await service.markPaymentSettled('booking-1', user);

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { paymentStatus: 'PAID' },
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
