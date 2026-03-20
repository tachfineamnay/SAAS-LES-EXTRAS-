-- Add cancelled statuses for mission and booking workflows.

-- Create types if they don't exist yet (needed for fresh reset)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReliefMissionStatus') THEN
    CREATE TYPE "ReliefMissionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');
  ELSE
    ALTER TYPE "ReliefMissionStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingStatus') THEN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');
  ELSE
    ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
  END IF;
END $$;

-- Track planned intervention datetime for bookings.
ALTER TABLE "Booking"
ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
