---
name: EX-08-ci-observability-gates
description: "P2 — CI quality gates + observability : pipeline lint/typecheck/tests, logs structurés JSON, rate limiting, throttling sur endpoints publics."
---

# EX-08 — CI Quality Gates + Observability

## Intent

Le pipeline CI doit bloquer tout merge qui ne passe pas lint + typecheck + build + validate:skills. En production, les logs doivent être en JSON structuré pour être parsables par un système de monitoring (Grafana, Loki, etc.), et les endpoints publics (auth, wall/services) doivent être protégés par du rate limiting.

## Pourquoi

Actuellement, le repo n'a pas de pipeline CI documenté au-delà des scripts npm. Sans gate CI, des régressions TypeScript ou de build peuvent atteindre la prod (vécu dans les conversations précédentes — erreurs de types en déploiement). Les logs plain-text en prod compliquent le debugging. Le rate limiting est absent sur les endpoints publics, exposant le service à des attaques par force brute.

## Règles

### CI Pipeline (ordre recommandé)

1. `npm run typecheck` — TypeScript strict, 0 erreur acceptée
2. `npm run lint` — ESLint, 0 erreur acceptée
3. `npm run build` — Build complet (TurboRepo)
4. `npm run validate:build` — Vérifie les fichiers critiques et scripts
5. `npm run validate:skills` — Vérifie le pack UX-Arch 2026

### Logs Structurés (NestJS)

- Utiliser le logger NestJS avec format JSON en production
- Chaque log doit inclure : `timestamp`, `level`, `context`, `message`, et `userId` si disponible
- Pas de `console.log()` dans le code de production (remplacer par le logger NestJS)

### Rate Limiting

- Protéger avec `@nestjs/throttler` les endpoints :
  - `POST /api/auth/login` : 5 req/minute par IP
  - `POST /api/auth/register` : 3 req/minute par IP
  - `GET /api/wall/services/public/list` : 60 req/minute par IP
- Configurer `ThrottlerModule` globalement dans `app.module.ts`

## Acceptance Criteria

- [ ] Pipeline CI exécute typecheck + lint + build + validate:build + validate:skills
- [ ] `npm run typecheck` retourne exit 0 (0 erreur TypeScript)
- [ ] `npm run lint` retourne exit 0
- [ ] `POST /api/auth/login` retourne `429` après 5 tentatives en < 1 minute
- [ ] Logs NestJS en production sont en JSON (vérifiable dans les logs Coolify)
- [ ] `console.log()` absent du code de production (remplacé par `this.logger`)

## Snippets

```typescript
// apps/api/src/app.module.ts — ThrottlerModule
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 60000, // 1 minute en ms
        limit: 60,  // 60 req par défaut
      },
    ]),
    // ... autres modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

```typescript
// apps/api/src/auth/auth.controller.ts — override throttle sur login
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Post("login")
  async login(@Body() dto: LoginDto) { ... }

  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @Post("register")
  async register(@Body() dto: RegisterDto) { ... }
}
```

```typescript
// apps/api/src/main.ts — logger JSON en production
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn", "log"] // JSON logger via Winston ou pino
        : new Logger(),
  });
}
```

```yaml
# .github/workflows/ci.yml (exemple GitHub Actions)
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npm run validate:build
      - run: npm run validate:skills
```

## Tests

### Rate Limiting

```bash
# Test : 6 tentatives login → 5 succès (ou 401) + 1 retour 429
for i in $(seq 1 6); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 6ème ligne attendue : 429
```

### Logs

```bash
# En production (NODE_ENV=production), les logs doivent être JSON parsables
docker logs api 2>&1 | head -5 | jq .
# Attendu : pas d'erreur jq (logs valides JSON)
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Durée CI end-to-end | < 5 min |
| Erreurs TypeScript bloquées par CI | 100% |
| Endpoints publics protégés par rate limiting | 100% |
| Taux d'erreur 5xx sur 7 jours | < 0.1% |

## Rollout Plan

1. **Installer** : `npm install @nestjs/throttler -w @lesextras/api`
2. **Configurer** : `ThrottlerModule` dans `app.module.ts`
3. **Appliquer** : `@Throttle()` sur les endpoints sensibles
4. **CI** : créer `.github/workflows/ci.yml` (ou équivalent Coolify/Gitea)
5. **Logger** : configurer le logger JSON (Winston ou Pino) en production
6. **Valider** : `npm run validate:skills` passe en CI
