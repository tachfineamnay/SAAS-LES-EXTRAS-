# CLAUDE.md

> Mis à jour le 19 mars 2026 — État réel du projet.

---

## Workflow Git

- **Toujours committer et pusher directement sur `main`**
- Ne pas créer de branches feature ou de branches `claude/*`
- Ne pas ouvrir de Pull Requests

---

## Contexte produit

**Les-Extras** — SaaS spécialisé **psycho-éducatif & médico-social** de terrain.

Deux piliers :
1. **SOS Renfort / Remplacement** — mise en relation urgente entre établissements et freelances
2. **Ateliers** — catalogue de services proposés par des freelances aux établissements

**Vocabulaire obligatoire** : `FREELANCE` / `ESTABLISHMENT` (jamais talent/client/candidat/formateur).  
**Mode** : **Dark-first** — `[data-theme="dark"]` sur `<html>`. Tokens clairs conservés dans `:root`, tokens sombres dans `[data-theme="dark"]`.  
**Design system** : Direction « Quietly Bold After Dark » — surfaces teal-noir (`rgba(13,44,52,.72)`), glassmorphism, coral UNIQUEMENT pour urgences/badges Urgent/boutons Postuler, teal `#0A6870` pour toutes les actions primaires (voir `PHASE2_DESIGN_SYSTEM.md`).

---

## Monorepo — Structure

```
/
├── apps/
│   ├── api/          # NestJS + Prisma — API REST (port 3001)
│   └── web/          # Next.js 14 App Router — Front + Desk (port 3000)
├── scripts/          # verify-system.ts, validate-build.ts
├── .agent/skills/    # Skills de contexte (nestjs-api, nextjs-frontend, prisma-schema, design-system…)
├── turbo.json
└── pnpm-workspace.yaml
```

**Package manager** : `pnpm@10.6.1`  
**Build system** : TurboRepo

---

## Commandes essentielles

```bash
# Démarrage complet (dev)
pnpm dev

# Build
pnpm build

# Typecheck (racine)
pnpm typecheck

# Lint
pnpm lint

# Prisma
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# Tests frontend (Vitest)
pnpm --filter @lesextras/web test
pnpm --filter @lesextras/web test:watch

# Tests backend (Jest)
pnpm --filter @lesextras/api test
pnpm --filter @lesextras/api test:cov

# Validation système
pnpm verify:system
pnpm validate:build
```

---

## Backend — apps/api

**Stack** : NestJS · Prisma · PostgreSQL · JWT  
**Port** : 3001  
**Entrée** : `src/main.ts`

### Modules existants

| Module | Route préfixe | Rôle |
|--------|--------------|------|
| `auth` | `/api/auth` | register, login, JWT |
| `users` | `/api/users` | profil, onboarding, me |
| `missions` | `/api/missions` | ReliefMission CRUD + candidatures |
| `bookings` | `/api/bookings` | Booking lifecycle complet |
| `services` | `/api/services` | Ateliers CRUD |
| `conversations` | `/api/conversations` | Messagerie |
| `reviews` | `/api/reviews` | Avis bidirectionnels |
| `notifications` | `/api/notifications` | Notifications in-app |
| `invoices` | `/api/invoices` | Factures PDF |
| `admin-users` | `/api/admin/users` | Admin — gestion utilisateurs |
| `admin-offers` | `/api/admin/offers` | Admin — modération services |

### Conventions backend

