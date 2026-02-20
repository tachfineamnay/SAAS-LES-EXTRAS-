---
name: deployment
description: Deployment stack, Docker setup, environment variables, and CI/CD for the Coolify-hosted SaaS. Read before touching Dockerfiles, env vars, or deployment config.
---

# Deployment — Coolify + Docker

## Platform

**Coolify** (self-hosted PaaS), hosting:

- `postgres` — Database
- `api` — NestJS backend
- `web` — Next.js frontend

## Docker Config

`docker-compose.coolify.yml` at repo root

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=...
      - POSTGRES_PASSWORD=...
      - POSTGRES_DB=...

  api:
    build: ./apps/api
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/dbname
      - JWT_SECRET=...
      - PORT=3001
      - CORS_ORIGINS=https://yourdomain.com

  web:
    build: ./apps/web
    environment:
      - API_BASE_URL=https://api.yourdomain.com/api
```

## Dockerfiles

- **API Dockerfile**: `apps/api/Dockerfile`
  - Uses `node:20-alpine`
  - Runs `prisma generate` before build
  - Installs `prisma@5.22.0` globally (pinned to match project version)
- **Web Dockerfile**: `apps/web/Dockerfile`
  - Uses `node:20-alpine`
  - Runs `next build`

## Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
PORT=3001
```

### Web (`apps/web/.env.local`)

```env
API_BASE_URL=http://localhost:3001/api         # server-side
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # client-side
```

## Deployment Checklist

1. **Schema changes?** → Run `npx prisma migrate dev` locally first, commit migration file
2. **New env var?** → Add to Coolify environment settings + `.env.example`
3. **Push to `main`** → Coolify auto-deploys on push
4. **Build fails?** → Check `npm run build -w @lesextras/web` and `npm run build -w @lesextras/api` locally

## Common Issues

| Issue | Fix |
|---|---|
| `prisma` version mismatch | Pin `prisma@5.22.0` in Dockerfile |
| CORS error | Add front URL to `CORS_ORIGINS` env |
| DB migration fails locally | Check `DATABASE_URL` points to reachable host |
| Frontend can't reach API | Check `API_BASE_URL` is set and accessible from container |
