#!/bin/sh
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is required."
  exit 1
fi

echo "Running database migrations..."

# Mark previously-failed migration as rolled back so it can be re-applied
npx prisma migrate resolve --rolled-back 20260216211200_add_cancelled_statuses_and_scheduled_at --schema prisma/schema.prisma 2>/dev/null || true

npx prisma migrate deploy --schema prisma/schema.prisma

echo "Starting API..."
exec node dist/main.js
