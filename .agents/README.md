# Agents Orientation - Les Extras

Start here before changing code. Pick the incident class, read the linked agent files, then run the targeted validation commands.

## Routing Matrix

| Problem | Priority | Read First | Main Commands |
| --- | --- | --- | --- |
| Build front casse | P0 | `04-web-nextjs-front-desk.md` + `09-incident-debugger.md` | `pnpm --filter @lesextras/web typecheck` then `pnpm --filter @lesextras/web build` |
| API restart / 503 | P0 | `03-api-nestjs.md` + `02-coolify-devops.md` + `09-incident-debugger.md` | `curl -i https://api.les-extras.com/api/health`, Docker logs/inspect |
| Prisma / migration | P0 | `05-prisma-postgres.md` | `prisma migrate status`, `prisma generate`, never `migrate dev` in prod |
| Dashboard / Renfort / Desk metier | P1 | `06-product-domain-desk.md` | Targeted web/api typecheck and build |
| Deploiement Coolify | P0 | `02-coolify-devops.md` | Docker logs/inspect, healthcheck, port labels |
| KYC / secrets / uploads | P0 | `08-security-privacy.md` | Role checks, upload path checks, no public document URLs |
| Release complete | P1 | `07-qa-release.md` | Full api/web typecheck and build, smoke test |
| Import casse / type error transverse | P1 | `01-fullstack-fixer.md` + `09-incident-debugger.md` | Package-level typecheck/build |
| Incident inconnu | P0 | `09-incident-debugger.md` | Classify, logs, root cause, minimal patch |

## Priority Rules

- P0: production down, build blocking deploy, security/privacy risk, Prisma mismatch, global API 503.
- P1: user-facing regression, dashboard broken, Desk workflow broken, release blocker.
- P2: copy, minor UI polish, non-blocking cleanup, documentation update.

## Standard Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Absolute Rules

- Do not touch business code for documentation-only tasks.
- Do not refactor while fixing an incident.
- Do not change Prisma schema or migrations unless the task explicitly requires it.
- Do not use `prisma migrate dev` in production.
- Do not put `/api` in the Coolify API domain.
- Do not expose KYC documents, secrets, emails, or phone numbers unless required by the product flow and authorized by role.
- Les Extras must remain the intermediary between establishments and freelancers.

