#!/bin/sh
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is required."
  exit 1
fi

# Migration handled by Coolify pre-deployment command
echo "Starting API..."
exec node dist/main.js
