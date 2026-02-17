# LesExtras Monorepo

Monorepo TurboRepo avec :

- `apps/web` : Next.js 14 + Tailwind CSS + base Shadcn UI
- `apps/api` : NestJS + Prisma

## Démarrage

```bash
npm install
npm run dev
```

## Seed démo (LesExtras)

Pré-requis: configurer `DATABASE_URL` pour `apps/api`.

```bash
npm run prisma:migrate
npm run prisma:seed
```

Comptes démo seedés:

- `directeur@mecs-avenir.fr` / `LesExtrasDemo!2026`
- `karim.educ@gmail.com` / `LesExtrasDemo!2026`

## Déploiement Coolify v4 (Docker Stack)

Le repo fournit un stack compose prêt pour Coolify:

- `docker-compose.coolify.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

### Variables à configurer dans Coolify

- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_DB` (optionnel, défaut: `lesextras`)
- `POSTGRES_USER` (optionnel, défaut: `lesextras`)
- `JWT_SECRET` (secret)
- `JWT_EXPIRES_IN` (optionnel, défaut: `7d`)
- `CORS_ORIGINS` (optionnel, défaut: allowlist prod + localhost)
- `NEXT_PUBLIC_API_URL` (optionnel, défaut: `https://api.les-extras.com/api`)
- `APP_WEB_HOST` (optionnel, défaut: `les-extras.com`)
- `APP_DESK_HOST` (optionnel, défaut: `desk.les-extras.com`)
- `DEMO_USER_PASSWORD` (optionnel, défaut: `LesExtrasDemo!2026`)

### Procédure

1. Créer un **Stack** dans Coolify depuis ce repo Git.
2. Sélectionner `docker-compose.coolify.yml`.
3. Déclarer les variables/secrets ci-dessus.
4. Configurer les domaines:
   - `web`: `les-extras.com` et `desk.les-extras.com`
   - `api`: `api.les-extras.com`
5. Déployer.

Au démarrage, l'API exécute automatiquement:

- `prisma migrate deploy`

Le seed démo n'est pas exécuté automatiquement en production.

### Préflight local Docker

```bash
docker compose -f docker-compose.coolify.yml config
docker compose -f docker-compose.coolify.yml build
docker compose -f docker-compose.coolify.yml up -d
```

## Routing multi-domaines (prod)

- `les-extras.com`:
  - `/` redirige vers `/marketplace`
  - `/admin*` redirige vers `/marketplace`
- `desk.les-extras.com`:
  - accès back-office uniquement
  - `/admin/login` public
  - `/admin*` protégé par session admin JWT
- `api.les-extras.com`:
  - API NestJS sous préfixe `/api`

## Checklist DNS (avant go-live)

1. Créer un enregistrement DNS pour `les-extras.com` vers Coolify.
2. Créer un enregistrement DNS pour `desk.les-extras.com` vers Coolify.
3. Créer un enregistrement DNS pour `api.les-extras.com` vers Coolify.
4. Vérifier le certificat TLS auto-généré sur les 3 domaines.
