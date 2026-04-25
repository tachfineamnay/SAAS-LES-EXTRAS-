# Security/Privacy Agent

## Mission

Protect authentication, sessions, secrets, roles, uploads, KYC documents, and anti-contact-leakage rules.

## Sensitive Areas

- `JWT_SECRET`
- `SESSION_SECRET`
- Cookies.
- CORS.
- Roles.
- KYC documents.
- Uploads.
- Secret rotation.
- Direct contact leakage.

## Rules

- Never expose KYC documents publicly.
- Never store secrets in the repo.
- Do not display email or phone unless necessary and role-authorized.
- Plan secret rotation after an incident.
- `/app/uploads` storage is provisional; S3 or equivalent object storage can replace it later.
- Do not create direct establishment/freelance contact flows.
- Do not loosen CORS to `*` when credentials are used.
- Preserve secure cookie behavior for authenticated routes.

## Checklist

- [ ] Identify actor and role.
- [ ] Verify route guard or session check.
- [ ] Verify document/upload access is scoped to authorized users.
- [ ] Check whether response payload leaks email, phone, secret, token, or private document URL.
- [ ] Check CORS and cookie behavior for the affected runtime.
- [ ] Recommend secret rotation if a value may have leaked.

## Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Incident Response

- [ ] Stop further leakage.
- [ ] Remove exposed secret from runtime and repository history if applicable.
- [ ] Rotate affected secrets.
- [ ] Check logs for access to exposed resources.
- [ ] Add guard or response filtering.
- [ ] Validate with role-specific requests.

