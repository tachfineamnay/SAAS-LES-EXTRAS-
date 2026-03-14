# PHASE 3 — Backend Completion

> **Objectif** : Compléter le backend NestJS/Prisma pour que les promesses produit soient réellement supportées.
>
> **Périmètre strict** : 2 piliers — **SOS Renfort / Remplacement** + **Ateliers** — dans le secteur **psycho-éducatif et médico-social de terrain**.
>
> **Vocabulaire** : FREELANCE / ESTABLISHMENT (jamais talent/client).

---

## Table des matières

- [A. Cartographie des manques](#a-cartographie-des-manques)
- [B. Architecture backend cible](#b-architecture-backend-cible)
- [C. Modèles de données cible](#c-modèles-de-données-cible)
- [D. Plan d'implémentation (tickets techniques)](#d-plan-dimplémentation-tickets-techniques)
- [E. API Contract](#e-api-contract)

---

## A. Cartographie des manques

### A.1 — Bugs bloquants (runtime errors existants)

| # | Module | Fichier | Bug | Impact |
|---|--------|---------|-----|--------|
| B1 | bookings | `bookings.service.ts` L155 | `b.talent?.email` → propriété inexistante, devrait être `b.freelance?.email` | `relatedBookingId` toujours `undefined` pour les lignes MISSION côté ESTABLISHMENT |
| B2 | bookings | `bookings.service.ts` L210 | `mb.reliefMission.client` → relation inexistante, devrait être `mb.reliefMission.establishment` | **Crash runtime** pour tout FREELANCE consultant ses bookings missions |
| B3 | users | `users.controller.ts` L18 | `findAllTalents()` → méthode inexistante, devrait être `findAllFreelances()` | **Crash runtime** sur `GET /api/users/talents` |
| B4 | invoices | `invoices.service.ts` createPdf | `invoice.booking.client` et `invoice.booking.talent` → inexistants | Client/Provider toujours "N/A" dans les PDF |
| B5 | quotes | `quotes.service.ts` accept | `clientId` / `talentId` / `quoteId` → champs inexistants dans Booking | **Crash Prisma** lors d'accept-quote legacy flow |
| B6 | bookings | `bookings.service.ts` completeBooking | `include` ne charge pas `quote` mais `(booking as any).quote` est utilisé | Montant basé sur quote toujours = 0 |
| B7 | quotes | `quotes.service.ts` L4 | Import `src/prisma/prisma.service` (chemin absolu) | Fragile selon config TS, peut casser en production |
| B8 | notifications | `notifications.service.ts` L2 | Import `src/prisma/prisma.service` (chemin absolu) | Idem B7 |

### A.2 — Failles de sécurité

| # | Module | Problème | Risque |
|---|--------|----------|--------|
| S1 | auth | `register` accepte `role: ADMIN` dans le DTO | N'importe qui peut se créer un compte ADMIN |
| S2 | invoices | `generateInvoicePdf` — aucune vérification d'ownership | Tout utilisateur authentifié peut télécharger toute facture |
| S3 | notifications | `markAsRead` — aucune vérification d'ownership | Tout utilisateur peut marquer les notifs d'un autre comme lues |
| S4 | quotes | `create` — aucune vérif que l'appelant est le freelance référencé | Un user peut créer des devis au nom d'un autre |
| S5 | auth | Check BANNED après validation du mot de passe | Fuite d'information : attaquant sait si le mot de passe est correct |
| S6 | auth | Pas de normalisation email (casse) | Doublons possibles : `Test@Foo.com` ≠ `test@foo.com` |
| S7 | bookings | Race condition sur credits (check > 0 puis décrement séparé) | Double-spend possible : crédits négatifs |
| S8 | messaging | Actions Next.js utilisent Prisma directement au lieu de l'API | Bypass complet de l'authentification API, le middleware Next ne protège pas |

### A.3 — Fonctionnalités manquantes par domaine

#### 🏥 Pilier 1 — SOS Renfort / Remplacement

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F1 | Publication mission de renfort | ✅ `POST /missions` avec tous les champs v2 | Pas de validation métier (dates dans le futur, taux horaire min/max) |
| F2 | Recherche / matching board | ✅ `GET /missions` avec filtres city/date | Pas de filtre par métier, compétences, shift, type de structure. Pas de pagination. |
| F3 | Candidature freelance | ✅ `POST /missions/:id/apply` | OK — manque notification à l'établissement |
| F4 | Gestion candidatures (accept/reject) | ✅ Via `POST /bookings/confirm` | Pas d'endpoint dédié reject-candidature (annulation = seul moyen). Pas de notification rejet. |
| F5 | Complétion mission | ✅ `POST /bookings/complete` → COMPLETED_AWAITING_PAYMENT | Bug B6 (montant quote). Pas de validation bilatérale (freelance confirme aussi). |
| F6 | Paiement / validation | ✅ `POST /bookings/authorize-payment` | **Pas de Stripe Connect**, pas de virement réel, juste un changement de statut DB. |
| F7 | Facturation | ✅ Invoice créée à complétion + PDF basique | Bug B4 (noms erronés). Pas de numérotation légale. Pas de TVA. Pas de commission calculée. |

#### 🎨 Pilier 2 — Ateliers

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F8 | Catalogue ateliers | ✅ `GET /services` (filtre isHidden) | Pas de filtre par catégorie, type, prix, disponibilité. Pas de pagination. |
| F9 | Fiche atelier détaillée | ✅ `GET /services/:id` | OK — manque reviews associés. |
| F10 | Création atelier | ✅ `POST /services` avec tous champs | Pas de statut DRAFT → publication workflow. |
| F11 | Réservation atelier | ✅ `POST /services/:id/book` avec flow QUOTE | Race condition (duplicate check). Pas de gestion capacité (nb places restantes). |
| F12 | Mes ateliers (freelance) | ❌ Aucun endpoint | Le freelance ne peut pas lister/gérer ses propres ateliers. |
| F13 | Mes réservations ateliers (établissement) | ⚠️ Via bookings agrégés | Pas de vue dédiée ateliers. |

#### ⭐ Transversal — Reviews

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F14 | Laisser un avis | ❌ Model Review existe, aucun endpoint | **Aucun controller/service reviews**. |
| F15 | Voir les avis reçus | ❌ | Pas d'endpoint pour lister les reviews d'un freelance/établissement. |
| F16 | Avis bidirectionnel | ❌ | Pas de logique ESTABLISHMENT_TO_FREELANCE + FREELANCE_TO_ESTABLISHMENT post-mission. |

#### 💬 Transversal — Messagerie

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F17 | Conversations | ❌ Modèle DirectMessage plat | Pas de modèle Conversation (threads). Pas d'endpoint API. Le frontend utilise Prisma directement (S8). |
| F18 | Liste conversations | ❌ | Pas d'agrégation par interlocuteur, pas de derniers messages. |
| F19 | Temps réel | ❌ | Pas de WebSocket Gateway. Polling uniquement. |

#### 👤 Transversal — Profil utilisateur

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F20 | Voir/éditer mon profil | ❌ | Aucun `GET /users/me` ni `PATCH /users/me`. Seul l'onboarding écrit dans User. |
| F21 | Profil public freelance | ⚠️ `GET /users/talents` liste tous | Pas de `GET /users/:id/profile` public. Pas de reviews, missions complétées, etc. |
| F22 | Upload avatar/documents | ❌ | Pas de module upload, pas de storage (Cloudflare R2 / S3). |

#### 🔔 Transversal — Notifications

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F23 | Notifications API | ⚠️ Service-only (pas de controller) | Pas d'endpoint `GET /notifications`, `PATCH /notifications/:id/read`. |
| F24 | Notifications temps réel | ❌ | Pas de WebSocket, pas de push. |
| F25 | Notifications email | ❌ | Pas de module email (nodemailer, Resend, etc.). |

#### 💳 Transversal — Paiements & Crédits

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F26 | Stripe Connect | ❌ | Aucune intégration Stripe. Pas de `stripeAccountId` sur User. Pas de paiement réel. |
| F27 | Achat de crédits/packs | ⚠️ Front simule (`buyPack` incrémente des crédits) | Pas d'endpoint API. Pas de Stripe Checkout. PackPurchase n'est pas relié à un vrai paiement. |
| F28 | Commission plateforme | ❌ | `commissionAmount` sur Invoice existe mais est toujours 0. Aucune logique de calcul. |
| F29 | Historique revenus | ❌ | Pas de dashboard finance freelance. Pas d'agrégation revenus/dépenses. |

#### 🛡️ Transversal — Admin

| # | Fonctionnalité | État actuel | Manque |
|---|---------------|-------------|-------|
| F30 | Admin dashboard | ✅ CRUD users/missions/services | Pas de stats (CA, nb users, nb missions). Pas de gestion disputes. Pas d'admin invoices. |
| F31 | Modération reviews | ❌ | Pas de CRUD admin reviews. |

### A.4 — Problèmes architecturaux

| # | Problème | Impact |
|---|----------|--------|
| A1 | Aucune pagination sur aucun endpoint `findMany` | Performance dégradée avec la croissance des données |
| A2 | Pas de module upload/storage | Bloquant pour avatars, documents, attestations |
| A3 | Pas de jobs asynchrones (Bull/BullMQ) | Bloquant pour emails, PDF lourds, nettoyage |
| A4 | Pas de WebSocket Gateway | Bloquant pour chat temps réel et notifications live |
| A5 | Frontend bypass API (messaging via Prisma direct) | Architecture cassée — le frontend ne devrait JAMAIS accéder à la DB |
| A6 | Pas de module email | Bloquant pour confirmation inscription, reset password, notifications email |
| A7 | `onboardingStep` dans le JWT devenu stale immédiatement | Frontend affiche des données obsolètes après onboarding update |
| A8 | Pas de refresh token | JWT expire après 7j sans possibilité de renouvellement silencieux |

---

## B. Architecture backend cible

### B.1 — Vue d'ensemble des modules

```
apps/api/src/
├── main.ts                          # Bootstrap, CORS, ValidationPipe, Swagger
├── app.module.ts                    # Root module — imports all feature modules
│
├── common/                          # 🆕 Shared utilities
│   ├── dto/
│   │   └── pagination.dto.ts       # PaginationQueryDto (page, limit, sortBy, sortOrder)
│   ├── types/
│   │   └── paginated-result.type.ts # PaginatedResult<T> { data, meta: { total, page, limit, totalPages } }
│   ├── decorators/
│   │   └── api-paginated.decorator.ts
│   └── helpers/
│       └── paginate.helper.ts       # buildPrismaSkipTake(dto) → { skip, take }
│
├── auth/                            # ✏️ Existant — corrections
│   ├── auth.controller.ts
│   ├── auth.service.ts             # Fix S1, S5, S6 + refresh token
│   ├── dto/
│   │   ├── register.dto.ts         # Fix: exclure ADMIN du role enum
│   │   └── login.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   └── types/
│       └── jwt-payload.type.ts
│
├── users/                           # ✏️ Existant — extensions majeures
│   ├── users.controller.ts         # Fix B3 + nouveaux endpoints (me, profile public)
│   ├── users.service.ts            # Fix: onboarding écrit dans Profile + GET/PATCH me
│   ├── users.module.ts
│   └── dto/
│       ├── update-profile.dto.ts   # 🆕
│       └── update-onboarding.dto.ts # 🆕 (remplace body typé inline)
│
├── missions/                        # ✏️ Existant — extensions
│   ├── missions.controller.ts      # + pagination, filtres étendus
│   ├── missions.service.ts         # + notification à l'établissement sur candidature
│   ├── missions.module.ts
│   └── dto/
│       ├── create-mission.dto.ts
│       ├── apply-mission.dto.ts
│       └── find-missions-query.dto.ts # ✏️ + filtres métier, shift, skills
│
├── services/                        # ✏️ Existant — extensions
│   ├── services.controller.ts      # + pagination, my-services, filtres
│   ├── services.service.ts         # + findMyServices, capacity check
│   ├── services.module.ts
│   └── dto/
│       ├── create-service.dto.ts
│       ├── book-service.dto.ts
│       └── find-services-query.dto.ts # 🆕
│
├── bookings/                        # ✏️ Existant — corrections
│   ├── bookings.controller.ts
│   ├── bookings.service.ts         # Fix B1, B2, B6 + pagination
│   ├── bookings.module.ts
│   └── dto/
│       ├── cancel-booking-line.dto.ts
│       └── action-booking.dto.ts
│
├── quotes/                          # ✏️ Existant — corrections
│   ├── quotes.controller.ts
│   ├── quotes.service.ts           # Fix B5, S4 + pagination
│   ├── quotes.module.ts
│   └── dto/
│       ├── create-quote.dto.ts
│       └── update-quote.dto.ts
│
├── invoices/                        # ✏️ Existant — corrections
│   ├── invoices.controller.ts      # Fix S2 (ownership check)
│   ├── invoices.service.ts         # Fix B4 + commission calculation
│   ├── invoices.module.ts
│   └── dto/                        # (aucun actuellement)
│
├── reviews/                         # 🆕 Nouveau module
│   ├── reviews.controller.ts       # CRUD reviews post-booking
│   ├── reviews.service.ts          # Validation: 1 review per booking+author, booking must be COMPLETED/PAID
│   ├── reviews.module.ts
│   └── dto/
│       └── create-review.dto.ts
│
├── messaging/                       # 🆕 Nouveau module (remplace DirectMessage plat + frontend Prisma)
│   ├── messaging.controller.ts     # REST endpoints conversations/messages
│   ├── messaging.service.ts        # Conversations avec agrégation + mark-as-read
│   ├── messaging.gateway.ts        # 🆕 WebSocket Gateway (Socket.io) pour temps réel
│   ├── messaging.module.ts
│   └── dto/
│       ├── send-message.dto.ts
│       └── find-conversations-query.dto.ts
│
├── notifications/                   # ✏️ Existant — extensions
│   ├── notifications.controller.ts # 🆕 (n'existe pas actuellement)
│   ├── notifications.service.ts    # Fix B8 + ownership check (S3)
│   ├── notifications.gateway.ts    # 🆕 WebSocket pour notifs temps réel
│   ├── notifications.module.ts
│   └── dto/
│       └── create-notification.dto.ts
│
├── uploads/                         # 🆕 Nouveau module
│   ├── uploads.controller.ts       # POST upload, GET signed-url
│   ├── uploads.service.ts          # Abstraction storage (local dev / Cloudflare R2 prod)
│   ├── uploads.module.ts
│   └── dto/
│       └── upload-file.dto.ts
│
├── payments/                        # 🆕 Nouveau module (Stripe Connect)
│   ├── payments.controller.ts      # Webhooks Stripe + endpoints checkout/connect
│   ├── payments.service.ts         # Stripe Connect onboarding, paiements, virements
│   ├── payments.module.ts
│   └── dto/
│       ├── create-checkout.dto.ts
│       └── stripe-webhook.dto.ts
│
├── admin-offers/                    # ✅ Existant — OK
├── admin-users/                     # ✅ Existant — OK
├── prisma/                          # ✅ Existant — OK
└── health.controller.ts             # ✅ Existant — OK
```

### B.2 — Dépendances à ajouter

| Package | Version | Rôle |
|---------|---------|------|
| `stripe` | `^17` | SDK Stripe pour Connect + Checkout |
| `@nestjs/platform-socket.io` | `^10` | WebSocket Gateway |
| `@nestjs/websockets` | `^10` | WebSocket support |
| `socket.io` | `^4.8` | Socket.io server |
| `@aws-sdk/client-s3` | `^3` | Client S3 (compatible Cloudflare R2) |
| `@aws-sdk/s3-request-presigner` | `^3` | URLs pré-signées pour uploads |
| `multer` | `^1.4` | Parsing multipart/form-data (uploads) |
| `@nestjs/swagger` | `^8` | Documentation API auto-générée |
| `@nestjs/schedule` | `^4` | Tâches planifiées (cron: expiration missions, relances) |
| `nodemailer` | `^6` | Envoi d'emails transactionnels |

### B.3 — Diagramme de flux principaux

```
┌─────────────────────────────────────────────────────────────┐
│                  SOS RENFORT — Flow complet                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ESTABLISHMENT                              FREELANCE       │
│  ─────────────                              ─────────       │
│  POST /missions ──────┐                                     │
│  (créer mission)      │                                     │
│                       ▼                                     │
│                  [Mission OPEN]                              │
│                       │                                     │
│                       │◄──── GET /missions (matching board) │
│                       │      POST /missions/:id/apply ──────┤
│                       │      (candidature)                  │
│                       ▼                                     │
│                  [Booking PENDING] ─── notif → ESTABLISHMENT│
│                       │                                     │
│  POST /bookings/confirm                                     │
│  (accepter candidat)  │                                     │
│                       ▼                                     │
│                  [Booking CONFIRMED]                         │
│                  [Mission ASSIGNED] ── notif → FREELANCE    │
│                       │                                     │
│                  ... mission se déroule ...                  │
│                       │                                     │
│  POST /bookings/complete                                    │
│  (marquer terminé)    │                                     │
│                       ▼                                     │
│                  [Booking COMPLETED_AWAITING_PAYMENT]        │
│                  [Invoice PENDING_PAYMENT créée]             │
│                       │                                     │
│  POST /bookings/authorize-payment                           │
│  (valider paiement)   │                                     │
│                       ▼                                     │
│                  [Booking PAID]                              │
│                  [Invoice PAID] ──── notif → FREELANCE      │
│                       │                                     │
│                  [Review window opens — 14 jours]           │
│                       │                                     │
│  POST /reviews ◄──────┼──────► POST /reviews                │
│  (noter freelance)    │        (noter établissement)        │
│                       ▼                                     │
│                  [FIN DU FLOW]                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ATELIER — Flow complet                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREELANCE                              ESTABLISHMENT       │
│  ─────────                              ─────────────       │
│  POST /services ──────┐                                     │
│  (créer atelier)      │                                     │
│                       ▼                                     │
│                  [Service ACTIVE]                            │
│                       │                                     │
│                       │◄──── GET /services (catalogue)      │
│                       │      GET /services/:id (fiche)      │
│                       │                                     │
│                       │      POST /services/:id/book ───────┤
│                       │      (réserver)                     │
│                       ▼                                     │
│  ┌─── pricingType?                                          │
│  │                                                          │
│  ├─ SESSION/PER_PARTICIPANT ──► [Booking PENDING]           │
│  │                               │                          │
│  │  POST /bookings/confirm ◄─────┘                          │
│  │  (confirmer booking)                                     │
│  │                                                          │
│  └─ QUOTE ──► [Booking PENDING] + [Quote PENDING]          │
│               │                                             │
│               │  PATCH /quotes/:id                          │
│               │  (freelance remplit montant)                │
│               │                                             │
│               │  PATCH /quotes/:id/accept ◄── ESTABLISHMENT │
│               ▼                                             │
│          [Booking CONFIRMED]                                │
│               │                                             │
│          ... atelier se déroule ...                          │
│               │                                             │
│          (même flow complétion + paiement que Renfort)      │
└─────────────────────────────────────────────────────────────┘
```

### B.4 — Conventions techniques

| Sujet | Convention |
|-------|-----------|
| **Pagination** | Tous les endpoints listing retournent `PaginatedResult<T>`. Query params: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc` |
| **Erreurs** | NestJS exceptions standards (400, 401, 403, 404, 409). Format: `{ statusCode, message, error }` |
| **Validation** | `class-validator` + `class-transformer` via `ValidationPipe` global (whitelist + transform) |
| **Auth** | JWT Bearer token dans header `Authorization`. Access token (15min) + Refresh token (7d). |
| **WebSocket** | Namespace `/ws`. Auth via `token` query param. Rooms: `user:{userId}` |
| **Uploads** | Multipart via Multer. Max 5MB images, 10MB documents. Types: AVATAR, DOCUMENT, ATTESTATION |
| **Imports** | Toujours relatifs (`../module/file`), jamais `src/module/file` |
| **Tests** | Chaque service a un fichier `.spec.ts`. Focus sur la logique métier. |

---

## C. Modèles de données cible

### C.1 — Changements sur les modèles existants

#### User — ajout champs Stripe

```prisma
model User {
  // ... champs existants inchangés ...

  // 🆕 Stripe Connect
  stripeCustomerId   String?   @unique  // Stripe Customer ID (pour paiements)
  stripeAccountId    String?   @unique  // Stripe Connect Account ID (pour recevoir)
  stripeOnboarded    Boolean   @default(false)

  // 🆕 Relations nouvelles
  conversations      ConversationParticipant[]
  uploads            Upload[]
}
```

#### Profile — ajout champs manquants

```prisma
model Profile {
  // ... champs existants inchangés ...

  // 🆕 Champs profil public freelance
  experienceYears    Int?
  diplomas           String[]
  specializations    String[]   // ex: "autisme", "TDAH", "polyhandicap"
  interventionZone   String?    // ex: "Île-de-France", "Lyon +50km"
  hourlyRate         Float?     // Tarif indicatif du freelance
  availabilityNote   String?    // "Disponible dès le 15 mars"
}
```

#### Invoice — ajout champs facturation légale

```prisma
model Invoice {
  // ... champs existants inchangés ...

  // 🆕 Facturation légale
  tvaRate            Float     @default(0)        // 0 = auto-entrepreneur / exo TVA
  tvaAmount          Float     @default(0)
  totalHT            Float     @default(0)
  totalTTC           Float     @default(0)
  stripePaymentId    String?   @unique            // Stripe PaymentIntent ID
  paidAt             DateTime?
}
```

#### Notification — enrichissement

```prisma
model Notification {
  // ... champs existants inchangés ...

  // 🆕
  actionUrl          String?    // URL vers la page concernée (ex: /dashboard/bookings/xxx)
  relatedEntityId    String?    // ID de l'entité liée (booking, mission, etc.)
  relatedEntityType  String?    // "BOOKING" | "MISSION" | "REVIEW" | "MESSAGE"
}
```

### C.2 — Nouveaux modèles

#### Conversation + Message (remplace DirectMessage)

```prisma
model Conversation {
  id           String     @id @default(cuid())
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Contexte optionnel (lié à un booking/mission)
  bookingId    String?
  missionId    String?

  participants ConversationParticipant[]
  messages     Message[]

  booking      Booking?        @relation(fields: [bookingId], references: [id])
  mission      ReliefMission?  @relation(fields: [missionId], references: [id])
}

model ConversationParticipant {
  id               String       @id @default(cuid())
  conversationId   String
  userId           String
  lastReadAt       DateTime     @default(now())

  conversation     Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
}

model Message {
  id               String       @id @default(cuid())
  conversationId   String
  senderId         String
  content          String       @db.Text
  createdAt        DateTime     @default(now())

  conversation     Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender           User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
}
```

#### Upload

```prisma
enum UploadType {
  AVATAR
  DOCUMENT
  ATTESTATION
}

model Upload {
  id           String     @id @default(cuid())
  userId       String
  type         UploadType
  filename     String
  mimeType     String
  sizeBytes    Int
  storageKey   String     @unique  // Clé dans Cloudflare R2 / S3
  url          String?             // URL publique ou pré-signée
  createdAt    DateTime   @default(now())

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, type])
}
```

#### StripeEvent (idempotence webhooks)

```prisma
model StripeEvent {
  id              String   @id @default(cuid())
  stripeEventId   String   @unique    // Stripe event ID (evt_xxx)
  type            String               // "payment_intent.succeeded", etc.
  processed       Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

### C.3 — Enums à ajouter

```prisma
// Aucun nouvel enum requis — UploadType ci-dessus est le seul ajout.
// Les enums existants couvrent tous les cas.
```

### C.4 — Modèles à supprimer

| Modèle | Raison |
|--------|--------|
| `DirectMessage` | Remplacé par `Conversation` + `Message`. Migration : copier les messages existants dans le nouveau schéma. |
| `PackPurchase` | Remplacé par le flow Stripe Checkout. Les crédits deviennent des paiements réels. |

### C.5 — Relations ajoutées sur modèles existants

```prisma
// Sur ReliefMission — ajout relation conversations
model ReliefMission {
  // ... existant ...
  conversations  Conversation[]
}

// Sur Booking — ajout relation conversation
model Booking {
  // ... existant ...
  conversations  Conversation[]
}

// Sur User — ajout relation messages envoyés (nouveau modèle)
model User {
  // ... existant ...
  sentMessages2  Message[]  @relation("MessageSender")
}
```

### C.6 — Schéma cible complet résumé

| Modèle | Action | Changements clés |
|--------|--------|-----------------|
| User | ✏️ Modifier | +stripeCustomerId, +stripeAccountId, +stripeOnboarded, +relations |
| Profile | ✏️ Modifier | +experienceYears, +diplomas, +specializations, +interventionZone, +hourlyRate, +availabilityNote |
| ReliefMission | ✏️ Modifier | +conversations relation |
| Service | ✅ Inchangé | — |
| Quote | ✅ Inchangé | — |
| Booking | ✏️ Modifier | +conversations relation |
| Invoice | ✏️ Modifier | +tvaRate, +tvaAmount, +totalHT, +totalTTC, +stripePaymentId, +paidAt |
| Review | ✅ Inchangé | — |
| Notification | ✏️ Modifier | +actionUrl, +relatedEntityId, +relatedEntityType |
| Conversation | 🆕 Créer | Thread de conversation avec participants |
| ConversationParticipant | 🆕 Créer | Lien user/conversation + lastReadAt |
| Message | 🆕 Créer | Message dans une conversation |
| Upload | 🆕 Créer | Fichiers uploadés (avatar, documents) |
| StripeEvent | 🆕 Créer | Idempotence webhooks Stripe |
| DirectMessage | 🗑️ Supprimer | Remplacé par Conversation+Message |
| PackPurchase | 🗑️ Supprimer | Remplacé par Stripe Checkout |

---

## D. Plan d'implémentation (tickets techniques)

### Phase 3.0 — Bugfixes critiques (pré-requis)

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-001** | Fix runtime crashes (B1, B2, B3, B4, B5, B6) | `bookings.service.ts`, `users.controller.ts`, `invoices.service.ts`, `quotes.service.ts` | S |
| **T-002** | Fix import paths absolus (B7, B8) | `quotes.service.ts`, `notifications.service.ts` | XS |
| **T-003** | Fix sécurité auth: bloquer role ADMIN + normaliser email + check banned avant password (S1, S5, S6) | `auth.service.ts`, `register.dto.ts` | S |
| **T-004** | Fix authorization: ownership check invoices + notifications (S2, S3) | `invoices.service.ts`, `invoices.controller.ts`, `notifications.service.ts` | S |
| **T-005** | Fix authorization: quote create vérifie appelant (S4) | `quotes.service.ts`, `quotes.controller.ts` | XS |
| **T-006** | Fix race condition crédits: SELECT FOR UPDATE (S7) | `bookings.service.ts` | S |

### Phase 3.1 — Fondations communes

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-010** | Module common: PaginationDto + PaginatedResult + helper | `common/dto/`, `common/types/`, `common/helpers/` | S |
| **T-011** | Ajouter pagination à tous les endpoints listing | `missions`, `services`, `bookings`, `invoices`, `quotes`, `admin-*` | M |
| **T-012** | Migration Prisma: ajout champs User (Stripe), Profile (freelance), Invoice (compta), Notification (enrichi) | `schema.prisma`, nouvelle migration | S |
| **T-013** | Migration Prisma: Conversation + Message + Upload + StripeEvent | `schema.prisma`, nouvelle migration | S |
| **T-014** | Migration Prisma: supprimer DirectMessage + PackPurchase (avec migration données) | `schema.prisma`, migration script | M |

### Phase 3.2 — Profil & Onboarding

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-020** | `GET /users/me` — Retourne profil complet de l'utilisateur connecté | `users.controller.ts`, `users.service.ts` | S |
| **T-021** | `PATCH /users/me` — Mise à jour profil (firstName, lastName, bio, phone, address, skills, etc.) | `users.controller.ts`, `users.service.ts`, `dto/update-profile.dto.ts` | S |
| **T-022** | `GET /users/:id/profile` — Profil public d'un freelance (+ reviews + stats) | `users.controller.ts`, `users.service.ts` | M |
| **T-023** | Refactor onboarding: écrire dans Profile au lieu de seulement User.onboardingStep | `users.service.ts`, `dto/update-onboarding.dto.ts` | S |
| **T-024** | `GET /users/freelances` — Renommer route + pagination + filtres (skills, city, disponibilité) | `users.controller.ts`, `users.service.ts` | S |

### Phase 3.3 — Reviews

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-030** | Module Reviews: controller + service + module | `reviews/reviews.controller.ts`, `reviews/reviews.service.ts`, `reviews/reviews.module.ts` | M |
| **T-031** | `POST /reviews` — Créer un avis (validation: booking PAID/COMPLETED, 1 review par booking+author, dans les 14j) | `reviews.service.ts`, `dto/create-review.dto.ts` | M |
| **T-032** | `GET /reviews/user/:userId` — Lister les avis reçus par un user (avec pagination) | `reviews.service.ts`, `reviews.controller.ts` | S |
| **T-033** | `GET /reviews/booking/:bookingId` — Avis liés à un booking | `reviews.service.ts`, `reviews.controller.ts` | XS |
| **T-034** | Calcul note moyenne sur profil public (agrégation) | `users.service.ts` (profil public) | XS |

### Phase 3.4 — Messagerie

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-040** | Module Messaging: controller + service + module | `messaging/` | M |
| **T-041** | `GET /conversations` — Liste des conversations de l'utilisateur (dernier message, nb non-lus) | `messaging.service.ts`, `messaging.controller.ts` | M |
| **T-042** | `POST /conversations` — Créer ou retrouver une conversation avec un user (+ optional bookingId/missionId) | `messaging.service.ts`, `dto/create-conversation.dto.ts` | S |
| **T-043** | `GET /conversations/:id/messages` — Messages paginés d'une conversation | `messaging.service.ts`, `messaging.controller.ts` | S |
| **T-044** | `POST /conversations/:id/messages` — Envoyer un message | `messaging.service.ts`, `dto/send-message.dto.ts` | S |
| **T-045** | `PATCH /conversations/:id/read` — Marquer conversation comme lue | `messaging.service.ts` | XS |
| **T-046** | WebSocket Gateway: events `message:new`, `conversation:updated` | `messaging.gateway.ts` | M |
| **T-047** | Supprimer messaging Prisma direct du frontend (`apps/web/src/actions/messaging.ts`) | `messaging.ts` → appels API REST | S |

### Phase 3.5 — Notifications

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-050** | Notifications Controller: `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` | `notifications.controller.ts` | S |
| **T-051** | Fix ownership check + pagination sur `findAll` et `markAsRead` | `notifications.service.ts` | S |
| **T-052** | WebSocket Gateway: event `notification:new` | `notifications.gateway.ts` | S |
| **T-053** | Enrichir les in-app notifications avec actionUrl et relatedEntity | `notifications.service.ts`, tous les appelants | M |

### Phase 3.6 — Uploads / Storage

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-060** | Module Uploads: controller + service + module | `uploads/` | M |
| **T-061** | `POST /uploads` — Upload fichier (multer + validation type/taille) → storage local en dev | `uploads.controller.ts`, `uploads.service.ts` | M |
| **T-062** | `GET /uploads/:id/url` — URL signée (ou publique en dev) | `uploads.service.ts` | S |
| **T-063** | Intégration Cloudflare R2 (S3-compatible) pour production | `uploads.service.ts` | M |
| **T-064** | `PATCH /users/me/avatar` — Upload + mise à jour avatar profil | `users.controller.ts`, `uploads.service.ts` | S |

### Phase 3.7 — Paiements (Stripe Connect)

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-070** | Module Payments: controller + service + module + config Stripe | `payments/` | M |
| **T-071** | `POST /payments/connect/onboard` — Initier onboarding Stripe Connect pour freelance | `payments.service.ts` | M |
| **T-072** | `GET /payments/connect/status` — Vérifier statut onboarding Stripe | `payments.service.ts` | S |
| **T-073** | `POST /payments/checkout` — Créer session Stripe Checkout pour paiement booking | `payments.service.ts`, `dto/create-checkout.dto.ts` | L |
| **T-074** | `POST /payments/webhook` — Handler webhook Stripe (payment_intent.succeeded, etc.) | `payments.controller.ts`, `payments.service.ts` | L |
| **T-075** | Idempotence webhooks via StripeEvent | `payments.service.ts` | S |
| **T-076** | Calcul commission plateforme (15% par défaut) et split payment | `payments.service.ts`, `invoices.service.ts` | M |
| **T-077** | `GET /payments/dashboard` — Dashboard revenus freelance (agrégation par mois) | `payments.service.ts`, `payments.controller.ts` | M |

### Phase 3.8 — Améliorations missions & services

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-080** | Filtres avancés missions: métier, shift, skills, type structure, zipCode | `find-missions-query.dto.ts`, `missions.service.ts` | S |
| **T-081** | Notification à l'établissement quand un freelance postule | `missions.service.ts`, `notifications.service.ts` | S |
| **T-082** | Endpoint reject-candidature explicite (`POST /bookings/:id/reject`) | `bookings.controller.ts`, `bookings.service.ts` | S |
| **T-083** | `GET /services/mine` — Mes ateliers (freelance) | `services.controller.ts`, `services.service.ts` | S |
| **T-084** | `PATCH /services/:id` — Modifier un atelier | `services.controller.ts`, `services.service.ts`, `dto/update-service.dto.ts` | S |
| **T-085** | `DELETE /services/:id` — Archiver un atelier (soft delete → status ARCHIVED) | `services.controller.ts`, `services.service.ts` | XS |
| **T-086** | Filtres avancés services: catégorie, type, prix min/max, disponibilité | `dto/find-services-query.dto.ts`, `services.service.ts` | S |
| **T-087** | Gestion capacité ateliers: vérifier nb places restantes avant booking | `services.service.ts` | S |

### Phase 3.9 — Email transactionnel

| Ticket | Titre | Fichiers impactés | Effort |
|--------|-------|--------------------|--------|
| **T-090** | Module Email: service abstraction (Resend / Nodemailer) | `email/email.service.ts`, `email/email.module.ts` | M |
| **T-091** | Templates email: confirmation inscription, candidature reçue, booking confirmé, paiement reçu | `email/templates/` | M |
| **T-092** | Intégrer envoi email dans les flows existants (register, apply, confirm, complete, pay) | Tous services appelants | M |

### Ordre de build recommandé

```
Phase 3.0 (bugfixes)      ← IMMÉDIAT — corriger les crashes
    ↓
Phase 3.1 (fondations)    ← pagination + migrations schema
    ↓
Phase 3.2 (profil)        ← base pour reviews et profil public
    ↓
Phase 3.3 (reviews)       ← dépend de profil public
    ↓
Phase 3.4 (messagerie)    ← nouveau module + WebSocket
    ↓
Phase 3.5 (notifications) ← enrichir avec WebSocket
    ↓
Phase 3.6 (uploads)       ← pré-requis pour avatars et documents
    ↓
Phase 3.7 (paiements)     ← Stripe Connect — plus complexe
    ↓
Phase 3.8 (améliorations) ← polish missions + services
    ↓
Phase 3.9 (email)         ← dernier car non-bloquant UX
```

### Estimation par phase

| Phase | Tickets | Effort total estimé |
|-------|---------|---------------------|
| 3.0 Bugfixes | T-001 → T-006 | S (quelques heures) |
| 3.1 Fondations | T-010 → T-014 | M |
| 3.2 Profil | T-020 → T-024 | M |
| 3.3 Reviews | T-030 → T-034 | M |
| 3.4 Messagerie | T-040 → T-047 | L |
| 3.5 Notifications | T-050 → T-053 | M |
| 3.6 Uploads | T-060 → T-064 | L |
| 3.7 Paiements | T-070 → T-077 | XL |
| 3.8 Améliorations | T-080 → T-087 | M |
| 3.9 Email | T-090 → T-092 | M |

---

## E. API Contract

### E.0 — Conventions générales

**Base URL** : `{API_URL}/api`

**Headers communs** :
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Pagination standard** (tous les endpoints listing) :
```
Query: ?page=1&limit=20&sortBy=createdAt&sortOrder=desc
Response:
{
  "data": [...],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Erreur standard** :
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

### E.1 — Auth

#### `POST /auth/register`

Crée un compte utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "role": "FREELANCE"     // "FREELANCE" | "ESTABLISHMENT" (ADMIN interdit)
}
```

**Response 201** :
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "clxyz...",
    "email": "user@example.com",
    "role": "FREELANCE",
    "onboardingStep": 0
  }
}
```

**Erreurs** : 409 (email existant), 400 (validation)

#### `POST /auth/login`

**Body** :
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response 200** : Même shape que register.

**Erreurs** : 401 (credentials invalides), 403 (compte banni)

---

### E.2 — Users / Profil

#### `GET /users/me`

Retourne le profil complet de l'utilisateur connecté.

**Response 200** :
```json
{
  "id": "clxyz...",
  "email": "user@example.com",
  "role": "FREELANCE",
  "status": "VERIFIED",
  "onboardingStep": 4,
  "isAvailable": true,
  "stripeOnboarded": true,
  "profile": {
    "firstName": "Marie",
    "lastName": "Dupont",
    "bio": "Éducatrice spécialisée...",
    "avatar": "https://r2.../avatar.jpg",
    "jobTitle": "Éducatrice spécialisée",
    "phone": "+33612345678",
    "address": "12 rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "skills": ["autisme", "TDAH", "polyhandicap"],
    "companyName": null,
    "siret": "12345678901234",
    "experienceYears": 8,
    "diplomas": ["DEES", "DU Autisme"],
    "specializations": ["autisme", "TDAH"],
    "interventionZone": "Île-de-France",
    "hourlyRate": 35,
    "availabilityNote": "Disponible dès maintenant"
  }
}
```

#### `PATCH /users/me`

Met à jour le profil.

**Body** (tous les champs optionnels) :
```json
{
  "firstName": "Marie",
  "lastName": "Dupont",
  "bio": "...",
  "jobTitle": "...",
  "phone": "+33612345678",
  "address": "...",
  "city": "Paris",
  "zipCode": "75001",
  "skills": ["autisme", "TDAH"],
  "companyName": "Mon ESMS",
  "siret": "12345678901234",
  "isAvailable": true,
  "experienceYears": 8,
  "diplomas": ["DEES"],
  "specializations": ["autisme"],
  "interventionZone": "Île-de-France",
  "hourlyRate": 35,
  "availabilityNote": "Disponible dès maintenant"
}
```

**Response 200** : Profil complet mis à jour (même shape que GET).

#### `GET /users/:id/profile`

Profil public d'un freelance (visible par tous les utilisateurs authentifiés).

**Response 200** :
```json
{
  "id": "clxyz...",
  "role": "FREELANCE",
  "isAvailable": true,
  "profile": {
    "firstName": "Marie",
    "lastName": "D.",
    "bio": "...",
    "avatar": "...",
    "jobTitle": "Éducatrice spécialisée",
    "city": "Paris",
    "skills": ["autisme", "TDAH"],
    "experienceYears": 8,
    "diplomas": ["DEES"],
    "specializations": ["autisme"],
    "hourlyRate": 35,
    "availabilityNote": "Disponible"
  },
  "stats": {
    "completedMissions": 12,
    "completedWorkshops": 5,
    "averageRating": 4.7,
    "totalReviews": 14
  },
  "recentReviews": [
    {
      "id": "...",
      "rating": 5,
      "comment": "Excellente intervention",
      "type": "ESTABLISHMENT_TO_FREELANCE",
      "createdAt": "2025-03-01T..."
    }
  ]
}
```

#### `GET /users/freelances`

Liste publique des freelances vérifiés (marketplace).

**Query** : `?page=1&limit=20&skills=autisme,TDAH&city=Paris&available=true&sortBy=createdAt`

**Response 200** : `PaginatedResult<FreelanceListItem>`

---

### E.3 — Missions (SOS Renfort)

#### `POST /missions`

Crée une mission de renfort. **Rôle : ESTABLISHMENT**.

**Body** :
```json
{
  "title": "Renfort éducateur — IME Les Cèdres",
  "dateStart": "2025-04-01T08:00:00Z",
  "dateEnd": "2025-04-01T17:00:00Z",
  "hourlyRate": 30,
  "address": "12 rue des Lilas, 75020 Paris",
  "isRenfort": true,
  "metier": "Éducateur spécialisé",
  "shift": "JOUR",
  "city": "Paris",
  "zipCode": "75020",
  "slots": [
    { "date": "2025-04-01", "heureDebut": "08:00", "heureFin": "17:00" }
  ],
  "description": "Besoin urgent de renfort pour...",
  "establishmentType": "IME",
  "targetPublic": ["enfants", "autisme"],
  "unitSize": "12 places",
  "requiredSkills": ["autisme", "gestion de crise"],
  "diplomaRequired": true,
  "hasTransmissions": true,
  "transmissionTime": "08:00",
  "perks": ["repas fourni", "parking"],
  "exactAddress": "12 rue des Lilas, Bât B",
  "accessInstructions": "Sonner à l'interphone, code 1234"
}
```

**Response 201** : Mission créée avec `status: "OPEN"`.

#### `GET /missions`

Liste des missions ouvertes (matching board). **Rôle : FREELANCE**.

**Query** : `?page=1&limit=20&city=Paris&date=2025-04-01&metier=éducateur&shift=JOUR&skills=autisme`

**Response 200** : `PaginatedResult<Mission>` avec relation `establishment.profile`

#### `GET /missions/managed`

Missions gérées par l'établissement connecté. **Rôle : ESTABLISHMENT**.

**Query** : `?page=1&limit=20`

**Response 200** : `PaginatedResult<Mission>` avec `bookings[].freelance.profile` (candidatures).

#### `POST /missions/:missionId/apply`

Postuler à une mission. **Rôle : FREELANCE**.

**Body** :
```json
{
  "motivation": "Je suis spécialisé en autisme et disponible...",
  "proposedRate": 32
}
```

**Response 201** : Booking PENDING créé.

**Erreurs** : 404 (mission introuvable), 400 (mission pas OPEN), 409 (déjà postulé)

---

### E.4 — Services (Ateliers)

#### `POST /services`

Crée un atelier. **Rôle : FREELANCE**.

**Body** :
```json
{
  "title": "Atelier gestion des émotions",
  "description": "Atelier pratique de 2h...",
  "price": 250,
  "type": "WORKSHOP",
  "capacity": 12,
  "pricingType": "SESSION",
  "durationMinutes": 120,
  "category": "Gestion des émotions",
  "publicCible": ["enfants", "adolescents"],
  "materials": "Fourni par l'animateur",
  "objectives": "Développer les compétences socio-émotionnelles",
  "methodology": "Approche ludique et participative",
  "evaluation": "Grille d'observation pré/post",
  "slots": [
    { "date": "2025-04-15", "heureDebut": "14:00", "heureFin": "16:00" }
  ]
}
```

**Response 201** : Service créé.

#### `GET /services`

Catalogue d'ateliers.

**Query** : `?page=1&limit=20&category=émotions&type=WORKSHOP&priceMin=0&priceMax=500&sortBy=createdAt`

**Response 200** : `PaginatedResult<Service>` avec `owner.profile`

#### `GET /services/:id`

Fiche détaillée d'un atelier (+ avis).

**Response 200** :
```json
{
  "id": "...",
  "title": "Atelier gestion des émotions",
  "description": "...",
  "price": 250,
  "type": "WORKSHOP",
  "capacity": 12,
  "pricingType": "SESSION",
  "durationMinutes": 120,
  "category": "Gestion des émotions",
  "publicCible": ["enfants", "adolescents"],
  "materials": "...",
  "objectives": "...",
  "methodology": "...",
  "evaluation": "...",
  "slots": [...],
  "status": "ACTIVE",
  "owner": {
    "id": "...",
    "profile": {
      "firstName": "Marie",
      "lastName": "D.",
      "avatar": "...",
      "jobTitle": "Éducatrice spécialisée"
    }
  },
  "stats": {
    "totalBookings": 8,
    "averageRating": 4.5,
    "totalReviews": 6
  },
  "recentReviews": [...]
}
```

#### `GET /services/mine`

Ateliers du freelance connecté. **Rôle : FREELANCE**.

**Query** : `?page=1&limit=20&status=ACTIVE`

**Response 200** : `PaginatedResult<Service>` (avec compteurs bookings)

#### `PATCH /services/:id`

Modifier un atelier. **Rôle : FREELANCE** (owner uniquement).

**Body** : Tous les champs de `POST /services` en optionnel.

**Response 200** : Service mis à jour.

#### `DELETE /services/:id`

Archiver un atelier (soft delete). **Rôle : FREELANCE** (owner uniquement).

**Response 200** : `{ ok: true }`

#### `POST /services/:serviceId/book`

Réserver un atelier. **Rôle : ESTABLISHMENT**.

**Body** :
```json
{
  "date": "2025-04-15T14:00:00Z",
  "message": "Nous souhaiterions réserver pour notre équipe de 8 personnes",
  "nbParticipants": 8
}
```

**Response 201** :
- Si `pricingType = SESSION | PER_PARTICIPANT` → `{ booking: {...} }`
- Si `pricingType = QUOTE` → `{ booking: {...}, quote: {...} }`

**Erreurs** : 404 (service introuvable), 409 (demande déjà en cours), 400 (capacité dépassée)

---

### E.5 — Bookings

#### `GET /bookings`

Page "Mes réservations" — vue unifiée missions + ateliers.

**Response 200** :
```json
{
  "lines": [
    {
      "lineId": "clxyz...",
      "lineType": "MISSION",
      "date": "2025-04-01T08:00:00Z",
      "typeLabel": "Mission SOS",
      "interlocutor": "imecedres@example.com",
      "status": "CONFIRMED",
      "address": "12 rue des Lilas, 75020 Paris",
      "contactEmail": "imecedres@example.com",
      "relatedBookingId": "clxyz...",
      "invoiceUrl": null
    },
    {
      "lineId": "clxyz...",
      "lineType": "SERVICE_BOOKING",
      "date": "2025-04-15T14:00:00Z",
      "typeLabel": "Atelier",
      "interlocutor": "marie@freelance.com",
      "status": "PENDING",
      "address": "Adresse non renseignée",
      "contactEmail": "marie@freelance.com",
      "relatedBookingId": "clxyz...",
      "invoiceUrl": null
    }
  ],
  "nextStep": {
    "lineId": "clxyz...",
    "lineType": "MISSION",
    "date": "2025-04-01T08:00:00Z",
    "status": "CONFIRMED"
  }
}
```

#### `POST /bookings/confirm`

Confirmer un booking (accepter candidature). **Rôle : ESTABLISHMENT** (owner mission) ou **FREELANCE** (owner service).

**Body** :
```json
{ "bookingId": "clxyz..." }
```

**Response 200** : `{ ok: true }`

**Side effects** :
- Mission : status → ASSIGNED, autres candidatures → CANCELLED, crédits — 1
- Service : status → CONFIRMED, crédits — 1
- Notification envoyée au freelance

#### `POST /bookings/:id/reject`

Rejeter une candidature. **Rôle : ESTABLISHMENT** (owner mission).

**Body** :
```json
{ "reason": "Profil ne correspond pas aux besoins" }
```

**Response 200** : `{ ok: true }`

**Side effects** : Booking → CANCELLED, notification au freelance

#### `POST /bookings/complete`

Marquer un booking comme terminé. **Rôle : ESTABLISHMENT** (mission) ou **FREELANCE** (service owner).

**Body** :
```json
{ "bookingId": "clxyz..." }
```

**Response 200** : `{ ok: true }`

**Side effects** :
- Status → COMPLETED_AWAITING_PAYMENT
- Invoice créée (PENDING_PAYMENT) avec calcul montant correct
- Notification au freelance

#### `POST /bookings/authorize-payment`

Valider le paiement. **Rôle : ESTABLISHMENT**.

**Body** :
```json
{ "bookingId": "clxyz..." }
```

**Response 200** : `{ ok: true }`

**Side effects** :
- Booking → PAID, Invoice → PAID
- (Futur Stripe : déclenche le virement vers le freelance)
- Notification au freelance

#### `POST /bookings/cancel`

Annuler un booking/mission.

**Body** :
```json
{
  "lineId": "clxyz...",
  "lineType": "MISSION"
}
```

**Response 200** : `{ ok: true }`

#### `GET /bookings/:lineType/:lineId/details`

Détails d'un booking (adresse, contact).

**Response 200** :
```json
{
  "address": "12 rue des Lilas, 75020 Paris",
  "contactEmail": "imecedres@example.com"
}
```

---

### E.6 — Quotes (Devis)

#### `POST /quotes`

Créer un devis. **Rôle : FREELANCE** (appelant = freelanceId).

**Body** :
```json
{
  "establishmentId": "clxyz...",
  "freelanceId": "clxyz...",
  "amount": 500,
  "description": "Atelier sur mesure — 3h avec supports",
  "startDate": "2025-04-15",
  "endDate": "2025-04-15",
  "reliefMissionId": null
}
```

**Response 201** : Quote créé.

#### `GET /quotes`

Lister mes devis (en fonction du rôle).

**Query** : `?page=1&limit=20`

**Response 200** : `PaginatedResult<Quote>` avec relations freelance, establishment, service, booking.

#### `GET /quotes/:id`

Détail d'un devis.

#### `PATCH /quotes/:id`

Modifier un devis (montant, description). **Rôle : FREELANCE** (owner).

**Body** :
```json
{
  "amount": 600,
  "description": "Atelier sur mesure — 3h avec supports pédagogiques inclus"
}
```

**Erreurs** : 403 (pas le freelance), 400 (devis déjà traité)

#### `PATCH /quotes/:id/accept`

Accepter un devis. **Rôle : ESTABLISHMENT**.

**Response 200** : `{ quote: {...} }`

**Side effects** : Quote → ACCEPTED, Booking → CONFIRMED (ou créé si absent)

#### `PATCH /quotes/:id/reject`

Rejeter un devis. **Rôle : ESTABLISHMENT**.

**Response 200** : Quote mis à jour.

**Side effects** : Quote → REJECTED, Booking lié → CANCELLED

---

### E.7 — Reviews (Avis)

#### `POST /reviews`

Laisser un avis après une prestation.

**Body** :
```json
{
  "bookingId": "clxyz...",
  "rating": 5,
  "comment": "Intervention remarquable, je recommande",
  "type": "ESTABLISHMENT_TO_FREELANCE"
}
```

**Validations** :
- Booking doit être en status PAID ou COMPLETED
- L'auteur doit être partie prenante du booking
- Max 1 review par (bookingId + authorId)
- `type` doit correspondre au rôle de l'auteur
- `rating` : entier entre 1 et 5
- Délai max : 14 jours après passage en PAID

**Response 201** : Review créée.

**Erreurs** : 400 (validation), 403 (pas partie prenante), 409 (review déjà laissée)

#### `GET /reviews/user/:userId`

Avis reçus par un utilisateur.

**Query** : `?page=1&limit=10&type=ESTABLISHMENT_TO_FREELANCE`

**Response 200** : `PaginatedResult<Review>` avec `author.profile` (prénom, avatar).

#### `GET /reviews/booking/:bookingId`

Avis liés à un booking (0, 1 ou 2 reviews).

**Response 200** :
```json
{
  "reviews": [
    {
      "id": "...",
      "rating": 5,
      "comment": "...",
      "type": "ESTABLISHMENT_TO_FREELANCE",
      "author": { "firstName": "Dr. Martin", "avatar": "..." },
      "createdAt": "..."
    }
  ],
  "canReview": true,
  "reviewDeadline": "2025-04-15T00:00:00Z"
}
```

---

### E.8 — Messagerie

#### `GET /conversations`

Liste des conversations.

**Query** : `?page=1&limit=20`

**Response 200** :
```json
{
  "data": [
    {
      "id": "clxyz...",
      "participant": {
        "id": "...",
        "firstName": "Marie",
        "lastName": "D.",
        "avatar": "..."
      },
      "lastMessage": {
        "content": "Bonjour, je suis disponible pour...",
        "createdAt": "2025-03-15T10:30:00Z",
        "isOwn": false
      },
      "unreadCount": 2,
      "context": {
        "type": "MISSION",
        "title": "Renfort éducateur — IME Les Cèdres"
      }
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

#### `POST /conversations`

Créer ou retrouver une conversation avec un utilisateur.

**Body** :
```json
{
  "participantId": "clxyz...",
  "bookingId": "clxyz...",
  "missionId": null
}
```

**Response 200/201** : Conversation (existante ou créée).

#### `GET /conversations/:id/messages`

Messages paginés d'une conversation.

**Query** : `?page=1&limit=50`

**Response 200** :
```json
{
  "data": [
    {
      "id": "...",
      "content": "Bonjour, je suis disponible",
      "senderId": "clxyz...",
      "isOwn": true,
      "createdAt": "2025-03-15T10:30:00Z"
    }
  ],
  "meta": { "total": 24, "page": 1, "limit": 50, "totalPages": 1 }
}
```

#### `POST /conversations/:id/messages`

Envoyer un message.

**Body** :
```json
{
  "content": "Bonjour, je suis disponible pour votre mission"
}
```

**Response 201** : Message créé.

**Side effects** :
- WebSocket event `message:new` émis aux participants
- Notification in-app si destinataire hors ligne

#### `PATCH /conversations/:id/read`

Marquer conversation comme lue.

**Response 200** : `{ ok: true }`

---

### E.9 — Notifications

#### `GET /notifications`

Notifications de l'utilisateur connecté.

**Query** : `?page=1&limit=20&unreadOnly=true`

**Response 200** :
```json
{
  "data": [
    {
      "id": "...",
      "message": "Vous avez été recruté pour la mission...",
      "type": "SUCCESS",
      "isRead": false,
      "actionUrl": "/dashboard/bookings",
      "relatedEntityType": "BOOKING",
      "relatedEntityId": "clxyz...",
      "createdAt": "2025-03-15T10:30:00Z"
    }
  ],
  "meta": { "total": 8, "page": 1, "limit": 20, "totalPages": 1 },
  "unreadTotal": 3
}
```

#### `PATCH /notifications/:id/read`

Marquer une notification comme lue. **Ownership vérifié**.

**Response 200** : `{ ok: true }`

#### `POST /notifications/read-all`

Marquer toutes les notifications comme lues.

**Response 200** : `{ ok: true, count: 5 }`

---

### E.10 — Invoices (Facturation)

#### `GET /invoices`

Factures de l'utilisateur connecté.

**Query** : `?page=1&limit=20&status=PAID`

**Response 200** : `PaginatedResult<Invoice>` avec booking context (mission/service title, counterpart).

#### `GET /invoices/:id/download`

Télécharger une facture en PDF. **Ownership vérifié (S2 fix)**.

**Response 200** : `Content-Type: application/pdf`

---

### E.11 — Uploads

#### `POST /uploads`

Upload un fichier (multipart/form-data).

**Body** : `multipart/form-data` avec champs :
- `file` : le fichier (max 5MB images, 10MB documents)
- `type` : `"AVATAR"` | `"DOCUMENT"` | `"ATTESTATION"`

**Response 201** :
```json
{
  "id": "clxyz...",
  "url": "https://r2.../uploads/clxyz.jpg",
  "type": "AVATAR",
  "filename": "avatar.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 245000
}
```

**Erreurs** : 400 (type/taille invalide), 413 (fichier trop gros)

#### `PATCH /users/me/avatar`

Raccourci : upload + mise à jour avatar profil en une requête.

---

### E.12 — Payments (Stripe Connect)

#### `POST /payments/connect/onboard`

Initier l'onboarding Stripe Connect pour un freelance. **Rôle : FREELANCE**.

**Response 200** :
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

#### `GET /payments/connect/status`

Vérifier le statut de l'onboarding Stripe. **Rôle : FREELANCE**.

**Response 200** :
```json
{
  "onboarded": true,
  "chargesEnabled": true,
  "payoutsEnabled": true
}
```

#### `POST /payments/checkout`

Créer une session Stripe Checkout pour payer un booking. **Rôle : ESTABLISHMENT**.

**Body** :
```json
{
  "bookingId": "clxyz..."
}
```

**Response 200** :
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/..."
}
```

#### `POST /payments/webhook`

Handler webhook Stripe (pas d'auth JWT — verification signature Stripe).

**Events gérés** :
- `payment_intent.succeeded` → Booking PAID, Invoice PAID, split paiement
- `account.updated` → Mise à jour statut onboarding freelance

#### `GET /payments/dashboard`

Dashboard revenus freelance.

**Query** : `?period=6months`

**Response 200** :
```json
{
  "totalRevenue": 4250.00,
  "totalCommission": 637.50,
  "netRevenue": 3612.50,
  "monthlyBreakdown": [
    { "month": "2025-03", "revenue": 750, "commission": 112.50, "net": 637.50, "count": 3 },
    { "month": "2025-02", "revenue": 1200, "commission": 180, "net": 1020, "count": 5 }
  ],
  "pendingPayouts": 450.00
}
```

---

### E.13 — WebSocket Events

**Namespace** : `/ws`
**Auth** : `?token={accessToken}` query param

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ conversationId: string }` | Rejoindre la room d'une conversation |
| `leave` | `{ conversationId: string }` | Quitter la room |
| `typing` | `{ conversationId: string }` | Signal "en train d'écrire" |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ conversationId, message: Message }` | Nouveau message dans une conversation |
| `conversation:updated` | `{ conversationId, lastMessage, unreadCount }` | Mise à jour liste conversations |
| `notification:new` | `{ notification: Notification }` | Nouvelle notification |
| `typing` | `{ conversationId, userId }` | Un participant écrit |

---

### E.14 — Admin (existant — rappel)

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/admin/users` | Liste users (paginated) |
| `GET` | `/admin/users/:id` | Détail user |
| `POST` | `/admin/users/:id/verify` | Vérifier user |
| `POST` | `/admin/users/:id/ban` | Bannir user |
| `GET` | `/admin/missions` | Liste missions |
| `POST` | `/admin/missions/:id/delete` | Supprimer mission |
| `GET` | `/admin/services` | Liste services |
| `POST` | `/admin/services/:id/feature` | Toggle featured |
| `POST` | `/admin/services/:id/hide` | Toggle hidden |

---

## Fin du document

> **Prochaine étape** : Phase 3.0 — Corriger les bugs bloquants (T-001 à T-006) avant toute nouvelle fonctionnalité.
