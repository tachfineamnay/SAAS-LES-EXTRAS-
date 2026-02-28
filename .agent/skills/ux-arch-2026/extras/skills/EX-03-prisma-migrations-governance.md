---
name: EX-03-prisma-migrations-governance
description: "P0 — Gouvernance Prisma migrations : dev vs prod, anti-drift, et sécurité du schéma en production."
---

# EX-03 — Gouvernance Prisma Migrations

## Intent

Les migrations Prisma suivent un protocole strict : `prisma migrate dev` est réservé au développement local, `prisma migrate deploy` est la seule commande autorisée en production. Ce skill formalise ce contrat, documente le workflow complet et définit les garde-fous contre le drift de schéma.

## Pourquoi

`prisma migrate dev` en production est **destructeur** : il peut marquer des migrations comme "applied" sans les avoir exécutées, créer un drift entre le schéma appliqué et la DB réelle, ou demander confirmation sur stdin (bloquant le container). Dans ce projet, le Dockerfile API doit utiliser `prisma migrate deploy` uniquement. Un drift non détecté peut causer des erreurs runtime silencieuses (champs manquants, types incorrects).

## Règles

- **Développement** : `npx prisma migrate dev --name <nom_descriptif>` — génère le fichier SQL, l'applique localement, met à jour `_prisma_migrations`
- **Production** : `npx prisma migrate deploy` — applique uniquement les migrations commitées non-encore-appliquées
- **Jamais** : `prisma migrate dev` en production, `prisma db push` (bypasse le système de migrations), `prisma migrate reset` en prod
- **Les migrations sont commitées** : le dossier `apps/api/prisma/migrations/` fait partie du repo Git
- **Seed** : `prisma:seed` ne tourne qu'avec `NODE_ENV=development` (guard dans `package.json`)
- **Drift check** : avant tout déploiement, `prisma migrate status` doit retourner "Database schema is up to date"
- **Prisma version** : pinée à `5.22.0` dans le Dockerfile API (`npm install prisma@5.22.0 -g` ou dans `package.json`)

## Acceptance Criteria

- [ ] `apps/api/Dockerfile` contient `npx prisma migrate deploy` dans l'entrypoint/CMD (pas `migrate dev`)
- [ ] `apps/api/prisma/migrations/` est commitée dans Git
- [ ] `prisma migrate status` retourne `All migrations have been applied` en prod
- [ ] Le script `prisma:seed` vérifie `NODE_ENV !== "production"` avant d'exécuter
- [ ] `prisma generate` est exécuté dans le Dockerfile avant le build NestJS

## Snippets

```dockerfile
# apps/api/Dockerfile — entrypoint de migration correct
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

```typescript
// apps/api/prisma/seed.ts — guard NODE_ENV
if (process.env.NODE_ENV === "production") {
  console.error("Seeding is disabled in production. Aborting.");
  process.exit(1);
}
// ... seed logic
```

```bash
# Workflow développeur (local uniquement)
cd apps/api

# 1. Modifier schema.prisma
# 2. Générer la migration
npx prisma migrate dev --name add_index_booking_status

# 3. Vérifier
npx prisma migrate status

# 4. Commiter
git add prisma/migrations/
git commit -m "feat(prisma): add index on booking status"
```

```bash
# Vérifier le drift avant déploiement
DATABASE_URL=<prod_url> npx prisma migrate status
# Doit afficher : "All migrations have been applied"
```

## Tests

### Unit

```javascript
// Vérifier que seed.ts plante si NODE_ENV=production (pseudo)
import { execSync } from "node:child_process";
import assert from "node:assert";

try {
  execSync("NODE_ENV=production npx prisma db seed", {
    cwd: "apps/api",
    stdio: "pipe",
  });
  assert.fail("Should have thrown");
} catch (err) {
  assert.ok(err.stderr.includes("disabled in production"));
}
```

### Integration

```bash
# Vérifier migrate deploy (avec une DB de test)
DATABASE_URL=<test_db_url> npx prisma migrate deploy
# Attendu : exit code 0, toutes migrations appliquées
```

### CI Gate

```bash
# Commande CI à ajouter au pipeline
cd apps/api && npx prisma migrate status
# Échoue si des migrations sont en attente non-commitées
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Drift détecté par migrate status en prod | 0 |
| Migrations non-commitées poussées en prod | 0 |
| Temps d'application des migrations au démarrage | < 10 s |

## Rollout Plan

1. **Vérifier** : `apps/api/Dockerfile` — s'assurer que `migrate deploy` est dans le CMD.
2. **Vérifier** : `prisma/migrations/` est présent dans Git (non gitignored).
3. **Ajouter** : guard `NODE_ENV` dans `prisma/seed.ts`.
4. **Documenter** : `.env.example` — comment switcher entre DB locale et prod.
5. **CI** : ajouter `prisma migrate status` comme étape de validation.
6. **Coolify** : vérifier que la variable `DATABASE_URL` pointe vers la DB prod au démarrage.
