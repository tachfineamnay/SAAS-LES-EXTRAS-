# CLAUDE.md

> Mis à jour le 30 mars 2026 — État réel du projet.

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

## Stack technique — Versions

### Backend (apps/api)

| Dépendance | Version |
|------------|---------|
| NestJS | `^10.4.15` |
| Prisma | `^6.3.1` |
| Passport + JWT | `^0.7.0` / `^4.0.1` |
| Sentry (NestJS) | `^10.43.0` |
| class-validator | `^0.14.1` |
| bcryptjs | `^2.4.3` |
| nodemailer | `^8.0.2` |
| pdfkit | `^0.17.2` |
| date-fns | `^3.6.0` |
| helmet | `^8.1.0` |

### Frontend (apps/web)

| Dépendance | Version |
|------------|---------|
| Next.js | `^14.2.0` |
| React | `^18.3.1` |
| Tailwind CSS | `^3.4.17` |
| Sentry (Next.js) | `^10.43.0` |
| framer-motion | `^12.34.1` |
| react-hook-form | `^7.71.1` |
| zod | `^4.3.6` |
| zustand | `^5.0.11` |
| lucide-react | `^0.469.0` |
| next-themes | `^0.4.6` |
| jose | `^6.1.3` |
| lottie-react | `^2.4.1` |
| Radix UI | Multiples primitives (@radix-ui/*) |

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

**Stack** : NestJS · Prisma · PostgreSQL · JWT · Sentry · Helmet  
**Port** : 3001  
**Entrée** : `src/main.ts` (instrumentation Sentry dans `src/instrument.ts`)

### Modules existants

| Module | Route préfixe | Rôle |
|--------|--------------|------|
| `auth` | `/api/auth` | register, login, JWT, reset password |
| `users` | `/api/users` | profil, onboarding, me, disponibilité, freelances publics |
| `missions` | `/api/missions` | ReliefMission CRUD + candidatures |
| `bookings` | `/api/bookings` | Booking lifecycle, order tracker, quote management |
| `services` | `/api/services` | Ateliers CRUD + modération |
| `quotes` | `/api/quotes` | Devis (création, envoi, acceptation, rejet, révision) |
| `conversations` | `/api/conversations` | Messagerie directe |
| `reviews` | `/api/reviews` | Avis bidirectionnels post-mission |
| `notifications` | `/api/notifications` | Notifications in-app |
| `invoices` | `/api/invoices` | Factures PDF (pdfkit) |
| `events` | `/api/events` | Événements applicatifs (SSE) |
| `mail` | _(pas de controller)_ | Templates email + envoi (nodemailer) |
| `admin-users` | `/api/admin/users` | Admin — gestion utilisateurs |
| `admin-offers` | `/api/admin` | Admin — modération services |

### Conventions backend

- Pattern module : `module.ts` / `controller.ts` / `service.ts` / `dto/`
- Auth guard : `@UseGuards(JwtAuthGuard)` via `@/auth/jwt-auth.guard`
- Utilisateur courant : `req.user` (type `AuthRequest` avec `id` et `role`)
- Imports Prisma : **chemin relatif** `../prisma/prisma.service` (pas d'alias absolu)
- DTO : utiliser `class-validator` (`@IsString()`, `@IsOptional()`, etc.)
- Rate limiting : `@nestjs/throttler`

### Endpoints notables (users)

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/users/me` | GET | Profil utilisateur courant |
| `/api/users/me` | PATCH | Mise à jour profil (isAvailable, profile.availableDays…) |
| `/api/users/me/availability` | GET | Disponibilité + isCurrentlyBusy |
| `/api/users/me/onboarding` | PATCH | Mise à jour étape onboarding |
| `/api/users/freelances/:id` | GET | Profil freelance public |

---

## Schéma Prisma — Modèles & Enums

### Enums

| Enum | Valeurs |
|------|---------|
| `UserRole` | `ESTABLISHMENT` · `FREELANCE` · `ADMIN` |
| `UserStatus` | `PENDING` · `VERIFIED` · `BANNED` |
| `BookingStatus` | `PENDING` · `QUOTE_SENT` · `QUOTE_ACCEPTED` · `CONFIRMED` · `IN_PROGRESS` · `COMPLETED` · `AWAITING_PAYMENT` · `PAID` · `CANCELLED` |
| `QuoteStatus` | `DRAFT` · `SENT` · `ACCEPTED` · `REJECTED` · `REVISED` |
| `ReliefMissionStatus` | `OPEN` · `ASSIGNED` · `COMPLETED` · `CANCELLED` |
| `ServiceStatus` | `DRAFT` · `ACTIVE` · `ARCHIVED` |
| `ServiceType` | `WORKSHOP` · `TRAINING` |
| `PricingType` | `SESSION` · `PER_PARTICIPANT` · `QUOTE` |
| `PaymentStatus` | `PENDING` · `PAID` · `CANCELLED` |
| `ReviewType` | `ESTABLISHMENT_TO_FREELANCE` · `FREELANCE_TO_ESTABLISHMENT` |
| `MessageType` | `USER` · `SYSTEM` |
| `DocumentType` | `AVATAR` · `SERVICE_PHOTO` · `IDENTITY_DOC` · `OTHER` |

### Modèles clés

| Modèle | Description |
|--------|-------------|
| `User` | Identité (email, password, role, status, onboardingStep, **isAvailable**, resetToken) |
| `Profile` | Données étendues (firstName, lastName, skills[], **availableDays[]**, bio, siret, diplomaUrl…) |
| `ReliefMission` | Mission de renfort (title, dateStart/End, hourlyRate, metier, shift, targetPublic[], requiredSkills[]) |
| `Booking` | Relation FREELANCE↔mission/service (status, paymentStatus, proposedRate, freelanceAcknowledged, nbParticipants) |
| `Service` | Atelier (title, price, capacity, durationMinutes, imageUrl, pricingType, objectives, methodology) |
| `Quote` | Devis (bookingId, status, subtotalHT, vatRate, vatAmount, totalTTC, validUntil, conditions) |
| `QuoteLine` | Ligne de devis (description, quantity, unitPrice, unit, totalHT) |
| `Invoice` | Facture (bookingId, amount, status, invoiceNumber) |
| `Conversation` + `Message` | Messagerie directe (participantA/B, type USER/SYSTEM, isRead) |
| `Review` | Avis bidirectionnel (bookingId, authorId, targetId, rating, comment, type) |
| `Notification` | Notifications in-app (userId, message, type, isRead) |
| `Document` | Fichiers uploadés (type, url, filename, mimeType, sizeBytes) |

### Relations importantes

- `User` → `Profile` (1:1)
- `User` → `Booking[]` (en tant que freelance ou via établissement)
- `User` → `Review[]` (auteur ou cible)
- `ReliefMission` → `Booking[]` (candidatures)
- `Booking` → `Quote[]` → `QuoteLine[]`
- `Booking` → `Invoice`
- `Booking` → `Review` (unique par bookingId + authorId)
- `Conversation` → `Message[]`

---

## Frontend — apps/web

**Stack** : Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · framer-motion · zustand · react-hook-form + zod · Vitest · Sentry  
**Port** : 3000  
**Entrée** : `src/app/layout.tsx`

### Structure des routes

```
src/app/
├── (auth)/               # /login, /register — pas de garde auth
├── (dashboard)/          # Routes authentifiées — layout avec AppShell + OnboardingGuard
│   ├── dashboard/        # Hub principal (role-based)
│   │   ├── renforts/     # Board matching établissement
│   │   ├── ateliers/     # Mes ateliers (freelance)
│   │   ├── inbox/        # Messagerie
│   │   └── packs/        # Crédits établissement
│   ├── marketplace/      # Catalogue missions + ateliers
│   │   ├── missions/[id]/
│   │   └── services/[id]/
│   ├── bookings/         # Gestion bookings
│   ├── orders/           # Order tracker
│   ├── finance/          # Factures / revenus
│   ├── account/          # Profil + paramètres + disponibilité
│   │   └── establishment/
│   ├── reservations/     # Réservations
│   └── settings/         # Paramètres
├── (onboarding)/         # /welcome, /wizard
├── (admin)/              # /admin/** — interface admin
│   └── admin/
│       ├── users/        # Gestion utilisateurs
│       ├── missions/     # Modération missions
│       ├── services/     # Modération services
│       └── finance/      # Finance dashboard
├── (admin-auth)/         # /admin/login
├── v2/                   # Landing page dark-glass (19 mars 2026)
├── ateliers/[id]         # Fiche atelier publique
├── freelances/[id]       # Fiche freelance publique (availableDays, isAvailable)
├── etablissements/       # Page publique établissements
├── privacy/              # Politique de confidentialité
├── terms/                # CGU
└── health/               # Health check
```

### Session & Auth

```typescript
import { getSession } from "@/lib/session";
const session = await getSession(); // null si non connecté
// session.user = { id, email, role, onboardingStep }
```

- Session stockée dans cookie `lesextras_session` (JWT signé via `jose` avec `SESSION_SECRET`)
- Le layout `(dashboard)/layout.tsx` redirige vers `/login` si pas de session
- `OnboardingGuard` redirige vers `/wizard` si `onboardingStep < 4`

### API calls (Server Actions / RSC)

```typescript
import { apiRequest } from "@/lib/api";
const res = await apiRequest("/missions", { method: "POST", body: dto, token: session.token });
```

- URL de base : `process.env.API_BASE_URL` ?? `process.env.NEXT_PUBLIC_API_URL` ?? `http://localhost:3001/api`

### Server Actions

**`src/app/actions/`** (actions principales) :

| Fichier | Rôle |
|---------|------|
| `auth.ts` | Register, login helpers |
| `login.ts` / `logout.ts` | Login/logout spécifiques |
| `user.ts` | `getCurrentUser()` → `/users/me` |
| `profile.ts` | `updateProfile()` → PATCH `/users/me` (inclut isAvailable, availableDays) |
| `marketplace.ts` | Missions, services, freelances catalogue |
| `missions.ts` | Mission CRUD actions |
| `bookings.ts` | Booking lifecycle actions |
| `orders.ts` | Order tracker actions |
| `quotes.ts` | Quote actions |
| `reviews.ts` | Review actions |
| `onboarding.ts` | Onboarding step actions |
| `establishment.ts` | Establishment-specific actions |
| `admin.ts` / `admin-auth.ts` | Admin actions |

**`src/actions/`** (actions complémentaires) :

| Fichier | Rôle |
|---------|------|
| `credits.ts` | Gestion crédits établissement |
| `finance.ts` | Factures & revenus |
| `messaging.ts` | Messagerie actions |
| `payments.ts` | Paiements |
| `quotes.ts` / `quote-actions.ts` | Devis complémentaires |

### Composants clés

| Dossier | Contenu |
|---------|---------|
| `components/layout/` | `AppShell`, `Sidebar`, `Header`, `ActionPanel` |
| `components/dashboard/` | `FreelanceKpiGrid`, `EstablishmentKpiGrid`, `BentoSection`, `BookingListWidget`, `MatchingMissionsWidget`, `MesAteliersClient`, `NextMissionCard`, `RecentReviewsWidget`, `TrustChecklistWidget`, `CreditsWidget`, `PaymentValidationWidget`, `QuoteCreationModal`, `QuoteListWidget`, `StatsWidget` |
| `components/dashboard/establishment/` | `CandidateCard`, `PublishRenfortButton`, `RenfortsEmptyState`… |
| `components/modals/` | `RenfortModal`, `ApplyMissionModal`, `BookServiceModal`, `ReviewModal`… |
| `components/marketplace/` | `MarketplaceClient`, `FreelanceJobBoard`, `EstablishmentCatalogue`… |
| `components/onboarding/` | `OnboardingWizard`, `EstablishmentFlow`, `FreelanceFlow` |
| `components/orders/` | Composants order tracker |
| `components/bookings/` | Détails & gestion bookings |
| `components/finance/` | Factures & paiements |
| `components/cards/` | `MissionCard`, `ServiceCard` |
| `components/patterns/` | `FicheFreelance`, `MatchingBoard` (patterns réutilisables) |
| `components/profile/` | `UserProfileClient` (édition profil + section disponibilité) |
| `components/admin/` | Composants admin dashboard |
| `components/ui/` | shadcn/ui + composants custom (`FreelanceCard`, `Badge`, `GlassCard`, `Switch`…) |
| `components/data/` | Composants d'affichage données |

### Lib & Utilitaires

| Fichier/Dossier | Rôle |
|-----------------|------|
| `lib/api.ts` | Client API (`apiRequest`, `UnauthorizedError`) |
| `lib/session.ts` | Gestion session JWT (`getSession`, `deleteSession`) |
| `lib/utils.ts` | Utilitaires généraux (cn, formatters…) |
| `lib/motion.ts` | Configurations framer-motion (variants) |
| `lib/sos-config.ts` | Config SOS Renfort (métiers, labels) |
| `lib/atelier-config.ts` | Config ateliers |
| `lib/constants.ts` | Constantes application |
| `lib/widget-result.ts` | Helpers `fetchSafe` pour widgets dashboard |
| `lib/stores/useUIStore.ts` | Store Zustand (modales, UI state) |
| `lib/hooks/useCurrentUser.ts` | Hook utilisateur courant |
| `lib/hooks/useMediaQuery.ts` | Hook responsive |
| `lib/hooks/useMessagingV1.ts` | Hook messagerie |
| `lib/hooks/useOrderSSE.ts` | Hook Server-Sent Events (order tracker) |
| `lib/hooks/useScrollProgress.ts` | Hook scroll progress |

### Tests frontend

- Framework : **Vitest** + **@testing-library/react** + **msw**
- 34 fichiers dans `src/__tests__/`
- Couvrent : actions, composants, modales, pages, middleware, scénarios e2e
- Commande : `pnpm --filter @lesextras/web test`

### Tests backend

- Framework : **Jest**
- Fichiers `*.spec.ts` dans les modules (`bookings`, `reviews`, `conversations`, `mail`)
- Commande : `pnpm --filter @lesextras/api test`

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
SENTRY_DSN=...              # Optionnel — active Sentry si défini
```

### apps/web

```env
API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_URL=http://localhost:3001/api
SESSION_SECRET=...
APP_RUNTIME=front                             # ou "desk" pour l'interface admin
DEMO_USER_PASSWORD=password123
NEXT_PUBLIC_SENTRY_DSN=...   # Optionnel
```

---

## Déploiement (Coolify v4)

3 services distincts — chacun avec son Dockerfile :

| Service | Domaine cible | Dockerfile |
|---------|--------------|------------|
| Front (web client) | `les-extras.com` | `apps/web/Dockerfile` avec `APP_RUNTIME=front` |
| Desk (admin) | `desk.les-extras.com` | `apps/web/Dockerfile` avec `APP_RUNTIME=desk` |
| API | `api.les-extras.com` | `apps/api/Dockerfile` |

`docker-compose.coolify.yml` — Déploiement complet (postgres, api, web).

---

## Fonctionnalités livrées

| Fonctionnalité | Description | Date |
|----------------|-------------|------|
| Design System v2 | Dark-first, glassmorphism, tokens teal/coral | ✅ Livré |
| Backend complet | Tous modules CRUD, auth, admin | ✅ Livré |
| UX Flows | Onboarding, marketplace, bookings, messagerie | ✅ Livré |
| Landing V2 | Page d'accueil dark-glass `/v2` | ✅ 19 mars 2026 |
| Avis bidirectionnels | Reviews post-mission (ESTABLISHMENT↔FREELANCE) | ✅ Livré |
| Système de devis | Quote lifecycle (DRAFT→SENT→ACCEPTED/REJECTED) | ✅ Livré |
| Order Tracker | Suivi en temps réel des commandes (SSE) | ✅ 29 mars 2026 |
| Payment Status | Suivi paiement (PENDING/PAID/CANCELLED) | ✅ 29 mars 2026 |
| Disponibilité Freelance | Toggle + grille 7 jours + calcul isCurrentlyBusy | ✅ 30 mars 2026 |
| QA / Tests / Release | Tests Vitest + Jest, couverture actions & composants | 🚧 En cours |

---

## Historique des migrations Prisma

| # | Migration | Date |
|---|-----------|------|
| 1 | `add_cancelled_statuses_and_scheduled_at` | 16 fév |
| 2 | `add_admin_role_and_user_status` | 17 fév |
| 3 | `add_service_moderation_flags` | 17 fév |
| 4 | `add_onboarding_step` | 19 fév |
| 5 | `add_missing_tables_and_columns` | 3 mars |
| 6 | `add_is_renfort_column` | 4 mars |
| 7 | `add_sos_renfort_fields` | 11 mars |
| 8 | `add_booking_candidature_fields` | 11 mars |
| 9 | `extend_service_and_quote` | 11 mars |
| 10 | `add_sos_renfort_v2_fields` | 13 mars |
| 11 | `rename_roles_and_add_review` | 14 mars |
| 12 | `schema_v2_conversations_documents_stripe` | 15 mars |
| 13 | `fix_profile_skills_default` | 16 mars |
| 14 | `add_password_reset_fields` | 18 mars |
| 15 | `add_service_image_and_schedule` | 24 mars |
| 16 | `add_freelance_acknowledged` | 29 mars |
| 17 | `add_order_tracker_models` | 29 mars |
| 18 | `add_payment_status` | 29 mars |
| 19 | `add_available_days` | 30 mars |

---

## Comptes démo (seed)

### Établissements

| Email | Nom complet | Profil |
|-------|-------------|--------|
| `directeur@mecs-avenir.fr` | Laurence Ménard | MECS L'Avenir |
| `cadre-nuit@chrs-horizon.fr` | Sophie Bournet | CHRS Horizon |
| `coordination@ehpad-rosiers.fr` | Marc Rochat | EHPAD Les Rosiers |
| `direction@itep-monts.fr` | Claire Dubois | ITEP Les Monts |

### Freelances

| Email | Nom complet | Spécialité |
|-------|-------------|-----------|
| `karim.educ@gmail.com` | Karim Bensalem | Éducateur spécialisé |
| `amelie.formation@prointervenants.fr` | Amélie Rodriguez | Formation |
| `nina.cuisine@prointervenants.fr` | Nina Collet | Ateliers cuisine |
| `samir.visio@prointervenants.fr` | Samir Haddad | Visio-conférence |
| `lucie.art@prointervenants.fr` | Lucie Moreau | Art-thérapie |
| `yannick.sport@prointervenants.fr` | Yannick Lefèvre | Sport adapté |

### Admin

| Email | Nom complet |
|-------|-------------|
| `admin@lesextras.local` | Camille Renaud |

Mot de passe : contrôlé par `SEED_DEMO_PASSWORD` → `DEMO_USER_PASSWORD` → `password123`
