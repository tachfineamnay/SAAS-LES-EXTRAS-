---
name: EX-02-healthchecks-readiness
description: "P0 — Healthchecks & readiness : web /health et api /api/health doivent être cohérents avec les configurations Docker et Coolify."
---

# EX-02 — Healthchecks & Readiness

## Intent

Chaque service doit exposer un endpoint de santé léger, répondant rapidement (< 200 ms) et sans authentification. Ces endpoints sont utilisés par Docker pour redémarrer les containers en échec, et par Coolify pour déterminer si un déploiement est réussi. Ce skill définit le contrat exact des deux endpoints et leur cohérence avec la config Docker/Coolify.

## Pourquoi

Sans healthcheck Docker, Coolify peut déclarer un service "UP" alors que le process NestJS est en état de deadlock ou que Next.js n'a pas terminé son démarrage. Résultat : des requêtes utilisateurs sont routées vers un service cassé. Les deux endpoints existent déjà dans le repo ; ce skill les standardise.

## Règles

### Web (`apps/web/src/app/health/route.ts`)

- Répondre **HTTP 200** sans authenfication requise
- Corps de réponse : soit `"OK"` (plain text), soit JSON `{ status: "ok", service: "lesextras-web" }`
- Temps de réponse < **200 ms** (pas de requête DB, pas d'appel réseau)
- Le middleware doit laisser passer `/health` sans redirection (`NextResponse.next()`)

### API (`apps/api/src/health.controller.ts`)

- Route : `GET /api/health` (préfixe `/api` global défini dans `main.ts`)
- Répondre **HTTP 200** avec `{ status: "ok", service: "lesextras-api" }`
- Pas de `@UseGuards()` sur ce controller
- Ajouter optionnellement `uptime: process.uptime()` pour le monitoring

### Docker/Coolify

- Chaque Dockerfile doit inclure une instruction `HEALTHCHECK`
- `docker-compose.coolify.yml` doit reprendre les healthchecks sur les services `api` et `web`
- Intervalle recommandé : 30s, timeout : 10s, retries : 3, start_period : 40s

## Acceptance Criteria

- [ ] `GET /health` (web) → HTTP 200 en < 200 ms, sans authentification
- [ ] `GET /api/health` (api) → HTTP 200, body `{ status: "ok" }`
- [ ] Le middleware laisse passer `/health` sans redirect (testé avec `APP_RUNTIME=desk`)
- [ ] `apps/api/Dockerfile` contient `HEALTHCHECK CMD curl -f http://localhost:3001/api/health || exit 1`
- [ ] `apps/web/Dockerfile` contient `HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1`
- [ ] `docker-compose.coolify.yml` définit `healthcheck` pour les services `api` et `web`

## Snippets

```typescript
// apps/web/src/app/health/route.ts — version enrichie
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "lesextras-web" },
    { status: 200 }
  );
}
```

```typescript
// apps/api/src/health.controller.ts — version enrichie
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "ok",
      service: "lesextras-api",
      uptime: Math.floor(process.uptime()),
    };
  }
}
```

```dockerfile
# apps/api/Dockerfile — instruction healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
```

```yaml
# docker-compose.coolify.yml — healthcheck service
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Tests

### Unit (node:test)

```javascript
// Vérifier que le handler retourne le bon status
import assert from "node:assert";

const response = await fetch("http://localhost:3000/health");
assert.strictEqual(response.status, 200);
```

### Integration

```bash
# Test local (API à tourner)
curl -f http://localhost:3001/api/health
# Attendu : {"status":"ok","service":"lesextras-api"}

# Test local (Web à tourner)
curl -f http://localhost:3000/health
# Attendu : HTTP 200
```

### Validate-build

Le script `scripts/validate-build.ts` vérifie la présence de `apps/api/src/health.controller.ts` via `requiredFiles`.

## Métriques

| Métrique | Cible |
|----------|-------|
| Temps de réponse /health p99 | < 200 ms |
| Uptime service mesuré par Coolify | ≥ 99.9% |
| Faux positifs Docker (container "up" mais cassé) | 0 |

## Rollout Plan

1. **Vérifier** : les deux endpoints existent et répondent 200 (déjà en place).
2. **Enrichir** : ajouter `service` + `uptime` au handler API si absent.
3. **Docker** : ajouter `HEALTHCHECK` dans les deux Dockerfiles.
4. **Compose** : ajouter `healthcheck` dans `docker-compose.coolify.yml`.
5. **Coolify** : configurer le health path sur chaque service (`/health` pour web, `/api/health` pour api).
6. **Tester** : `docker compose up --build`, vérifier `docker ps` affiche `(healthy)` pour chaque service.
