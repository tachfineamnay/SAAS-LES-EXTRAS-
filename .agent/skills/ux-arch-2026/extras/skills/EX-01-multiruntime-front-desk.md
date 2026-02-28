---
name: EX-01-multiruntime-front-desk
description: "P0 — Contrat multi-runtime : APP_RUNTIME distingue le container Front (utilisateurs) du container Desk (admin). Règles de middleware, matcher et tests anti-boucle."
---

# EX-01 — Contrat multi-runtime Front vs Desk

## Intent

Ce repo déploie **deux containers Next.js distincts** depuis la même image : le container **Front** (utilisateurs finaux) et le container **Desk** (backoffice admin). La bascule se fait exclusivement via la variable d'environnement `APP_RUNTIME` (`front` | `desk`). Ce skill formalise le contrat entre les deux runtimes et les garde-fous qui empêchent les mauvaises routes d'être exposées.

## Pourquoi

Sans ce contrat, un déploiement mal configuré sur Coolify peut exposer l'interface admin aux utilisateurs finaux, ou bien créer des boucles de redirection 3xx infinies (ex. : Front qui redirige `/marketplace` → `/marketplace`). Le middleware actuel (`apps/web/src/middleware.ts`) implémente déjà la logique de base ; ce skill la documente et l'encadre de tests.

## Règles

- **`APP_RUNTIME`** est la seule source de vérité pour le routing multi-runtime. Ne jamais utiliser `hostname` ou `request.headers` pour déduire le runtime.
- **Runtime `front`** : les routes `/admin/*` sont redirigées vers `/marketplace`. Toutes les autres routes passent (`NextResponse.next()`).
- **Runtime `desk`** : la racine `/` redirige vers `/admin`. Toute route non-admin redirige vers `/admin`.
- **`/health`** : toujours passé en `NextResponse.next()` dans les deux runtimes (healthcheck Docker/Coolify).
- **`/api/admin-auth/*`** : toujours passé en `NextResponse.next()` (endpoints d'auth admin interne).
- **Matcher** : exclure `_next/`, `favicon.ico`, `robots.txt`, `sitemap.xml` pour éviter les redirections parasites sur les assets statiques.
- **Valeur par défaut** : si `APP_RUNTIME` est absente ou invalide, le middleware choisit `front` (le runtime le moins privilégié).
- **Boucles** : toute redirection doit pointer vers une URL que le middleware laisse passer ou qui sort du périmètre du matcher.

## Acceptance Criteria

- [ ] `APP_RUNTIME=front` → `GET /admin` retourne `302` vers `/marketplace`
- [ ] `APP_RUNTIME=front` → `GET /marketplace` retourne `200` (pas de boucle)
- [ ] `APP_RUNTIME=desk` → `GET /` retourne `302` vers `/admin`
- [ ] `APP_RUNTIME=desk` → `GET /admin` avec session valide retourne `200`
- [ ] `APP_RUNTIME=desk` → `GET /admin` sans session retourne `302` vers `/admin/login`
- [ ] `GET /health` retourne `200` dans les deux runtimes
- [ ] Aucune boucle de redirection (3xx count > 5) détectable

## Snippets

```typescript
// apps/web/src/middleware.ts — extrait canon
const FRONT_RUNTIME = "front";
const DESK_RUNTIME = "desk";

function getAppRuntime(): "front" | "desk" {
  const runtime = (process.env.APP_RUNTIME ?? FRONT_RUNTIME).toLowerCase();
  return runtime === DESK_RUNTIME ? DESK_RUNTIME : FRONT_RUNTIME;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
```

```typescript
// Test anti-boucle — vérification logique (pseudo)
// Front : /marketplace ne doit pas être une route admin,
// sinon la redirection créerait une boucle infinie.
// Vérifier que aucune route dans FRONT_RUNTIME n'est 
// dans le périmètre admin ET dans le périmètre de redirection.
```

## Tests

### Unit

Tester `getAppRuntime()` en isolation :

- `APP_RUNTIME=undefined` → `"front"`
- `APP_RUNTIME=DESK` (majuscules) → `"desk"` (toLowerCase)
- `APP_RUNTIME=invalid` → `"front"` (fallback sécurisé)

### Integration (playwright ou node:test + mock fetch)

```bash
# Simuler runtime front
APP_RUNTIME=front node --test apps/web/tests/middleware.spec.mjs

# Simuler runtime desk  
APP_RUNTIME=desk node --test apps/web/tests/middleware.spec.mjs
```

### E2E

- Déployer en staging avec `APP_RUNTIME=front`, naviguer vers `/admin`, vérifier redirect vers `/marketplace`
- Vérifier via curl que `/health` retourne `200` sans suivi de redirect

## Métriques

| Métrique | Cible |
|----------|-------|
| Boucles 3xx en prod (Coolify logs) | 0 |
| Routes admin exposées depuis runtime Front | 0 |
| Couverture des tests middleware | 100% des branches |

## Rollout Plan

1. **Vérifier** : le middleware actuel (`apps/web/src/middleware.ts`) respecte déjà ce contrat.
2. **Ajouter** : tests unitaires pour `getAppRuntime()` si absents.
3. **Configurer** : Coolify — variable `APP_RUNTIME=front` sur le service web Front, `APP_RUNTIME=desk` sur le service web Desk.
4. **Valider** : `npm run validate:build` passe sans erreur.
5. **Monitorer** : vérifier les logs Coolify post-déploiement pour l'absence de boucles.
