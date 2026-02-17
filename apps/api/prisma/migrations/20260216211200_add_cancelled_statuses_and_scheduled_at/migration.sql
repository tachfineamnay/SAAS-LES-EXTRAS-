-- Add cancelled statuses for mission and booking workflows.
ALTER TYPE "ReliefMissionStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Track planned intervention datetime for bookings.
ALTER TABLE "Booking"
ADD COLUMN "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
