# UX-Arch 2026 — Extras Pack

**Pack ID**: `ux-arch-2026-extras`  
**Version**: `1.0.0`  
**Applicable to**: `SAAS-LES-EXTRAS` (TurboRepo / Next.js 14 / NestJS 10 / Prisma / PostgreSQL / Docker / Coolify)

## Objectif

Ce pack formalise les règles d'architecture et de qualité qui garantissent la stabilité, la sécurité et la maintenabilité du mono-repo. Il complète les skills existants (project-overview, nestjs-api, prisma-schema, auth-flow, deployment, business-logic, nextjs-frontend) en ajoutant 9 skills orientés "garde-fous opérationnels".

## Structure

```
ux-arch-2026/extras/
├── README.md            ← ce fichier
├── skills.json          ← registre canonique du pack
├── skills/
│   ├── EX-01-multiruntime-front-desk.md
│   ├── EX-02-healthchecks-readiness.md
│   ├── EX-03-prisma-migrations-governance.md
│   ├── EX-04-env-contract.md
│   ├── EX-05-auth-cookies-csrf.md
│   ├── EX-06-db-constraints-indexes.md
│   ├── EX-07-docker-coolify-hardening.md
│   ├── EX-08-ci-observability-gates.md
│   └── EX-09-stripe-livekit-safety.md
├── examples/
│   ├── env/env.ts       ← schéma Zod APP_RUNTIME + URLs
│   └── health/route.ts  ← handler GET /health enrichi
└── tests/
    ├── skills-json.spec.mjs   ← valide la structure de skills.json
    └── env-contract.spec.mjs  ← valide le schéma Zod env
```

## Priorités

| Priorité | Skills | Action |
|----------|--------|--------|
| **P0** (Bloquant) | EX-01, EX-02, EX-03 | À implémenter **avant** toute mise en production |
| **P1** (Important) | EX-04, EX-05, EX-06 | À implémenter dans le sprint courant |
| **P2** (Amélioration) | EX-07, EX-08, EX-09 | À planifier dans l'itération suivante |

## Exécution des Tests

```bash
# Depuis la racine du repo
npm run validate:skills

# Ou directement
node --test .agent/skills/ux-arch-2026/extras/tests/*.spec.mjs
```

## Quality Gate

Le fichier `scripts/validate-build.ts` a été étendu pour vérifier :
- La présence de `skills.json`
- La présence de chacun des 9 fichiers `EX-01..EX-09`

Si l'un de ces fichiers manque, `npm run validate:build` échoue avec code exit 1.

## Conventions de Format

Chaque skill `.md` suit la structure :
1. **Intent** — but du skill en 1 paragraphe
2. **Pourquoi** — risque concret dans ce repo
3. **Règles** — bullets actionnables
4. **Acceptance criteria** — checklist vérifiable
5. **Snippets** — code ou config de référence
6. **Tests** — unit / int / e2e
7. **Métriques** — KPIs mesurables
8. **Rollout plan** — déploiement sans régression
