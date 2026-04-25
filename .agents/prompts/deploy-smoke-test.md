# Prompt - Deploy Smoke Test

Use this after deploying API, front, Desk, or Prisma-related changes.

## API

```bash
curl -i https://api.les-extras.com/api/health
curl -i https://api.les-extras.com/api/users/me
```

Expected:

- `/api/health` is healthy.
- `/api/users/me` without token returns `401` or `403`.
- No API crash or restart.

## Front

Check:

- `https://les-extras.com/marketplace`
- `https://les-extras.com/bookings`
- `https://les-extras.com/dashboard`
- Publish Renfort flow.
- Metier `Autre`.
- Competence libre.
- Public libre.
- TTC + commission display.

## Desk

Check:

- `https://desk.les-extras.com/admin`
- `https://desk.les-extras.com/admin/demandes`
- `https://desk.les-extras.com/admin/incidents`
- `https://desk.les-extras.com/admin/finance`
- `https://desk.les-extras.com/admin/kyc`
- `https://desk.les-extras.com/admin/contournements`

## Prisma

In the production container only:

```bash
cd /app
./node_modules/.bin/prisma migrate status --schema /app/prisma/schema.prisma
```

If migrations must be applied:

```bash
cd /app
./node_modules/.bin/prisma migrate deploy --schema /app/prisma/schema.prisma
./node_modules/.bin/prisma generate --schema /app/prisma/schema.prisma
```

Never use `prisma migrate dev` in production.

## Docker

```bash
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"
docker inspect CONTAINER_ID --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
docker logs --tail=200 CONTAINER_ID
```

Pass criteria:

- Restart count stable.
- `OOMKilled=false`.
- Exit code not indicating repeated crash.
- Logs contain no startup stacktrace.

