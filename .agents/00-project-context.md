# Project Context

## Architecture

- Monorepo TypeScript managed by pnpm workspace.
- Workspace packages are under `apps/*`.
- `apps/api` is the NestJS API.
- `apps/web` is the Next.js App Router application.
- `apps/web` serves two runtimes from the same codebase:
  - `APP_RUNTIME=front` for the public/user frontend.
  - `APP_RUNTIME=desk` for the admin Desk.
- Database is PostgreSQL through Prisma.
- Production deployment uses Docker multi-stage builds on Coolify v4.
- Traefik routing is managed by Coolify.

## Public URLs

- API: `https://api.les-extras.com/api`
- Front: `https://les-extras.com`
- Desk: `https://desk.les-extras.com`

## Runtime Responsibilities

### `apps/api`

- NestJS modules, controllers, services, DTO validation, guards, and Prisma access.
- Owns authentication, roles, missions, bookings, services, Desk APIs, documents, finance read-only endpoints, and health.
- Global API prefix is `/api`.
- Health endpoint is `/api/health`.

### `apps/web`

- Next.js App Router frontend and Desk admin UI.
- Uses Server Actions, middleware, cookies/session helpers, and API request helpers.
- Server-side calls use `API_BASE_URL`.
- Client-side calls use `NEXT_PUBLIC_API_URL`.
- Build output is Next.js standalone Docker.

## Product Domains

- Renfort etablissement.
- Missions.
- Bookings.
- Services, ateliers, formations.
- Dashboard etablissement.
- Dashboard freelance.
- Desk admin.
- KYC documents.
- Finance read-only.
- Incidents Desk.
- Anti-contournement.
- Admin outreach.

## Core Product Rule

Les Extras must remain the intermediary between establishments and freelancers.

Do not add flows that encourage or expose direct contact outside the platform.

## Current Product State

- Formulaire Renfort V2 cloture.
- Dashboard etablissement V2 refondu.
- `DeskRequestType` aligned.
- `InvoiceStatus` typed.
- User-safe endpoint `POST /desk-requests` exists.
- API health is OK when deployed correctly.
- Prisma migrations are applied.

## Key Operational Notes

- API domain in Coolify must be `https://api.les-extras.com`, not `https://api.les-extras.com/api`.
- API service listens on port `3001`.
- Front and Desk listen on port `3000`.
- API persistent storage currently maps uploads to `/app/uploads`.
- KYC documents and uploads are sensitive.

