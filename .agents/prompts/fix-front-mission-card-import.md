# Prompt - Fix Front MissionCard Import

Use this prompt when the web build fails because `FreelanceJobBoard` imports a missing local `./MissionCard`.

## Context

`MissionCard` is centralized under `apps/web/src/components/cards/MissionCard.tsx`. `FreelanceJobBoard` must use the centralized component and must not recreate or duplicate it.

## File

```text
apps/web/src/components/marketplace/FreelanceJobBoard.tsx
```

## Required Patch

Use:

```ts
import { MissionCard } from "@/components/cards/MissionCard";
```

Render:

```tsx
<MissionCard key={mission.id} mission={mission} />
```

Remove local `useApplyToMission` handling from `FreelanceJobBoard` if the centralized `MissionCard` already owns application behavior.

Do not create:

```text
apps/web/src/components/marketplace/MissionCard.tsx
```

## Validation

```bash
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Deploy

- Redeploy the affected web service in Coolify.
- For front, verify `APP_RUNTIME=front` and `https://les-extras.com`.
- For Desk, verify `APP_RUNTIME=desk` and `https://desk.les-extras.com`.

