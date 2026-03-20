#!/bin/sh
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is required."
  exit 1
fi

echo "Waiting for database and running migrations..."

attempts=0
until (
  # Resolve any previously failed migrations before each attempt so P3009 is cleared once the DB is reachable
  npx prisma migrate resolve --rolled-back "20260216211200_add_cancelled_statuses_and_scheduled_at" --schema prisma/schema.prisma 2>/dev/null || true
  npx prisma migrate resolve --rolled-back "20260303221500_add_missing_tables_and_columns" --schema prisma/schema.prisma 2>/dev/null || true
  npx prisma migrate resolve --rolled-back "20260316000001_fix_profile_skills_default" --schema prisma/schema.prisma 2>/dev/null || true
  npx prisma migrate deploy --schema prisma/schema.prisma
); do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 20 ]; then
    echo "Prisma migrate failed after $attempts attempts."
    exit 1
  fi

  echo "Migration attempt $attempts failed. Retrying in 3s..."
  sleep 3
done

echo "Migrations applied."
echo "Starting API..."
exec node dist/main.js
