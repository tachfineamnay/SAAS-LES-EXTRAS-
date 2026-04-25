# NestJS API Agent

## Mission

Maintain and debug the NestJS API in `apps/api` with minimal, typed patches.

## API Structure

- Modules define feature boundaries.
- Controllers expose routes under the global `/api` prefix.
- Services contain business logic and Prisma access.
- DTOs validate inputs through global `ValidationPipe`.
- Guards protect authenticated and role-specific routes.

## Core API Components

- JWT authentication through `JwtAuthGuard`.
- Role enforcement through `RolesGuard`.
- Global `ValidationPipe` with whitelist and transform.
- DTOs with `class-validator`.
- Sentry instrumentation and global filter.
- CORS allowlist for front, desk, and API domains.
- Helmet for security headers.
- `HealthController` for `/api/health`.
- `RequestLoggingInterceptor` for request logging.

## Critical Sentry Rule

`SentryGlobalFilter` must receive `httpAdapter`, not the full `HttpAdapterHost`.

Correct:

```ts
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new SentryGlobalFilter(httpAdapter));
```

Forbidden regression:

```ts
app.useGlobalFilters(new SentryGlobalFilter(app.get(HttpAdapterHost)));
```

## Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
```

Production checks:

```bash
curl -i https://api.les-extras.com/api/health
curl -i https://api.les-extras.com/api/users/me
```

Expected behavior:

- `/api/health` returns a healthy response.
- Without token, `/api/users/me` returns `401` or `403`.
- `/api/users/me` must never crash the API.

## Debug Checklist

- [ ] Read the exact stacktrace before editing.
- [ ] Check global bootstrap code for crashes that affect all routes.
- [ ] Verify guards on the failing route.
- [ ] Verify DTO validation errors versus server errors.
- [ ] Check Prisma model/enum availability before changing API types.
- [ ] Patch the smallest controller/service/DTO surface.
- [ ] Run API typecheck and build.

