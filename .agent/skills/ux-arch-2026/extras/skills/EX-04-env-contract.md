---
name: EX-04-env-contract
description: "P1 — Contrat env build vs runtime : schéma Zod pour APP_RUNTIME, API_BASE_URL, NEXT_PUBLIC_API_URL avec fail-fast et séparation des secrets."
---

# EX-04 — Contrat Env Build vs Runtime

## Intent

Les variables d'environnement Next.js suivent deux cycles distincts : celles préfixées `NEXT_PUBLIC_*` sont inlinées au **build** (immuables en runtime), les autres sont lues au **runtime** (server-side uniquement). Ce skill impose un schéma Zod qui valide toutes les variables au démarrage, fait planter le process immédiatement si une variable obligatoire est manquante ou invalide, et garantit qu'aucun secret ne traverse la frontière `NEXT_PUBLIC_`.

## Pourquoi

Un démarrage silencieux avec `API_BASE_URL` mal configurée fait que toutes les requêtes API échouent sans message clair — difficile à diagnostiquer en prod. De plus, une clé Stripe ou un JWT secret préfixé `NEXT_PUBLIC_` serait exposé dans le bundle JavaScript envoyé au navigateur. Ces deux risques sont évitables par un schéma de validation au démarrage.

## Règles

- **Schéma Zod** défini dans `apps/web/src/lib/env.ts`, importé dans `apps/web/src/app/layout.tsx` (ou `instrumentation.ts`)
- **`APP_RUNTIME`** : `z.enum(["front", "desk"])`, valeur par défaut `"front"`
- **`API_BASE_URL`** : `z.string().url()` — server-side uniquement (SSR, server actions, route handlers)
- **`NEXT_PUBLIC_API_URL`** : `z.string().url()` — client-side uniquement (fetch dans les composants React)
- **Fail-fast** : si la validation échoue, `process.exit(1)` avec un message d'erreur explicite
- **Aucun secret** ne doit commencer par `NEXT_PUBLIC_` (JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY, etc.)
- **`.env.example`** : toutes les variables obligatoires documentées avec une valeur d'exemple
- **Build-time** : `NEXT_PUBLIC_*` doivent être définies au moment du `next build`, pas seulement au runtime

## Acceptance Criteria

- [ ] `apps/web/src/lib/env.ts` exporte un objet `env` validé par Zod
- [ ] Le process plante au démarrage si `API_BASE_URL` est absente ou invalide
- [ ] `NEXT_PUBLIC_API_URL` invalide fait planter le démarrage
- [ ] Aucune variable `NEXT_PUBLIC_*` ne contient un secret (JWT, DB, clé Stripe)
- [ ] `apps/web/.env.example` et `apps/api/.env.example` sont à jour
- [ ] Test : schéma rejette une URL invalide (ex. `"not-a-url"`)
- [ ] Test : schéma accepte la config minimale valide

## Snippets

```typescript
// apps/web/src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  APP_RUNTIME: z.enum(["front", "desk"]).default("front"),
  // Server-side only (NE PAS préfixer NEXT_PUBLIC_)
  API_BASE_URL: z.string().url({
    message: "API_BASE_URL must be a valid URL (e.g. http://localhost:3001/api)",
  }),
  // Client-side (inliné au build)
  NEXT_PUBLIC_API_URL: z.string().url({
    message: "NEXT_PUBLIC_API_URL must be a valid URL",
  }),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
```

```env
# apps/web/.env.example
APP_RUNTIME=front
API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# apps/api/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/lesextras
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
PORT=3001
```

## Tests

Voir `tests/env-contract.spec.mjs` dans ce pack pour les tests automatisés.

### Cas couverts

- Rejette `API_BASE_URL=not-a-url` (ZodError)
- Accepte `API_BASE_URL=http://localhost:3001/api` (valide)
- Default `APP_RUNTIME` à `"front"` si absent
- Rejette `APP_RUNTIME=invalid`

## Métriques

| Métrique | Cible |
|----------|-------|
| Démarrages silencieux avec env invalide | 0 |
| Variables obligatoires documentées dans .env.example | 100% |
| Secrets exposés via NEXT_PUBLIC_ | 0 |

## Rollout Plan

1. **Installer** : `npm install zod -w @lesextras/web`
2. **Créer** : `apps/web/src/lib/env.ts` avec le schéma Zod
3. **Importer** : dans `apps/web/src/app/layout.tsx` (ou `instrumentation.ts` pour Next 14+)
4. **Tester** : démarrer avec une variable manquante, vérifier le message d'erreur
5. **Mettre à jour** : `apps/web/.env.example` et `apps/api/.env.example`
6. **Ci** : `npm run typecheck` intègre automatiquement la validation des types Zod
