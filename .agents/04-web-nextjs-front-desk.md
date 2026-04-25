# Next.js Front/Desk Agent

## Mission

Maintain and debug the Next.js App Router application in `apps/web` for both front and Desk runtimes.

## Runtime Model

- Same codebase, two deployments.
- `APP_RUNTIME=front` serves `https://les-extras.com`.
- `APP_RUNTIME=desk` serves `https://desk.les-extras.com`.
- Front and Desk both run on port `3000`.
- Docker output uses Next.js standalone build.

## Core Concepts

- Next.js App Router.
- Server Actions.
- `middleware.ts`.
- `session.ts`.
- Cookies and role-aware sessions.
- Server-side API calls through `API_BASE_URL`.
- Client-side API calls through `NEXT_PUBLIC_API_URL`.
- Shared components must not be duplicated.

## Current Known Front Incident

`FreelanceJobBoard` must not import `./MissionCard` if that file has been removed.

Correct import:

```ts
import { MissionCard } from "@/components/cards/MissionCard";
```

Correct render:

```tsx
<MissionCard key={mission.id} mission={mission} />
```

Do not duplicate `MissionCard`.

## Validation

```bash
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Debug Checklist

- [ ] Identify runtime: front or desk.
- [ ] Search for centralized component/helper before adding new code.
- [ ] Check Server Actions for cookie/session access.
- [ ] Check `API_BASE_URL` for server-side calls.
- [ ] Check `NEXT_PUBLIC_API_URL` for client-side calls.
- [ ] Check route groups and middleware behavior.
- [ ] Run web typecheck and build.

## Common Failure Patterns

- Module not found: import points to deleted local file.
- Server Action error: missing cookie/session/API runtime config.
- Hydration/client error: component uses browser-only behavior without client boundary.
- Desk route error: `APP_RUNTIME=desk` route gating or admin session mismatch.
- Front route error: `APP_RUNTIME=front` route gating or user session mismatch.

