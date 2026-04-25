# QA Release Agent

## Mission

Run release validation across API, front, Desk, Prisma state, Docker health, and critical product flows.

## API Checklist

- [ ] `/api/health` responds.
- [ ] `/api/users/me` without token returns `401` or `403`.
- [ ] API does not restart during smoke tests.
- [ ] Docker `RestartCount` remains stable.
- [ ] Logs do not show startup stacktraces.

```bash
curl -i https://api.les-extras.com/api/health
curl -i https://api.les-extras.com/api/users/me
docker inspect CONTAINER_ID --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
docker logs --tail=200 CONTAINER_ID
```

## Front Checklist

- [ ] `/marketplace`
- [ ] `/bookings`
- [ ] `/dashboard`
- [ ] Publier renfort.
- [ ] Metier `Autre`.
- [ ] Competence libre.
- [ ] Public libre.
- [ ] TTC + commission.

## Desk Checklist

- [ ] `/admin`
- [ ] `/admin/demandes`
- [ ] `/admin/incidents`
- [ ] `/admin/finance`
- [ ] `/admin/kyc`
- [ ] `/admin/contournements`

## Build Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

## Release Decision

- [ ] No P0 incident open.
- [ ] API health OK.
- [ ] Front and Desk routes load.
- [ ] Prisma migrations applied.
- [ ] Docker restart counts stable.
- [ ] No secret or KYC document exposure.

