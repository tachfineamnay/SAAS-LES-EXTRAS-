-- Fix Profile.skills column: ensure it has an empty-array default
-- and convert any existing NULL values to empty arrays.

-- Set the default so future Prisma upserts/creates work without providing skills
ALTER TABLE "Profile" ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];

-- Convert any existing NULL rows (shouldn't exist, but just in case)
UPDATE "Profile" SET "skills" = ARRAY[]::TEXT[] WHERE "skills" IS NULL;

-- Make the column NOT NULL now that NULLs are gone and default is set
ALTER TABLE "Profile" ALTER COLUMN "skills" SET NOT NULL;
