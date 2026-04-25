# Current Known Issues

## A. API SentryGlobalFilter

### Cause

`SentryGlobalFilter` was initialized with `HttpAdapterHost` instead of `httpAdapter`.

### Patch

```ts
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new SentryGlobalFilter(httpAdapter));
```

### Do Not Regress To

```ts
app.useGlobalFilters(new SentryGlobalFilter(app.get(HttpAdapterHost)));
```

### Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
curl -i https://api.les-extras.com/api/health
curl -i https://api.les-extras.com/api/users/me
```

Without token, `/api/users/me` must return `401` or `403`, not crash the API.

## B. Front MissionCard

### Cause

`FreelanceJobBoard` imported a deleted local `./MissionCard`.

### Patch

```ts
import { MissionCard } from "@/components/cards/MissionCard";
```

Remove local `useApplyToMission` handling from `FreelanceJobBoard` when centralized `MissionCard` owns mission application behavior.

Use:

```tsx
<MissionCard key={mission.id} mission={mission} />
```

Do not duplicate `MissionCard`.

### Validation

```bash
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## C. Coolify API

### Rules

```text
Domain API = https://api.les-extras.com
Pas https://api.les-extras.com/api
Port API = 3001
Healthcheck = /api/health
```

### Checks

```bash
curl -i https://api.les-extras.com/api/health
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"
docker logs --tail=200 CONTAINER_ID
docker inspect CONTAINER_ID --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
```

Confirm Traefik/Coolify `loadbalancer.server.port` points to `3001`.

