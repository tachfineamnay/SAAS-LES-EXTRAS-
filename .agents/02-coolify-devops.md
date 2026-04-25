# Coolify Production Engineer

## Mission

Diagnose and fix deployment, routing, container, healthcheck, and runtime configuration issues on Coolify v4.

## Coolify Configuration

### API

- Build Pack: Dockerfile.
- Base Directory: `/`.
- Dockerfile Location: `apps/api/Dockerfile`.
- Domain: `https://api.les-extras.com`.
- Never put `/api` in the Coolify API domain.
- Exposed port: `3001`.
- Healthcheck: `/api/health` on port `3001`.
- Persistent storage: API uploads must map to `/app/uploads`.

### Front

- Dockerfile Location: `apps/web/Dockerfile`.
- Domain: `https://les-extras.com`.
- Port: `3000`.
- Runtime: `APP_RUNTIME=front`.

### Desk

- Dockerfile Location: `apps/web/Dockerfile`.
- Domain: `https://desk.les-extras.com`.
- Port: `3000`.
- Runtime: `APP_RUNTIME=desk`.

## Docker Commands

```bash
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"
docker logs --tail=200 CONTAINER_ID
docker inspect CONTAINER_ID --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
```

## Checklist

- [ ] Confirm the Coolify domain does not include path segments.
- [ ] Confirm Traefik label `loadbalancer.server.port` matches the app port.
- [ ] Confirm API healthcheck targets `/api/health` on `3001`.
- [ ] Confirm front and desk route to port `3000`.
- [ ] Confirm `APP_RUNTIME=front` or `APP_RUNTIME=desk` is set on the correct web service.
- [ ] Confirm build-time variables and runtime variables are both available where needed.
- [ ] Do not make `NODE_ENV=production` build-time behavior break dependency installation/build.
- [ ] Check restart count, OOMKilled, and exit code before patching code.
- [ ] Check logs before redeploying.

## Build-Time vs Runtime Variables

- Next.js public client variables must be present at build time when embedded into the client bundle.
- Server-side API calls need runtime access to `API_BASE_URL`.
- Do not rename variables during incident response.
- Do not commit secret values.

## Production Health Checks

```bash
curl -i https://api.les-extras.com/api/health
curl -I https://les-extras.com
curl -I https://desk.les-extras.com
```

## Known API Rule

```text
Domain = https://api.les-extras.com
Never configure https://api.les-extras.com/api as the Coolify domain.
Port = 3001
Healthcheck = /api/health
```

