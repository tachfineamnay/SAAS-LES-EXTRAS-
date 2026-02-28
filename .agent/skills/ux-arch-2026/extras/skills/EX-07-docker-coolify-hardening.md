---
name: EX-07-docker-coolify-hardening
description: "P2 — Docker/Coolify hardening : multi-stage builds, utilisateur non-root, choix alpine vs slim documenté, HEALTHCHECK."
---

# EX-07 — Docker/Coolify Hardening

## Intent

Les Dockerfiles du projet doivent utiliser une architecture multi-stage pour minimiser la taille des images de production, exécuter les processus sous un utilisateur non-root pour limiter l'impact d'une compromission, et inclure des instructions `HEALTHCHECK` cohérentes avec la config Coolify.

## Pourquoi

Un Dockerfile mono-stage inclut le SDK Node.js, les devDependencies, et les sources dans l'image finale — 3–5x plus grand qu'une image optimisée. Un processus root dans un container peut modifier le système de fichiers hôte si le container est mal isolé. Ce projet utilise `node:20-alpine` ; documenter explicitement ce choix évite une régression vers `node:20` (5x plus lourd).

## Règles

### Multi-stage build

- **Stage `builder`** : installe toutes les dépendances (dev + prod), compile TypeScript
- **Stage `runner`** : copie uniquement les fichiers compilés + `node_modules` prod depuis le builder
- L'image finale ne contient pas : `typescript`, `ts-node`, `devDependencies`, sources `.ts`

### Utilisateur non-root

- Créer ou utiliser l'utilisateur `node` (présent dans toutes les images Node.js officielles)
- `USER node` dans le stage `runner` avant `CMD`
- `WORKDIR` doit être sous `/home/node/app` ou `/app` (accessible par l'utilisateur `node`)
- Les fichiers copiés doivent avoir les bonnes permissions : `COPY --chown=node:node`

### Alpine vs Slim

- **Choix actuel** : `node:20-alpine` (petit, basé sur musl libc)
- **Alpine** : ~50 MB, recommandé pour les services Node.js sans compilation native
- **Slim** : ~200 MB, basé sur Debian slim, recommandé si des modules natifs (ex. sharp, canvas) sont nécessaires
- **Documenter** le choix dans un commentaire dans le Dockerfile

### HEALTHCHECK

- Présent dans le Dockerfile (ou dans `docker-compose.coolify.yml` si Coolify ne lit pas le Dockerfile)
- Voir EX-02 pour les paramètres exacts

## Acceptance Criteria

- [ ] `apps/api/Dockerfile` utilise min. 2 stages (`builder` + `runner`)
- [ ] `apps/web/Dockerfile` utilise min. 2 stages
- [ ] Stage runner : `USER node` avant `CMD`
- [ ] Stage runner : `COPY --chown=node:node` pour les fichiers applicatifs
- [ ] Un commentaire documente le choix `alpine` dans chaque Dockerfile
- [ ] `HEALTHCHECK` présent dans Dockerfiles ou `docker-compose.coolify.yml`
- [ ] Image API finale < 300 MB (`docker image ls`)
- [ ] Image Web finale < 500 MB

## Snippets

```dockerfile
# apps/api/Dockerfile
# CHOIX BASE IMAGE: node:20-alpine (musl libc, ~50MB)
# Justification: aucune dépendance native ; alpine suffit.
# Si ajout de modules natifs (sharp, etc.) : migrer vers node:20-slim.

### Stage 1 — Builder ###
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances (dev + prod pour le build)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=apps/api

# Copier les sources et compiler
COPY apps/api ./apps/api
COPY apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

### Stage 2 — Runner ###
FROM node:20-alpine AS runner

# Sécurité: utilisateur non-root
WORKDIR /app

# Copier uniquement le nécessaire depuis le builder
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/prisma ./prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./package.json

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

```dockerfile
# apps/web/Dockerfile
# CHOIX BASE IMAGE: node:20-alpine (musl libc, ~50MB)
# Next.js standalone mode n'a pas de dépendances natives — alpine est suffisant.

### Stage 1 — Builder ###
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm ci --workspace=apps/web

COPY apps/web ./apps/web

WORKDIR /app/apps/web

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

### Stage 2 — Runner ###
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./public

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

> **Note Web** : le mode standalone Next.js requiert `output: "standalone"` dans `next.config.js`.

## Tests

```bash
# Construire et vérifier la taille de l'image API
docker build -t lesextras-api:test ./apps/api
docker image ls lesextras-api:test --format "{{.Size}}"
# Attendu : < 300MB

# Vérifier l'utilisateur dans le container
docker run --rm lesextras-api:test whoami
# Attendu : node (pas root)

# Vérifier le healthcheck
docker run -d --name test-api lesextras-api:test
sleep 45
docker inspect test-api --format "{{.State.Health.Status}}"
# Attendu : healthy
docker rm -f test-api
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Taille image API finale | < 300 MB |
| Taille image Web finale | < 500 MB |
| Processus root dans les containers | 0 |
| Temps de démarrage container (healthcheck green) | < 60 s |

## Rollout Plan

1. **Audit** : inspecter les Dockerfiles actuels — vérifier s'ils sont mono ou multi-stage
2. **Refactoriser** : ajouter le stage `runner` avec `USER node`
3. **Next.js standalone** : vérifier `output: "standalone"` dans `next.config.js`
4. **Build local** : `docker build -t test ./apps/api` et vérifier la taille
5. **Test healthcheck** : `docker run` + attendre 60s + `docker inspect`
6. **Déployer** : push sur la branche staging → Coolify rebuild
