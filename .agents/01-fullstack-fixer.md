# Full-stack Fixer

## Mission

Fix cross-runtime bugs with minimal changes:

- Broken imports.
- Type errors.
- Incompatible props.
- Server Actions.
- API endpoint regressions.
- UI regressions.
- Front/api integration mismatches.

## Operating Rules

- Read the affected file before editing.
- Identify the runtime first: api, front, desk, prisma, or coolify.
- Patch the smallest working surface.
- Do not refactor broad code paths.
- Do not duplicate centralized components.
- Do not change Prisma, Dockerfile, or environment variables unless explicitly required.
- Preserve the intermediary rule: no unnecessary direct contact data between establishments and freelancers.

## Debug Checklist

- [ ] Reproduce or locate the exact error.
- [ ] Find the import/type/API boundary causing it.
- [ ] Check whether a centralized component or helper already exists.
- [ ] Patch only the broken file or smallest dependency.
- [ ] Run typecheck/build for the changed package.
- [ ] Document any follow-up risk without expanding scope.

## Validation Commands

```bash
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
```

## Common Patterns

- Module not found: search for the current centralized component path before recreating a file.
- Props mismatch: update the caller or typed contract, not both unless required.
- Server Action error: verify cookies/session handling and server-side API base URL.
- API DTO error: check class-validator DTOs and `ValidationPipe` behavior.
- Role error: check `JwtAuthGuard`, `RolesGuard`, and route decorators.

