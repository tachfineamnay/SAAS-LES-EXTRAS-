---
name: project-overview
description: Global architecture and critical conventions for the Booking-LesExtras / SocioPulse SaaS monorepo. Read this FIRST before any task.
---

# Project Overview

## Identity

| Key | Value |
|---|---|
| **App Name** | SocioPulse / MedicoPulse (dual-brand) |
| **Repo** | `Booking-lesextras` |
| **Type** | B2B SaaS — Interim / Freelance marketplace for healthcare & social sectors |
| **Roles** | `CLIENT` (Établissements) · `TALENT` (Freelances) · `ADMIN` |

## Monorepo Structure (TurboRepo)

```
Booking-lesextras/
├── apps/
│   ├── api/         # NestJS backend (port 3001)
│   └── web/         # Next.js 14 frontend (port 3000)
├── package.json     # Workspace root
└── turbo.json       # TurboRepo pipeline
```

## Key Conventions

### Environment Variables
- **API env**: `apps/api/.env` — contains `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `PORT`
- **Web env**: `apps/web/.env.local` — contains `API_BASE_URL` or `NEXT_PUBLIC_API_URL`

### Terminology (CRITICAL — never use old words)
| Old | New |
|---|---|
| SOS | Renfort |
| Client | Établissement |
| Talent | Freelance / Extra |
| Sanctuary / Oracle / SoulMirror | ❌ DO NOT USE |

### User Roles
- `CLIENT`: Établissements (create missions, book freelancers, confirm, pay invoices)
- `TALENT`: Freelancers (apply to missions, offer services, quote clients)
- `ADMIN`: Platform admin (manage users/offers)

## Dev Commands

```bash
# From root
npm run dev          # Start all apps in dev mode (turbo)
npm run build        # Build all apps
npm run typecheck    # Type-check all apps

# Per app
npm run dev -w @lesextras/api
npm run dev -w @lesextras/web
npm run build -w @lesextras/web

# Prisma (from apps/api)
npx prisma generate
npx prisma migrate dev --name <migration_name>
npx prisma studio
```

## Deployment
- **Platform**: Coolify (self-hosted)
- **Config**: `docker-compose.coolify.yml` at root
- **Services**: `postgres`, `api` (NestJS), `web` (Next.js)
- **API URL in prod**: Set via `NEXT_PUBLIC_API_URL` env var in Coolify
