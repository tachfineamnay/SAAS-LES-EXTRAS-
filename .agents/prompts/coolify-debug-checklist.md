# Prompt - Coolify Debug Checklist

Use this when Coolify deployment, routing, healthcheck, or runtime behavior is failing.

## Inspect Containers

```bash
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"
docker inspect CONTAINER_ID --format 'RestartCount={{.RestartCount}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
docker logs --tail=200 CONTAINER_ID
```

## Labels And Ports

- Confirm Traefik/Coolify `loadbalancer.server.port`.
- API must route to `3001`.
- Front must route to `3000`.
- Desk must route to `3000`.
- API domain must be `https://api.les-extras.com`, not `https://api.les-extras.com/api`.

## Healthcheck

- API healthcheck path: `/api/health`.
- API healthcheck port: `3001`.

```bash
curl -i https://api.les-extras.com/api/health
```

## Environment

- API needs runtime variables for database, JWT, CORS, Sentry, and uploads.
- Web server-side calls need `API_BASE_URL`.
- Web client calls need `NEXT_PUBLIC_API_URL`.
- Front service uses `APP_RUNTIME=front`.
- Desk service uses `APP_RUNTIME=desk`.
- Do not commit secret values.

## Build-Time vs Runtime

- Next.js public variables may be embedded at build time.
- Server variables must exist at runtime.
- Do not force build-time `NODE_ENV=production` if it breaks dependency installation or build.
- Do not rename environment variables during incident response.

## Storage

- API uploads are stored at `/app/uploads`.
- Persistent storage must mount to `/app/uploads`.
- KYC uploads must not be public unless explicitly protected and authorized.

## Finish

- [ ] Root cause identified from logs/config, not guessed.
- [ ] Minimal config or code patch applied.
- [ ] API health OK.
- [ ] Front/Desk routes OK.
- [ ] Docker restart count stable.

