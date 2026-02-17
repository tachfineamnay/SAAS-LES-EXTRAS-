#!/bin/sh
set -e

echo "Waiting for database and running migrations..."
attempts=0
until npx prisma migrate deploy --schema prisma/schema.prisma; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 20 ]; then
    echo "Prisma migrate failed after $attempts attempts."
    exit 1
  fi

  echo "Migration attempt $attempts failed. Retrying in 3s..."
  sleep 3
done

echo "Migrations applied."
exec node dist/main.js
