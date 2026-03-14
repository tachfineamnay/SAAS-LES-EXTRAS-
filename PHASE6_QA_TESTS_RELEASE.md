# PHASE 6 — QA / Tests / Polish / Release

> **Produit** : Les-Extras — SaaS psycho-éducatif & médico-social
> **État actuel** : 0 test, 0 framework de test installé, 0 CI/CD utile, 1 smoke test manuel (`verify-system.ts`)
> **Cible** : qualité réelle, flow critique couverts, release contrôlée

---

## Table des matières

- [A. Stratégie de tests](#a-stratégie-de-tests)
- [B. Checklist qualité avant release](#b-checklist-qualité-avant-release)
- [C. Plan de release](#c-plan-de-release)
- [D. KPIs post-lancement](#d-kpis-post-lancement)

---

# A. Stratégie de tests

## A.1 — État des lieux

| Composant | État |
|-----------|------|
| Framework de test backend | **Aucun** — ni jest, ni vitest, ni @nestjs/testing, ni supertest |
| Framework de test frontend | **Aucun** — ni vitest, ni react-testing-library, ni playwright, ni cypress |
| Fichiers test (`*.spec.ts`, `*.test.ts`) | **0** fichier dans `apps/` |
| Script `test` dans package.json | **Absent** partout (root, api, web) |
| Tâche `test` dans turbo.json | **Absente** |
| CI pipeline | **1 workflow GitHub** inutile (template GitHub Pages, pas de test/lint/typecheck) |
| .env.test / base de test | **Inexistant** |
| Coverage | **Aucun outil** |
| Seuls "tests" | 2 `.spec.mjs` pour validation de la structure skills (Node native test runner) + `verify-system.ts` (smoke HTTP manuel) |

**Constat : le projet part de zéro en testing.** La stratégie doit être pragmatique et progressive.

---

## A.2 — Stack de test cible

### Backend (NestJS)

| Outil | Rôle | Justification |
|-------|------|---------------|
| **Vitest** | Unit + integration runner | Plus rapide que Jest, ESM natif, compatible NestJS avec alias |
| **@nestjs/testing** | Module factory pour tests NestJS | Instanciation de modules isolés |
| **supertest** | Tests HTTP / API | Requêtes sur l'app NestJS compilée |
| **Prisma (test DB)** | Intégration DB réelle | Tests contre PostgreSQL de test (pas de mock Prisma) |
| **testcontainers** (`@testcontainers/postgresql`) | DB éphémère | Conteneur PG dédié par run de test, isolation totale |

### Frontend (Next.js)

| Outil | Rôle | Justification |
|-------|------|---------------|
| **Vitest** | Unit runner | Cohérence avec le backend, rapide |
| **@testing-library/react** | Tests composants | Standard React, test par comportement utilisateur |
| **@testing-library/user-event** | Simulation interactions | Clics, saisie, navigation clavier |
| **jsdom** (via Vitest) | DOM virtuel | Environnement navigateur pour les tests composants |
| **msw** (Mock Service Worker) | Mock API | Intercepte les `fetch` côté test pour isoler le front du backend |

### E2E

| Outil | Rôle | Justification |
|-------|------|---------------|
| **Playwright** | Tests E2E cross-browser | Plus fiable que Cypress, multi-onglets, mobile viewport natif |

### Couverture & Reporting

| Outil | Rôle |
|-------|------|
| **@vitest/coverage-v8** | Couverture backend + frontend |
| **Playwright HTML reporter** | Rapport E2E avec screenshots d'échec |

---

## A.3 — Organisation des fichiers

```
apps/
  api/
    vitest.config.ts                    ← config backend
    src/
      auth/
        auth.service.spec.ts            ← unit
        auth.controller.spec.ts         ← integration API
      bookings/
        bookings.service.spec.ts
        bookings.controller.spec.ts
      missions/
        missions.service.spec.ts
        missions.controller.spec.ts
      ...
    test/
      setup.ts                          ← bootstrap testcontainers PG
      helpers.ts                        ← factory functions (createUser, createMission, etc.)
      auth.e2e-spec.ts                  ← tests API end-to-end
      bookings.e2e-spec.ts
      missions.e2e-spec.ts
  web/
    vitest.config.ts                    ← config frontend
    src/
      components/
        modals/
          ApplyMissionModal.test.tsx     ← composant
          RenfortModal.test.tsx
        onboarding/
          OnboardingWizard.test.tsx
        dashboard/
          TrustChecklistWidget.test.tsx
      lib/
        stores/
          useUIStore.test.ts            ← store Zustand
        session.test.ts                 ← utils
e2e/
  playwright.config.ts
  fixtures/
    auth.fixture.ts                     ← login helper, storageState
  tests/
    auth.spec.ts
    renfort-publication.spec.ts
    candidature.spec.ts
    confirmation.spec.ts
    completion-payment.spec.ts
    atelier-reservation.spec.ts
    messaging.spec.ts
```

---

## A.4 — Niveaux de tests et périmètre

### Niveau 1 — Tests unitaires

**Scope** : logique métier isolée dans les services NestJS + utilitaires frontend.

| Module | Fichier cible | Cas prioritaires |
|--------|---------------|------------------|
| **AuthService** | `auth.service.spec.ts` | `register()` : crée user + profile + hash password. `login()` : vérifie bcrypt, retourne JWT. `login()` : rejette si BANNED. |
| **BookingsService** | `bookings.service.spec.ts` | `confirmBooking()` : décrémente crédits, passe CONFIRMED, annule les autres. `confirmBooking()` : échoue si 0 crédits. `completeBooking()` : crée invoice avec bon montant. `cancelBooking()` : passe CANCELLED. |
| **MissionsService** | `missions.service.spec.ts` | `create()` : valide dateStart futur. `findTalentFeed()` : filtre par ville, métier, OPEN uniquement. |
| **InvoicesService** | `invoices.service.spec.ts` | `generateInvoiceNumber()` : format unique. `generatePdf()` : retourne un Buffer (pas 0 bytes). |
| **QuotesService** | `quotes.service.spec.ts` | `accept()` : passe quote ACCEPTED + booking CONFIRMED. `reject()` : passe REJECTED + booking CANCELLED. |
| **ServicesService** | `services.service.spec.ts` | `create()` : default status ACTIVE. `findAll()` : exclut ARCHIVED et isHidden. |
| **session.ts** (web) | `session.test.ts` | `createSession()` : retourne un JWT signé HS256. `verifySession()` : rejette un token expiré. `verifySession()` : rejette un token mal signé. |
| **useUIStore** (web) | `useUIStore.test.ts` | Chaque toggleModal ouvre/ferme correctement. `applyMissionId` se reset quand `isApplyModalOpen` se ferme. |

**Total estimé : ~50-60 tests unitaires.**

**Convention** :
- Mock Prisma via un objet `{ user: { findUnique: vi.fn(), ... } }` injecté dans le constructeur du service.
- Pas de base de données réelle dans les tests unitaires.
- Timeout : 5s par test.

---

### Niveau 2 — Tests composants (frontend)

**Scope** : composants React critiques, testés avec @testing-library/react + msw.

| Composant | Cas prioritaires |
|-----------|------------------|
| **RenfortModal** | Ouvre en 5 steps. Navigation step par step. Validation : date future obligatoire, taux > 0. Submit → appelle POST /missions. Mode urgence : 1 seul écran. |
| **ApplyMissionModal** | Affiche résumé de la mission. Textarea motivation. Submit → appelle POST /missions/:id/apply. Disable button pendant pending. |
| **BookServiceModal** | Calcul prix dynamique (PER_PARTICIPANT × nb). Submit → appelle POST /services/:id/book. |
| **QuoteRequestModal** | Message obligatoire. Submit → crée booking + quote PENDING. |
| **OnboardingWizard** | Dispatch vers ClientFlow ou FreelanceFlow selon rôle. Navigation entre steps. Données persistées par step (si implémenté). |
| **TrustChecklistWidget** | Affiche % complétude. Items cochés/décochés selon les données profile. |
| **MissionCard** | Affiche badge SOS si isRenfort. Affiche "Postulé" si déjà candidaté. Clic → ouvre détail. |
| **ServiceCard** | Affiche prix ou "Sur devis". Affiche note moyenne si reviews. |

**Total estimé : ~30-40 tests composants.**

**Convention** :
- `msw` intercepte toutes les requêtes API avec des handlers prédéfinis.
- Pas de snapshot testing (fragile, maintenance excessive).
- Tester le comportement, pas l'implémentation.

---

### Niveau 3 — Tests intégration API

**Scope** : contrôleurs NestJS testés contre une vraie DB PostgreSQL via testcontainers.

| Module | Cas prioritaires |
|--------|------------------|
| **Auth** | `POST /api/auth/register` → 201 + session cookie. Register avec email existant → 409. `POST /api/auth/login` → 200 + token. Login avec mauvais password → 401. Login avec user BANNED → 403. Rate limit : 11ème requête en 1 min → 429. |
| **Missions** | `POST /api/missions` → 201 (auth ESTABLISHMENT). POST sans auth → 401. POST avec role FREELANCE → 403. `GET /api/missions/feed` → 200, retourne seulement OPEN. |
| **Bookings** | `POST /api/missions/:id/apply` → 201 (auth FREELANCE). Apply 2x même mission → 409. `POST /api/bookings/confirm` → 200 (auth ESTABLISHMENT, crédits > 0). Confirm avec 0 crédits → 400 ou 402. Confirm → crédits décrémentés de 1. Confirm → autres bookings CANCELLED. |
| **Services** | `GET /api/services` → 200, exclut ARCHIVED. `POST /api/services` → 201 (auth FREELANCE). |
| **Invoices** | `GET /api/invoices` → 200 (auth). `GET /api/invoices/:id/download` → PDF Buffer (auth). |
| **Admin** | `GET /api/admin/users` → 200 (auth ADMIN). GET sans auth → 401. GET avec role FREELANCE → 403. `POST /api/admin/users/:id/verify` → 200. |

**Total estimé : ~40-50 tests intégration.**

**Convention** :
- Chaque fichier de test `*.e2e-spec.ts` démarre un `TestingModule` complet avec une DB testcontainers.
- Seed minimal : 1 admin, 1 establishment, 1 freelance, 1 mission OPEN, 1 service ACTIVE.
- Transaction rollback entre chaque test pour isolation.

---

### Niveau 4 — Tests E2E (Playwright)

**Scope** : flows utilisateur complets, navigateur réel, contre l'app déployée localement (docker-compose).

#### Flows prioritaires

| # | Flow | Scénario |
|---|------|----------|
| **E2E-01** | Auth complète | Register ESTABLISHMENT → wizard 4 steps → dashboard. Register FREELANCE → wizard → marketplace. Login → dashboard. Logout → redirect /login. |
| **E2E-02** | Publication renfort classique | Login ESTABLISHMENT → clic "Publier un renfort" → RenfortModal 5 steps → submit → mission visible dans /dashboard/renforts. |
| **E2E-03** | Publication renfort urgence | Login ESTABLISHMENT → clic "SOS Renfort" → formulaire condensé → submit → mission avec badge SOS dans /dashboard/renforts. |
| **E2E-04** | Candidature freelance | Login FREELANCE → /marketplace → clic mission → ApplyMissionModal → envoyer → badge "Postulé" visible. |
| **E2E-05** | Matching + confirmation | Login ESTABLISHMENT → /dashboard/renforts → mission avec candidature → clic "Recruter" → modale confirmation → confirmer → mission ASSIGNED. |
| **E2E-06** | Complétion + paiement | Login ESTABLISHMENT → mission ASSIGNED → "Marquer comme terminée" → confirmer heures → "Payer" → invoice PAID. |
| **E2E-07** | Réservation atelier | Login ESTABLISHMENT → /marketplace → catalogue → clic service → "Réserver" → BookServiceModal → submit → booking PENDING visible. |
| **E2E-08** | Devis atelier | Login ESTABLISHMENT → /marketplace → service "Sur devis" → "Demander un devis" → QuoteRequestModal → submit. Login FREELANCE → QuoteEditorModal → montant + envoyer. Login ESTABLISHMENT → accepter devis. |
| **E2E-09** | Messaging | Login ESTABLISHMENT → "Contacter" sur un freelance → /dashboard/inbox → envoyer message → Login FREELANCE → vérifier message reçu. |
| **E2E-10** | Admin | Login ADMIN → /admin → vérifier user → modérer service → voir missions. |

**Total estimé : 10 scénarios E2E, ~50-70 assertions.**

**Convention** :
- `playwright.config.ts` : webServer lance docker-compose, attend healthcheck.
- `auth.fixture.ts` : helper qui login et persiste `storageState` pour éviter de re-login par scénario.
- Screenshots à chaque échec (`screenshot: 'only-on-failure'`).
- Retry : 1 retry en CI, 0 en local.
- Viewports : desktop (1280×720) + mobile (375×667) pour chaque flow.

---

### Niveau 5 — Visual Regression

**Non prioritaire pour V1.** Raisons :
- Le design system n'est pas encore implémenté (Phase 2 = spec, pas de code).
- Les composants vont changer significativement pendant le développement.
- Le ratio effort/valeur est trop faible à ce stade.

**Recommandation post-V1** : Intégrer Playwright visual comparisons (`expect(page).toHaveScreenshot()`) une fois les composants stabilisés. Viser les écrans critiques : register, dashboard, renforts, marketplace.

---

## A.5 — Priorité de couverture par flow

| Priorité | Flow | Tests unit | Tests comp. | Tests integ. | Tests E2E |
|----------|------|:----------:|:-----------:|:------------:|:---------:|
| **P0** | Auth (register/login) | ✅ | — | ✅ | ✅ |
| **P0** | Publication renfort | ✅ | ✅ | ✅ | ✅ |
| **P0** | Candidature | ✅ | ✅ | ✅ | ✅ |
| **P0** | Confirmation | ✅ | — | ✅ | ✅ |
| **P0** | Complétion + paiement | ✅ | — | ✅ | ✅ |
| **P1** | Messaging | ✅ | ✅ | ✅ | ✅ |
| **P1** | Réservation atelier | ✅ | ✅ | ✅ | ✅ |
| **P1** | Mes ateliers | ✅ | ✅ | ✅ | — |
| **P2** | Reviews | ✅ | — | ✅ | — |
| **P2** | Documents/upload | ✅ | — | ✅ | — |
| **P2** | Admin | ✅ | — | ✅ | ✅ |

**Cible couverture V1** :
- Services backend : > 80% (logique métier critique)
- Composants frontend modales : > 70%
- Routes API : 100% des routes existantes (happy path + principal error path)
- E2E : 10 scénarios P0/P1

---

## A.6 — Mise en place technique

### Étape 1 — Installation des dépendances

```bash
# Backend
cd apps/api
npm install -D vitest @vitest/coverage-v8 @nestjs/testing supertest @types/supertest @testcontainers/postgresql unplugin-swc

# Frontend
cd apps/web
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw

# E2E (racine monorepo)
npm install -D playwright @playwright/test
npx playwright install chromium
```

### Étape 2 — Configs

**`apps/api/vitest.config.ts`**
```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.service.ts', 'src/**/*.controller.ts', 'src/**/*.guard.ts'],
      exclude: ['src/**/*.module.ts', 'src/**/*.dto.ts'],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
  plugins: [swc.vite()],
});
```

**`apps/web/vitest.config.ts`**
```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*.tsx', 'src/lib/**/*.ts'],
      exclude: ['src/components/ui/**'],
      thresholds: { statements: 60, branches: 50, functions: 60, lines: 60 },
    },
  },
});
```

**`e2e/playwright.config.ts`**
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'docker compose -f docker-compose.coolify.yml up --build',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Étape 3 — Scripts package.json

```jsonc
// root package.json
{
  "scripts": {
    "test": "turbo run test",
    "test:e2e": "playwright test --config e2e/playwright.config.ts",
    "test:cov": "turbo run test:cov"
  }
}

// apps/api/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "vitest run --config vitest.e2e.config.ts"
  }
}

// apps/web/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage"
  }
}
```

### Étape 4 — Turbo pipeline

```jsonc
// turbo.json — ajouter
{
  "tasks": {
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:cov": { "dependsOn": ["^build"], "outputs": ["coverage/**"] }
  }
}
```

---

## A.7 — Helpers de test backend

```ts
// apps/api/test/helpers.ts
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function createTestUser(
  prisma: PrismaClient,
  overrides: { role?: UserRole; status?: UserStatus; email?: string } = {},
) {
  const email = overrides.email ?? `test-${Date.now()}@example.com`;
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash('Test1234!', 10),
      role: overrides.role ?? UserRole.FREELANCE,
      status: overrides.status ?? UserStatus.VERIFIED,
      onboardingStep: 4,
      profile: { create: { availableCredits: 10 } },
    },
    include: { profile: true },
  });
}

export async function createTestMission(
  prisma: PrismaClient,
  establishmentId: string,
) {
  return prisma.reliefMission.create({
    data: {
      establishmentId,
      title: 'Test Mission',
      description: 'Test',
      metier: 'éducateur spécialisé',
      dateStart: new Date(Date.now() + 86400000),
      dateEnd: new Date(Date.now() + 172800000),
      hourlyRate: 25,
      status: 'OPEN',
    },
  });
}

export async function loginAndGetToken(
  app: any, // INestApplication
  email: string,
  password = 'Test1234!',
): Promise<string> {
  const res = await import('supertest')
    .then(m => m.default(app.getHttpServer()))
    .then(r => r.post('/api/auth/login').send({ email, password }));
  return res.body.access_token;
}
```

---

# B. Checklist qualité avant release

## B.1 — Sécurité

| # | Item | Vérification | Statut cible |
|---|------|-------------|--------------|
| S-01 | **Auth : JWT signé HS256 avec secret ≥ 32 chars** | Vérifier `SESSION_SECRET` / `JWT_SECRET` en prod ≠ valeur par défaut | ✅ Obligatoire |
| S-02 | **Cookies httpOnly + secure + sameSite=lax** | Inspecter les headers Set-Cookie en prod (HTTPS) | ✅ Obligatoire |
| S-03 | **CORS restrictif** | `CORS_ORIGINS` en prod = domaine exact, pas `*` | ✅ Obligatoire |
| S-04 | **Rate limiting actif** | Tester : 61ème requête /api → 429. 11ème requête /api/auth → 429 | ✅ Obligatoire |
| S-05 | **class-validator whitelist + forbidNonWhitelisted** | Envoyer un champ inconnu → ignoré (pas d'injection) | ✅ Obligatoire |
| S-06 | **Pas d'injection SQL** | Prisma paramétrise tout. Vérifier : aucun `$queryRawUnsafe` | ✅ Obligatoire |
| S-07 | **Pas de secrets dans le code** | `grep -r "password\|secret\|api_key" --include="*.ts"` → aucun value hardcodé | ✅ Obligatoire |
| S-08 | **Pas de Prisma côté client Next.js** | Vérifier : aucun import `@prisma/client` dans `apps/web/src/` (sauf server actions) | ✅ Obligatoire |
| S-09 | **Helmet headers** | Installer `@nestjs/helmet` : X-Content-Type-Options, X-Frame-Options, CSP | ✅ Obligatoire |
| S-10 | **Uploads : validation MIME + taille** | Si module upload implémenté : max 10 Mo, whitelist PDF/JPG/PNG, pas d'exécutable | ✅ Obligatoire |
| S-11 | **Password hashing bcrypt rounds ≥ 10** | Vérifier `bcrypt.hash(password, 10)` dans auth.service.ts | ✅ Obligatoire |
| S-12 | **RBAC sur chaque route sensible** | Chaque controller : `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` approprié | ✅ Obligatoire |
| S-13 | **Ownership check** | Un ESTABLISHMENT ne peut pas voir les bookings d'un autre. Un FREELANCE ne peut pas modifier le profil d'un autre. Tester les cas croisés. | ✅ Obligatoire |
| S-14 | **No .env in Docker image** | `.dockerignore` exclut `.env*` — vérifier que l'image finale ne contient pas de secrets | ✅ Obligatoire |

---

## B.2 — Accessibilité

| # | Item | Vérification |
|---|------|-------------|
| A-01 | **Contrastes WCAG AA** | Tester tous les paires text/background du design system avec devtools ou axe. Cible : ratio ≥ 4.5:1 (text) et ≥ 3:1 (large text). |
| A-02 | **Focus visible** | Tab navigation sur toutes les pages — chaque élément interactif a un ring visible. |
| A-03 | **Labels sur tous les inputs** | Chaque `<input>` a un `<label>` associé (htmlFor) ou `aria-label`. Vérifier : register, login, wizard, modales. |
| A-04 | **Aria sur les modales** | Chaque Dialog/Sheet a `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Focus trap actif. |
| A-05 | **Alt sur les images** | Toutes les `<img>` ont un `alt` descriptif ou `alt=""` si décoratif. |
| A-06 | **Navigation clavier** | Escape ferme les modales. Enter soumet les formulaires. Arrow keys dans les selects. |
| A-07 | **Screen reader** | Tester au minimum avec VoiceOver (Mac) ou NVDA (Windows) sur : register, login, dashboard, RenfortModal. |
| A-08 | **Touch targets ≥ 44px** | Tous les boutons, liens, checkboxes sur mobile ≥ 44×44px. |
| A-09 | **Rôles sémantiques** | `<nav>` pour navigation, `<main>` pour contenu, `<header>` / `<footer>`, `<h1>` unique par page. |
| A-10 | **Skip to content** | Lien invisible "Aller au contenu" visible au premier Tab. |

---

## B.3 — Responsive

| # | Item | Vérification |
|---|------|-------------|
| R-01 | **Breakpoints testés** | 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop). Chaque page. |
| R-02 | **Register/Login** | Mobile : brand panel masqué, form plein écran. Desktop : split 45/55. |
| R-03 | **Dashboard** | Mobile : bento cards en stack. Pas de scroll horizontal. Desktop : grid multi-colonnes. |
| R-04 | **Modales → Sheets** | Mobile : toutes les modales deviennent des bottom sheets. Pas de Dialog centré < 768px. |
| R-05 | **Sidebar** | Mobile : hamburger → slide-over. Desktop : sidebar fixe. |
| R-06 | **Tables** | < 768px : tables deviennent des cartes empilées ou scrollables horizontalement avec indicateur. |
| R-07 | **Texte** | Pas de troncature invisible. Pas de overflow caché qui masque du contenu critique. |
| R-08 | **Inputs** | Pas de zoom automatique sur iOS (font-size ≥ 16px sur mobile). |
| R-09 | **Messaging** | Mobile : navigation liste → détail (pas split panel). Desktop : split panel. |
| R-10 | **Images** | `next/image` avec `sizes` correct. Pas d'images surdimensionnées sur mobile. |

---

## B.4 — Performances

| # | Item | Cible | Outil |
|---|------|-------|-------|
| P-01 | **LCP (Largest Contentful Paint)** | < 2.5s | Lighthouse, CrUX |
| P-02 | **FID / INP (Interaction to Next Paint)** | < 200ms | Lighthouse, CrUX |
| P-03 | **CLS (Cumulative Layout Shift)** | < 0.1 | Lighthouse |
| P-04 | **TTFB (Time to First Byte)** | < 800ms | WebPageTest |
| P-05 | **Bundle JS initial** | < 200 Ko (gzipped) | `next build` → `.next/analyze` |
| P-06 | **Images optimisées** | WebP/AVIF via `next/image` | Vérifier les headers `Content-Type` |
| P-07 | **Fonts** | Plus Jakarta Sans + Inter : `font-display: swap`, preload, subset latin | Network tab |
| P-08 | **API response time** | P95 < 500ms pour les routes critiques (auth, missions, bookings) | Logs / monitoring |
| P-09 | **DB queries** | Pas de N+1. Inclure les relations nécessaires. Index sur les FK. | Prisma query logs en dev |
| P-10 | **Lazy loading** | Modales, pages admin, composants lourds : `dynamic()` ou `React.lazy()` | Bundle analyzer |
| P-11 | **Cache** | `Cache-Control` sur les assets statiques (1 an). ISR/SSG sur les pages marketing. | Headers HTTP |

---

## B.5 — Analytics

| # | Item | Implémentation |
|---|------|---------------|
| AN-01 | **Page views** | Analytics provider (Plausible ou PostHog — RGPD compliant, pas Google Analytics) |
| AN-02 | **Événements clés** | `register_start`, `register_complete`, `wizard_step_N`, `renfort_publish`, `renfort_sos`, `mission_apply`, `booking_confirm`, `booking_complete`, `booking_pay`, `service_book`, `quote_request`, `quote_accept`, `review_submit`, `message_send` |
| AN-03 | **Funnels** | Register → Wizard → Dashboard → Publish (ESTABLISHMENT). Register → Wizard → Marketplace → Apply (FREELANCE). |
| AN-04 | **Cohort retention** | Weekly active users par rôle |
| AN-05 | **Error tracking** | Sentry (frontend + backend) : capture des exceptions non gérées |

---

## B.6 — Gestion des erreurs

| # | Item | Vérification |
|---|------|-------------|
| E-01 | **Pages 404 et 500** | `/not-found` → page 404 custom. Erreur serveur → page 500 custom. |
| E-02 | **Error boundaries React** | Chaque page wrappée dans un ErrorBoundary. Crash d'un widget dashboard ≠ crash de toute la page. |
| E-03 | **Toast erreur API** | Chaque `fetch` API dans le front gère les erreurs (try/catch, toast destructive). |
| E-04 | **Validation côté front** | react-hook-form + zod sur chaque formulaire. Erreurs affichées inline. |
| E-05 | **Validation côté back** | class-validator sur chaque DTO. Erreur 400 avec messages lisibles. |
| E-06 | **Timeout / retry** | Timeout 10s sur les fetch API. Retry automatique sur 503 (1x). |
| E-07 | **Session expirée** | 401 → redirect `/login` avec toast "Session expirée". |
| E-08 | **Offline** | Pas de mode offline v1 mais message "Connexion perdue" si navigator.onLine === false. |

---

## B.7 — Permissions

| # | Route / Action | ESTABLISHMENT | FREELANCE | ADMIN |
|---|---------------|:------------:|:---------:|:-----:|
| 1 | `POST /missions` | ✅ | ❌ | ✅ |
| 2 | `GET /missions/feed` | ❌ | ✅ | ✅ |
| 3 | `POST /missions/:id/apply` | ❌ | ✅ | ❌ |
| 4 | `POST /bookings/confirm` | ✅ | ❌ | ✅ |
| 5 | `POST /bookings/complete` | ✅ | ❌ | ✅ |
| 6 | `POST /bookings/authorize-payment` | ✅ | ❌ | ✅ |
| 7 | `POST /services` | ❌ | ✅ | ✅ |
| 8 | `GET /services` | ✅ | ✅ | ✅ |
| 9 | `POST /quotes/:id/accept` | ✅ | ❌ | ✅ |
| 10 | `GET /admin/*` | ❌ | ❌ | ✅ |
| 11 | `PATCH /users/me` | ✅ | ✅ | ✅ |
| 12 | `GET /invoices` | ✅ (own) | ✅ (own) | ✅ (all) |

**Test** : pour chaque ligne, vérifier le bon code HTTP (200/201 si autorisé, 403 si interdit, 401 si non authentifié). Inclure dans les tests intégration.

---

## B.8 — Paiement

| # | Item | Vérification |
|---|------|-------------|
| PAY-01 | **Crédits atomiques** | `confirmBooking` décrémente en transaction Prisma. Pas de race condition. Test : 2 confirm simultanés sur le même crédit → 1 succès, 1 échec. |
| PAY-02 | **Pas de crédits négatifs** | Vérifier qu'on ne peut jamais descendre sous 0. Contrainte DB ou check applicatif. |
| PAY-03 | **Invoice cohérente** | Montant invoice = hourlyRate × heures confirmées. Pas de montant 0 (bug B6 Phase 3). |
| PAY-04 | **Invoice number unique** | Index unique sur `invoiceNumber`. Test : 2 invoices → 2 numéros distincts. |
| PAY-05 | **PDF lisible** | Télécharger un PDF invoice → l'ouvrir → toutes les infos présentes (émetteur, destinataire, montant, date). |
| PAY-06 | **Stripe Connect (si implémenté)** | Webhook signature valide. Modes test Stripe activés. Pas de double processing. |
| PAY-07 | **Remboursement** | Scénario : mission annulée après paiement. Le crédit doit être recrédité. |

---

## B.9 — Emails / Notifications

| # | Item | Vérification |
|---|------|-------------|
| N-01 | **Notifications in-app** | Chaque action critique crée une Notification (confirm, cancel, apply, complete, pay). `GET /notifications` retourne les non-lues. |
| N-02 | **Notification read** | Clic sur une notification → `PATCH /notifications/:id/read`. Badge count décrémenté. |
| N-03 | **Email transactionnel (si implémenté)** | Templates : bienvenue, candidature reçue, mission confirmée, paiement reçu, review demandé. SendGrid/Resend en sandbox mode. |
| N-04 | **Email : pas de spam** | SPF, DKIM, DMARC configurés sur le domaine d'envoi. |
| N-05 | **Notification sonore/push** | Non implémenté V1. À considérer post-V1. |
| N-06 | **Notifications admin** | Admin reçoit une notification quand : nouveau user inscrit, nouveau document uploadé, nouveau service publié (modération). |

---

# C. Plan de release

## C.1 — Environnements

| Env | URL | DB | Usage | Déploiement |
|-----|-----|-----|-------|-------------|
| **Local** | `localhost:3000` / `:3001` | Docker Compose PG (local) | Développement quotidien | Manuel (`npm run dev`) |
| **Test** | — | Testcontainers PG éphémère | CI : tests unitaires + intégration | Automatique en CI |
| **Staging** | `staging.lesextras.fr` | PG Coolify (staging) | Validation fonctionnelle, UAT | Auto-deploy sur push `main` |
| **Production** | `app.lesextras.fr` | PG Coolify (prod) | Utilisateurs réels | Deploy manuel (tag + approval) |

### Infrastructure Coolify

```
┌──────────────────────────────────────────┐
│ Coolify Server                           │
│                                          │
│  ┌─── Staging ──────────────────────┐    │
│  │ postgres-staging (PG 16)         │    │
│  │ api-staging (NestJS)             │    │
│  │ web-staging (Next.js standalone) │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌─── Production ───────────────────┐    │
│  │ postgres-prod (PG 16)            │    │
│  │ api-prod (NestJS)                │    │
│  │ web-prod (Next.js standalone)    │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

## C.2 — Pipeline CI/CD (GitHub Actions)

### Workflow : `ci.yml` (remplace `nextjs.yml` actuel)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx turbo run lint typecheck

  test-api:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: lesextras_test
        ports: ['5432:5432']
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/lesextras_test
      JWT_SECRET: test-secret-min-32-chars-long-xxxxx
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: cd apps/api && npx prisma migrate deploy
      - run: cd apps/api && npm run test:cov
      - uses: actions/upload-artifact@v4
        with: { name: coverage-api, path: apps/api/coverage/ }

  test-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: cd apps/web && npm run test:cov
      - uses: actions/upload-artifact@v4
        with: { name: coverage-web, path: apps/web/coverage/ }

  build:
    needs: [lint-typecheck, test-api, test-web]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx turbo run build
      - run: npx ts-node scripts/validate-build.ts

  e2e:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: docker compose -f docker-compose.coolify.yml up -d --build
      - run: npx wait-on http://localhost:3000 --timeout 120000
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: e2e-report, path: e2e/playwright-report/ }

  deploy-staging:
    needs: [e2e]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify staging deploy
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_STAGING }}" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}"
```

### Workflow : `release.yml` (deploy prod)

```yaml
name: Release to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version tag (e.g. v1.0.0)'
        required: true

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval in GitHub
    steps:
      - name: Create git tag
        run: |
          git tag ${{ inputs.version }}
          git push origin ${{ inputs.version }}
      - name: Trigger Coolify production deploy
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_PROD }}" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}"
```

---

## C.3 — Staging & UAT

### Stratégie staging

| Aspect | Détail |
|--------|--------|
| **Déploiement** | Automatique à chaque push sur `main` (après CI verte) |
| **DB** | PostgreSQL séparé. Seeded avec données de test réalistes (10 établissements, 20 freelances, 30 missions, 15 services). |
| **Données** | Reset hebdomadaire via `prisma migrate reset && prisma db seed` (cron dimanche nuit). |
| **Accès** | Protégé par basic auth (nginx) ou Coolify built-in auth. |
| **Variables** | Mêmes variables que prod sauf secrets (différents) et Stripe en mode test. |

### Protocole UAT

| # | Phase | Acteur | Durée | Livrables |
|---|-------|--------|-------|-----------|
| 1 | **Smoke test** | Dev | 1h | Tous les flows P0 passent en staging |
| 2 | **Test fonctionnel** | Product Owner | 2-3j | Check chaque flow Phase 4 (14 flows). Note par flow : OK / KO / Mineur. |
| 3 | **Test terrain** | 2-3 beta-testers (1 directeur, 1 freelance, 1 mixte) | 5j | Feedback qualitatif. Formulaire structuré : facilité, compréhension, bugs. |
| 4 | **Bug triage** | Dev + PO | 1j | Classement : bloquant (fix avant release) / majeur (fix dans 48h post-release) / mineur (backlog). |
| 5 | **Go / No-Go** | PO + Dev | 1h | Décision formelle. Critère : 0 bloquant, < 3 majeurs non corrigés. |

### Checklist Go/No-Go

- [ ] Tous les tests CI sont verts
- [ ] 14 flows UAT : 0 bloquant
- [ ] Lighthouse : LCP < 2.5s, CLS < 0.1
- [ ] Sécurité : checklist B.1 100% ✅
- [ ] DB migration testée en staging
- [ ] Seed de prod préparé (admin user, données initiales)
- [ ] Monitoring et alerting configurés
- [ ] Runbook rollback documenté

---

## C.4 — Feature Flags

### Stratégie

Pas de solution SaaS (LaunchDarkly, etc.) en V1. Feature flags simples via variables d'environnement.

| Flag | Env var | Valeur V1 | Effet |
|------|---------|-----------|-------|
| `FEATURE_MESSAGING` | `NEXT_PUBLIC_FF_MESSAGING` | `false` → `true` | Active le menu Messagerie et `/dashboard/inbox` |
| `FEATURE_REVIEWS` | `NEXT_PUBLIC_FF_REVIEWS` | `false` → `true` | Active les prompts review et la soumission |
| `FEATURE_DOCUMENTS` | `NEXT_PUBLIC_FF_DOCUMENTS` | `false` → `true` | Active la section Documents dans `/account` |
| `FEATURE_STRIPE` | `FF_STRIPE` (server only) | `false` | Active Stripe Checkout au lieu du paiement simulé |
| `FEATURE_SOS_RENFORT` | `NEXT_PUBLIC_FF_SOS` | `true` | Active le mode SOS dans RenfortModal |

### Implémentation

```ts
// apps/web/src/lib/feature-flags.ts
export const FF = {
  messaging: process.env.NEXT_PUBLIC_FF_MESSAGING === 'true',
  reviews: process.env.NEXT_PUBLIC_FF_REVIEWS === 'true',
  documents: process.env.NEXT_PUBLIC_FF_DOCUMENTS === 'true',
  sosRenfort: process.env.NEXT_PUBLIC_FF_SOS === 'true',
} as const;

// Usage dans un composant :
// if (!FF.messaging) return null;
```

```ts
// apps/api/src/lib/feature-flags.ts
export const FF = {
  stripe: process.env.FF_STRIPE === 'true',
} as const;
```

### Plan d'activation par phase

| Semaine | Flags activés | Justification |
|---------|--------------|---------------|
| **S0 (launch)** | SOS Renfort | Core loop complet : inscription → renfort → candidature → confirmation → paiement |
| **S1** | + Messaging | Les premiers utilisateurs auront besoin de communiquer |
| **S2** | + Reviews | Suffisamment de missions complétées pour collecter des avis |
| **S3** | + Documents | Vérification conformité après les premiers usages |
| **S6+** | + Stripe | Paiement réel après validation du flow simulé |

---

## C.5 — Migration DB

### Stratégie de migration

| Aspect | Détail |
|--------|--------|
| **Outil** | Prisma Migrate (`prisma migrate deploy`) |
| **Exécution** | Automatique au démarrage du container API via `docker-entrypoint.sh` |
| **Retry** | 20 tentatives avec 3s de délai (existing entrypoint logic) |
| **Résolution** | `prisma migrate resolve` en cas de migration échouée (existing entrypoint logic) |

### Pré-migration prod

```bash
# 1. Backup DB (Coolify ou pg_dump)
pg_dump -h <host> -U <user> -d lesextras_prod -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# 2. Tester la migration sur un clone
createdb lesextras_migration_test
pg_restore -d lesextras_migration_test backup_latest.dump
cd apps/api && DATABASE_URL=<clone_url> npx prisma migrate deploy

# 3. Si OK → deploy prod
# 4. Si KO → analyser, corriger la migration, revenir au step 2
```

### Règles de migration

1. **Jamais de migration destructive en prod** sans backup vérifié.
2. **Colonnes nullable d'abord** : ajouter une colonne NOT NULL → 2 étapes (add nullable → backfill → alter NOT NULL).
3. **Pas de rename en direct** : ajouter la nouvelle colonne → migrer les données → supprimer l'ancienne après 1 release.
4. **Index en CONCURRENTLY** : sur les grosses tables, créer les index sans bloquer les écritures (raw SQL dans la migration si nécessaire).

---

## C.6 — Rollback

### Scénario 1 — Rollback applicatif (code)

```
1. Identifier le commit stable (dernier tag vert)
2. Coolify : re-deploy le commit/tag précédent
   OU
   git revert <commit> → push main → CI → deploy staging → vérifier → deploy prod
3. Temps estimé : 5-10 min
```

### Scénario 2 — Rollback DB (migration cassée)

```
1. Stopper les containers API (arrêter le traffic)
2. Restaurer le backup PG :
   pg_restore -c -d lesextras_prod backup_pre_migration.dump
3. Déployer le code du tag précédent (sans la migration cassée)
4. Redémarrer
5. Temps estimé : 15-30 min
```

### Scénario 3 — Rollback feature (bug non bloquant)

```
1. Désactiver le feature flag concerné (env var → false)
2. Redéployer (ou restart si c'est un env var runtime)
3. Investiguer et corriger
4. Réactiver le flag
5. Temps estimé : 2-5 min
```

### Runbook rollback

Documenter dans un fichier `RUNBOOK.md` :
- Contacts (qui déclenche le rollback, qui approuve)
- Seuils d'alerte (ex : error rate > 5% → investiguer, > 10% → rollback)
- Commandes exactes copier-coller pour chaque scénario
- Post-mortem template

---

## C.7 — Blue/Green

**Non implémenté V1.** Raisons :
- Coolify ne supporte pas nativement le blue/green.
- Le volume utilisateur V1 est faible (dizaines d'utilisateurs, pas des milliers).
- Le rollback par tag Coolify est suffisant (< 5 min de downtime acceptable).

**Quand passer au blue/green :**
- Volume > 500 utilisateurs actifs
- SLA > 99.9% requis
- Migration vers Kubernetes ou platform avec blue/green natif

**Alternative V1 : rolling deploy** — Coolify redéploye le nouveau container, healthcheck, puis bascule le traffic. Downtime théorique : 0 (le temps de startup du nouveau container, l'ancien continue de servir).

---

## C.8 — Monitoring live

### Stack monitoring

| Outil | Rôle | Coût V1 |
|-------|------|---------|
| **Sentry** | Error tracking (frontend + backend) | Gratuit (5K events/mois) |
| **Coolify metrics** | CPU, RAM, disk des containers | Inclus |
| **UptimeRobot** ou **Better Uptime** | Uptime monitoring + status page | Gratuit (50 monitors) |
| **Plausible** ou **PostHog** | Analytics / product metrics | Self-hosted (gratuit) ou cloud (petit tier) |
| **Prisma Pulse** (optionnel) | DB query performance | Évaluer post-V1 |

### Health checks

| Endpoint | Fréquence | Alerte si |
|----------|-----------|-----------|
| `GET /api/health` | 1 min | Aucune réponse 200 pendant 2 checks consécutifs |
| `GET /` (web) | 1 min | Aucune réponse 200 pendant 2 checks consécutifs |
| `SELECT 1` (DB via API health) | 1 min | Timeout > 5s |

### Sentry configuration

```ts
// apps/api/src/main.ts — ajouter
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,  // 20% des transactions
  profilesSampleRate: 0.1,
});
```

```ts
// apps/web/src/app/layout.tsx — ou via next.config.mjs
// @sentry/nextjs avec withSentryConfig
```

### Logs structurés

```ts
// apps/api/src/main.ts — remplacer console.log par un logger structuré
import { Logger } from '@nestjs/common';

// En prod, utiliser un format JSON pour parsing par Coolify/Loki :
// { "level": "error", "message": "...", "context": "BookingsService", "timestamp": "..." }
```

---

## C.9 — Alerting

| Alerte | Source | Seuil | Canal | Priorité |
|--------|--------|-------|-------|----------|
| **API down** | UptimeRobot | 2 checks failed (2 min) | Email + SMS | 🔴 Critique |
| **Web down** | UptimeRobot | 2 checks failed (2 min) | Email + SMS | 🔴 Critique |
| **Error spike** | Sentry | > 50 events/heure (même erreur) | Email + Slack/Discord | 🔴 Critique |
| **Unhandled exception** | Sentry | Toute nouvelle exception | Email | 🟡 Haute |
| **DB connection error** | Health check / Sentry | 1 occurrence | Email | 🟡 Haute |
| **Slow API** | Sentry perf | P95 > 2s sur une route critique | Email | 🟠 Moyenne |
| **Disk > 80%** | Coolify metrics | Seuil 80% | Email | 🟠 Moyenne |
| **SSL expiring** | UptimeRobot | < 14 jours | Email | 🟠 Moyenne |
| **High error rate** | Sentry | > 5% des requêtes en 4xx/5xx | Email | 🟡 Haute |

### Escalade

```
Alerte 🟠 → Notification email → Traiter sous 24h
Alerte 🟡 → Email + Slack → Traiter sous 4h
Alerte 🔴 → Email + SMS + Slack → Réaction dans 30 min
             Si pas de réponse en 30 min → SMS backup contact
```

---

## C.10 — Critères de succès post-release

### Semaine 1 (S+1)

| Critère | Seuil | Action si KO |
|---------|-------|-------------|
| Uptime | > 99% | Investiguer, rollback si nécessaire |
| Error rate (Sentry) | < 2% des requêtes | Hotfix |
| 0 bloquant UAT non résolu | 0 | Hotfix |
| Inscriptions | > 0 (preuve que le flow fonctionne) | Debug register/onboarding |
| Première mission publiée | ≥ 1 | Contacter les beta-testers |

### Semaine 2-4 (S+2 à S+4)

| Critère | Seuil | Action si KO |
|---------|-------|-------------|
| Uptime | > 99.5% | Stabiliser |
| Inscriptions cumulées | > 20 | Marketing / onboarding UX |
| Missions publiées | > 5 | Guider les établissements |
| Candidatures | > 3 | Vérifier le job board / freelances |
| 1ère mission complétée | ≥ 1 | Accompagnement manuel si nécessaire |
| Feedback beta | NPS > 0 (plus de promoteurs que de détracteurs) | Itérer sur le feedback |
| 0 vulnérabilité critique signalée | 0 | Hotfix sécurité immédiat |

---

# D. KPIs post-lancement

## D.1 — KPIs Établissement

| KPI | Définition | Formule | Cible M1 | Cible M3 |
|-----|-----------|---------|----------|----------|
| **Inscriptions ESTABLISHMENT** | Nb nouveaux comptes ESTABLISHMENT | `COUNT(User WHERE role=ESTABLISHMENT AND createdAt > ?)` | > 10 | > 30 |
| **Onboarding completion** | % qui finissent le wizard | `completes / registers × 100` | > 80% | > 85% |
| **First publish rate** | % établissements qui publient ≥ 1 renfort dans les 7j | `publishers_7d / registers × 100` | > 40% | > 55% |
| **Missions publiées / mois** | Volume de publication | `COUNT(Mission WHERE createdAt in month)` | > 10 | > 40 |
| **Time to first publish** | Temps médian register → 1ère mission | `MEDIAN(mission.createdAt - user.createdAt)` | < 24h | < 4h |
| **Confirm rate** | % missions OPEN → ASSIGNED | `ASSIGNED / OPEN × 100` | > 40% | > 60% |
| **Credits purchased** | Nb packs achetés | `COUNT(PackPurchase)` | > 5 | > 20 |
| **Retention M1** | % établissements actifs à M+1 | `active_m1 / registered_m0 × 100` | > 50% | > 60% |

---

## D.2 — KPIs Freelance

| KPI | Définition | Formule | Cible M1 | Cible M3 |
|-----|-----------|---------|----------|----------|
| **Inscriptions FREELANCE** | Nb nouveaux comptes FREELANCE | `COUNT(User WHERE role=FREELANCE)` | > 20 | > 80 |
| **Onboarding completion** | % wizard terminé | `completes / registers × 100` | > 85% | > 90% |
| **Profile completeness** | Score moyen de profil (0-100) | `AVG(profile_score)` | > 60% | > 75% |
| **Candidatures / freelance / mois** | Volume d'activité | `COUNT(Booking WHERE freelanceId AND status=PENDING) / active_freelances` | > 2 | > 4 |
| **Candidature acceptée rate** | % candidatures → CONFIRMED | `CONFIRMED / PENDING × 100` | > 30% | > 40% |
| **Time to first apply** | Temps médian register → 1ère candidature | `MEDIAN(booking.createdAt - user.createdAt)` | < 48h | < 12h |
| **Missions complétées / freelance** | Fidélisation | `COUNT(Booking WHERE freelanceId AND status=COMPLETED)` | > 0.5 | > 2 |
| **Retention M1** | % freelances actifs à M+1 | `active_m1 / registered_m0 × 100` | > 40% | > 55% |

---

## D.3 — KPIs Renfort

| KPI | Définition | Formule | Cible M1 | Cible M3 |
|-----|-----------|---------|----------|----------|
| **Missions publiées** | Total missions créées | `COUNT(Mission)` | > 15 | > 60 |
| **SOS ratio** | % missions en mode urgence | `SOS / total × 100` | < 30% | < 25% |
| **Candidatures par mission** | Attractivité des annonces | `AVG(bookings per mission)` | > 1.5 | > 3 |
| **Time to first candidature** | Réactivité freelances | `MEDIAN(first_booking.createdAt - mission.createdAt)` | < 48h | < 12h |
| **Fill rate** | % missions pourvues (ASSIGNED + COMPLETED) | `filled / total × 100` | > 40% | > 65% |
| **SOS fill rate** | % SOS missions pourvues | `filled_sos / total_sos × 100` | > 50% | > 75% |
| **Completion rate** | % ASSIGNED → COMPLETED → PAID | `paid / assigned × 100` | > 80% | > 90% |
| **Cancellation rate** | % missions annulées (par étab ou freelance) | `cancelled / total × 100` | < 20% | < 10% |
| **Avg hourly rate** | Taux horaire moyen pratiqué | `AVG(hourlyRate)` | Monitoring | Monitoring |

---

## D.4 — KPIs Ateliers

| KPI | Définition | Formule | Cible M1 | Cible M3 |
|-----|-----------|---------|----------|----------|
| **Ateliers publiés** | Nb services ACTIVE | `COUNT(Service WHERE status=ACTIVE)` | > 5 | > 25 |
| **Ateliers / freelance** | Production contenu | `AVG(services per freelance)` | > 0.5 | > 1.5 |
| **Catalogue views** | Nb pages catalogue vues / mois | Analytics `pageview /marketplace` (ESTABLISHMENT) | > 50 | > 200 |
| **Detail view rate** | % vues catalogue → clic fiche détail | `detail_views / catalog_views × 100` | > 20% | > 30% |
| **Réservations / mois** | Volume de booking ateliers | `COUNT(Booking WHERE serviceId IS NOT NULL)` | > 3 | > 15 |
| **Conversion rate** | % vues détail → réservation/devis | `bookings / detail_views × 100` | > 8% | > 12% |
| **Quote accept rate** | % devis envoyés → acceptés | `accepted / sent × 100` | > 40% | > 55% |
| **Quote response time** | Temps médian demande → réponse freelance | `MEDIAN(quote_response - quote_request)` | < 72h | < 48h |

---

## D.5 — KPIs Paiement

| KPI | Définition | Formule | Cible M1 | Cible M3 |
|-----|-----------|---------|----------|----------|
| **GMV (Gross Merchandise Value)** | Volume total des transactions | `SUM(Invoice.amount WHERE status=PAID)` | Monitoring | Monitoring |
| **Packs vendus / mois** | Revenus crédits | `COUNT(PackPurchase in month)` | > 5 | > 15 |
| **Credits usage rate** | % crédits achetés qui sont consommés | `used / purchased × 100` | > 60% | > 80% |
| **Time to pay** | Temps médian complétion → paiement | `MEDIAN(payment_date - completion_date)` | < 7j | < 3j |
| **Payment failure rate** | % paiements échoués (Stripe, futur) | `failed / attempted × 100` | < 5% | < 2% |
| **Revenue / establishment / month** | Panier moyen | `GMV / active_establishments` | Monitoring | Monitoring |

---

## D.6 — KPIs Qualité produit

| KPI | Définition | Outil | Alerte si |
|-----|-----------|-------|-----------|
| **Uptime** | % temps disponible | UptimeRobot | < 99.5% |
| **Error rate** | % requêtes en 4xx/5xx | Sentry | > 2% |
| **P95 API latency** | Temps de réponse API (percentile 95) | Sentry perf | > 1s |
| **Crash-free sessions** | % sessions frontend sans erreur JS | Sentry | < 98% |
| **LCP** | Largest Contentful Paint | Lighthouse / CrUX | > 2.5s |
| **CLS** | Cumulative Layout Shift | Lighthouse / CrUX | > 0.1 |
| **Weekly active users** | Nb users avec ≥ 1 action / semaine | Analytics | Décroissance 2 semaines consécutives |
| **NPS** | Net Promoter Score (sondage in-app) | Formulaire | < 0 |
| **Support tickets** | Nb demandes support / semaine | Email / formulaire | Croissance > 50% semaine sur semaine |
| **Bug cycle time** | Temps médian signalement → fix deployed | GitHub issues | > 5 jours pour un bloquant |

---

## Synthèse — Matrice d'exécution

```
AVANT le code ────────────────────────────────────────────
  ✅ Installer stack test (Vitest + testing-library + Playwright)
  ✅ Configurer CI (lint → typecheck → test → build → e2e)
  ✅ Créer les helpers de test (factories, fixtures)
  ✅ Définir les feature flags
  ✅ Configurer Sentry (frontend + backend)

PENDANT le code ──────────────────────────────────────────
  ✅ Écrire les tests unitaires en même temps que chaque service
  ✅ Écrire les tests composants en même temps que chaque modal/widget
  ✅ Tests intégration API après chaque module
  ✅ CI verte obligatoire avant merge

AVANT la release ─────────────────────────────────────────
  ✅ 10 scénarios E2E Playwright passent
  ✅ Checklist B complète (sécurité, a11y, responsive, perf)
  ✅ Staging déployé et testé
  ✅ UAT par PO + beta-testers
  ✅ Migration DB testée sur clone
  ✅ Runbook rollback documenté
  ✅ Monitoring + alerting actifs
  ✅ Go/No-Go formel

APRÈS la release ─────────────────────────────────────────
  ✅ Surveiller KPIs D.1-D.6 quotidiennement (S1)
  ✅ Activation progressive des feature flags
  ✅ Hotfix < 4h pour les bloquants
  ✅ Itération hebdomadaire basée sur le feedback terrain
```
