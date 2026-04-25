# Prompt - Fix API SentryGlobalFilter

Use this prompt when the API restarts, returns global 503, or logs show a Sentry global filter initialization error.

## Context

The API is a NestJS service in `apps/api`. Sentry is initialized during bootstrap. `SentryGlobalFilter` must receive the Nest HTTP adapter, not the `HttpAdapterHost` wrapper object.

## File

```text
apps/api/src/main.ts
```

## Required Patch

Ensure the bootstrap code uses:

```ts
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new SentryGlobalFilter(httpAdapter));
```

Do not use:

```ts
app.useGlobalFilters(new SentryGlobalFilter(app.get(HttpAdapterHost)));
```

## Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
curl -i https://api.les-extras.com/api/health
curl -i https://api.les-extras.com/api/users/me
```

Expected:

- `/api/health` responds.
- `/api/users/me` without token returns `401` or `403`.
- API does not restart.

## Deploy

- Redeploy the API service in Coolify.
- Confirm domain is `https://api.les-extras.com`.
- Confirm exposed service port is `3001`.
- Confirm healthcheck is `/api/health`.