- Pattern module : `module.ts` / `controller.ts` / `service.ts` / `dto/`
- Auth guard : `@UseGuards(JwtAuthGuard)` via `@/auth/jwt-auth.guard`
- Utilisateur courant : `req.user` (type `AuthRequest` avec `id` et `role`)
- Imports Prisma : **chemin relatif** `../prisma/prisma.service` (pas d'alias absolu)
- DTO : utiliser `class-validator` (`@IsString()`, `@IsOptional()`, etc.)

### Schéma Prisma — Modèles clés

| Modèle | Description |
|--------|-------------|
| `User` | Identité (email, password, role, status, onboardingStep) |
| `Profile` | Données étendues (firstName, lastName, skills, siret, diplomaUrl…) |
| `ReliefMission` | Mission de renfort publiée par un ESTABLISHMENT |
| `Booking` | Relation entre un FREELANCE et une mission/service |
| `Service` | Atelier proposé par un FREELANCE |
| `Conversation` + `Message` | Messagerie directe |
| `Review` | Avis bidirectionnel post-mission |
| `Notification` | Notifications in-app |
| `Document` | Fichiers uploadés (avatar, diplômes…) |

**Rôles** : `ESTABLISHMENT` | `FREELANCE` | `ADMIN`  
**Statuts utilisateur** : `PENDING` | `VERIFIED` | `BANNED`

---

## Frontend — apps/web

**Stack** : Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Vitest  
**Port** : 3000  
**Entrée** : `src/app/layout.tsx`

### Structure des routes

```
src/app/
├── (auth)/           # /login, /register — pas de garde auth
├── (dashboard)/      # Routes authentifiées — layout avec AppShell + OnboardingGuard
│   ├── dashboard/    # Hub principal (role-based)
│   │   ├── renforts/ # Board matching établissement
│   │   ├── ateliers/ # Mes ateliers (freelance)
│   │   ├── inbox/    # Messagerie
│   │   └── packs/    # Crédits établissement
│   ├── marketplace/  # Catalogue missions + ateliers
│   │   ├── missions/[id]/
│   │   └── services/[id]/
│   ├── bookings/     # Gestion bookings
│   ├── finance/      # Factures / revenus
│   ├── account/      # Profil + paramètres
│   └── reservations/
├── (onboarding)/     # /welcome, /wizard
├── (admin)/          # /admin/** — interface admin
├── (admin-auth)/     # /admin/login
├── v2/               # ✨ Nouvelle landing page dark-glass (19 mars 2026)
├── ateliers/[id]     # Fiche atelier publique
├── freelances/[id]   # Fiche freelance publique
└── etablissements/   # Page publique établissements
```

### Session & Auth

```typescript
import { getSession } from "@/lib/session";
const session = await getSession(); // null si non connecté
// session.user = { id, email, role, onboardingStep }
```

- Session stockée dans cookie `lesextras_session` (JWT signé avec `SESSION_SECRET`)
- Le layout `(dashboard)/layout.tsx` redirige vers `/login` si pas de session
- `OnboardingGuard` redirige vers `/wizard` si `onboardingStep < 4`

### API calls (Server Actions / RSC)

```typescript
import { apiRequest } from "@/lib/api";
// Dans une Server Action :
const res = await apiRequest("/missions", { method: "POST", body: dto, token: session.token });
```

- URL de base : `process.env.API_BASE_URL` ?? `process.env.NEXT_PUBLIC_API_URL` ?? `http://localhost:3001/api`

### Composants clés

| Dossier | Contenu |
|---------|---------|
| `components/layout/` | `AppShell`, `Sidebar`, `Header`, `ActionPanel` |
| `components/dashboard/` | Widgets KPI, `BentoGrid`, `RenfortsWidget`, `MatchingMissionsWidget`… |
| `components/dashboard/establishment/` | `CandidateCard`, `PublishRenfortButton`, `RenfortsEmptyState`… |
| `components/modals/` | `RenfortModal`, `ApplyMissionModal`, `BookServiceModal`, `ReviewModal`… |
| `components/marketplace/` | `MarketplaceClient`, `FreelanceJobBoard`, `EstablishmentCatalogue`… |
| `components/onboarding/` | `OnboardingWizard`, `EstablishmentFlow`, `FreelanceFlow` |
| `components/cards/` | `MissionCard`, `ServiceCard` |
| `components/ui/` | shadcn/ui + composants custom |

### Tests frontend

- Framework : **Vitest** + **@testing-library/react** + **msw**
- Fichiers dans : `src/__tests__/`
- Commande : `pnpm --filter @lesextras/web test`

---

## Variables d'environnement

### apps/api

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://les-extras.com,https://desk.les-extras.com,...
SEED_DEMO_PASSWORD=password123
PORT=3001
```

### apps/web

```env
API_BASE_URL=http://localhost:3001/api        # ou https://api.les-extras.com/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
SESSION_SECRET=...
APP_RUNTIME=front                             # ou "desk" pour l'interface admin
DEMO_USER_PASSWORD=password123
```

---

## Déploiement (Coolify v4)

3 services distincts — chacun avec son Dockerfile :

| Service | Domaine cible | Dockerfile |
|---------|--------------|------------|
| Front (web client) | `les-extras.com` | `apps/web/Dockerfile` avec `APP_RUNTIME=front` |
| Desk (admin) | `desk.les-extras.com` | `apps/web/Dockerfile` avec `APP_RUNTIME=desk` |
| API | `api.les-extras.com` | `apps/api/Dockerfile` |

---

## Phases du projet

| Phase | Fichier | Statut |
|-------|---------|--------|
| Phase 2 — Design System | `PHASE2_DESIGN_SYSTEM.md` | ✅ Livré |
| Phase 3 — Backend completion | `PHASE3_BACKEND_COMPLETION.md` | ✅ Livré |
| Phase 4 — UX Flows | `PHASE4_UX_FLOWS.md` + `PHASE4A_UX_PLAN.md` | ✅ Livré |
| Phase 6 — QA / Tests / Release | `PHASE6_QA_TESTS_RELEASE.md` | 🚧 En cours |
| Dark mode + Landing V2 | `apps/web/src/app/v2/page.tsx` | ✅ Livré (19 mars 2026) |

---

## Comptes démo (seed)

| Email | Rôle |
|-------|------|
| `directeur@mecs-avenir.fr` | ESTABLISHMENT |
| `karim.educ@gmail.com` | FREELANCE |
| `admin@lesextras.local` | ADMIN |

Mot de passe : contrôlé par `SEED_DEMO_PASSWORD` → `DEMO_USER_PASSWORD` → `password123`
