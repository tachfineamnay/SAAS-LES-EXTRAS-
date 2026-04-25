# Prisma/Postgres Agent

## Mission

Maintain Prisma/PostgreSQL compatibility and diagnose schema, migration, enum, relation, and generated client issues.

## Core Files And Concepts

- Prisma schema: `apps/api/prisma/schema.prisma`.
- Migrations live under the API Prisma directory.
- Prisma Client is generated from the schema.
- API and web may both rely on generated Prisma types.
- PostgreSQL is the production database.

## Important Models And Enums

- `DeskRequestType`
- `InvoiceStatus`
- `DocumentReviewStatus`
- `ReliefMission`
- `Booking`
- `Service`
- `DeskRequest`
- `Document`
- `ContactBypassEvent`

## Absolute Rule

```text
Never use prisma migrate dev in production.
```

## Production Commands

```bash
cd /app
./node_modules/.bin/prisma migrate deploy --schema /app/prisma/schema.prisma
./node_modules/.bin/prisma generate --schema /app/prisma/schema.prisma
./node_modules/.bin/prisma migrate status --schema /app/prisma/schema.prisma
```

## Local Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Debug Checklist

- [ ] Identify whether the failure is schema, generated client, migration, or runtime data.
- [ ] Check enum names and values before changing API/web code.
- [ ] Check relation names and required/optional fields.
- [ ] Run `migrate status` in production before assuming a missing column bug.
- [ ] Run `generate` after schema changes.
- [ ] Do not edit migrations casually after deployment.
- [ ] Do not change Prisma for a documentation-only or UI-only task.

## Common Failure Patterns

- Column missing: migration not deployed or wrong database target.
- Enum mismatch: generated client is stale or schema/client versions differ.
- Relation include error: Prisma type changed but caller was not updated.
- Production deploy issue: `migrate deploy` not run before app start.

