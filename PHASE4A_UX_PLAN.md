# PHASE 4A — Plan d'exécution UX / Structure Frontend

> **Statut** : Plan verrouillé — ne pas implémenter avant validation de ce document.
> **Périmètre** : 2 piliers uniquement — **Renfort / Remplacement** + **Ateliers**
> **Vocabulaire** : FREELANCE / ESTABLISHMENT (jamais talent/client/candidat/formateur)
> **Contrainte** : Phase 3 backend gelée. Frontend à aligner sur les endpoints existants.

---

## Table des matières

1. [Priorisation des écrans V1](#1-priorisation-des-écrans-v1)
2. [User flows frontend finaux](#2-user-flows-frontend-finaux)
3. [Structure écran par écran — P0](#3-structure-écran-par-écran--p0)
4. [Mapping frontend ↔ backend](#4-mapping-frontend--backend)
5. [Ordre d'implémentation — Phase 4B](#5-ordre-dimplémentation--phase-4b)

---

## 1. Priorisation des écrans V1

### Légende
- **P0** = Indispensable — la plateforme est inutilisable sans cet écran
- **P1** = Important — crée de la valeur immédiate, nécessaire au cycle complet
- **P2** = Ensuite — améliore l'expérience, non bloquant pour le lancement

### Pilier Renfort / Remplacement

| Écran | Route | Rôle | Priorité | Justification |
|-------|-------|------|----------|---------------|
| Onboarding établissement | `/wizard` (ESTABLISHMENT) | ESTABLISHMENT | **P0** | Porte d'entrée obligatoire — bloque toute action sans profil |
| Onboarding freelance | `/wizard` (FREELANCE) | FREELANCE | **P0** | Idem — sans wizard le profil est vide et inopérable |
| Dashboard établissement | `/dashboard` | ESTABLISHMENT | **P0** | Hub central — KPIs, accès rapide publish/matches |
| Dashboard freelance | `/dashboard` | FREELANCE | **P0** | Hub central — missions actives, candidatures, revenus |
| Publication renfort | `RenfortModal` (multi-step) | ESTABLISHMENT | **P0** | Acte fondateur du pilier 1 |
| Board matching / candidatures | `/dashboard/renforts` | ESTABLISHMENT | **P0** | Core loop établissement : voir → accepter → confirmer |
| Job board missions | `/marketplace` | FREELANCE | **P0** | Core loop freelance : voir → candidater |
| Détail mission | `/marketplace/missions/[id]` | FREELANCE | **P0** | Sans cette page pas de candidature informée |
| Fiche freelance publique | `/freelances/[id]` | ESTABLISHMENT | **P1** | Permet à l'établissement d'évaluer avant confirmation |
| Reviews post-mission | Modal/page reviews | BOTH | **P1** | Boucle de qualité — nécessaire à la confiance |

### Pilier Ateliers

| Écran | Route | Rôle | Priorité | Justification |
|-------|-------|------|----------|---------------|
| Catalogue ateliers | `/marketplace` (tab Ateliers) | ESTABLISHMENT | **P0** | Découverte du pilier 2 |
| Fiche atelier | `/marketplace/services/[id]` | ESTABLISHMENT | **P0** | Détail + bouton réserver — converti ou non |
| Mes ateliers (freelance) | `/dashboard/ateliers` | FREELANCE | **P1** | Le freelance doit gérer ses propres ateliers |
| Créer un atelier | Modal / page création | FREELANCE | **P1** | Sans ça le catalogue est vide |

### Transversal

| Écran | Route | Rôle | Priorité | Justification |
|-------|-------|------|----------|---------------|
| Messagerie | `/dashboard/inbox` | BOTH | **P1** | Communication pré/post-mission — différenciateur clé |
| Mon profil / settings | `/dashboard/account` | BOTH | **P1** | Édition profil post-wizard — manque critique côté API |
| Revenus / statut paiement | `/dashboard/finance` | FREELANCE | **P2** | Utile mais paiement = manuel en V1, pas bloquant |
| Statut crédits / packs | `/dashboard/packs` | ESTABLISHMENT | **P2** | Crédits = manuel en V1, purchase simulée |
| Notifications | Drawer / badge | BOTH | **P2** | Aucun endpoint API aujourd'hui — backend manquant |
| Page légale / CGU | `/terms`, `/privacy` | — | **P2** | Contenu statique, pas bloquant tech |

### Bilan de priorisation

```
P0 (8 écrans/flows) → Lot 1 et 2 de Phase 4B
P1 (6 écrans/flows) → Lot 3 et 4 de Phase 4B
P2 (4 écrans/flows) → Lot 5 ou post-V1
```

---

## 2. User flows frontend finaux

> Pour chaque flow : objectif · écrans traversés · CTA principal · friction · états vides · états erreur · logique mobile

---

### Flow A — Établissement → créer un renfort

**Objectif** : Permettre à un directeur d'établissement de décrire son besoin de renfort en < 5 minutes et de recevoir des candidatures de freelances qualifiés.

**Déclencheur** : Clic sur « Publier un renfort » depuis le header, la sidebar, ou le dashboard empty state.

**Écrans traversés** :
1. `RenfortModal` — Step 1 : Métier recherché (select sectoriel)
2. `RenfortModal` — Step 2 : Planning (dates, shift, taux horaire)
3. `RenfortModal` — Step 3 : Contexte clinique (description, public, compétences)
4. `RenfortModal` — Step 4 : Logistique (adresse pré-remplie, accès, avantages)
5. `RenfortModal` — Step 5 : Récapitulatif + preview MissionCard
6. `→ /dashboard/renforts` : Mission visible avec badge "Ouverte"

**CTA principal** : « Publier le renfort » (corail, step 5)

**Variante urgence** (SOS Renfort)  
Déclenché par clic « SOS Renfort ». Formulaire condensé en 1 step (métier + date aujourd'hui/demain + créneau + taux pré-rempli +15%). Même `POST /missions` avec `isRenfort: true`.

**Frictions identifiées** :
- L'adresse n'est pré-remplie que si le wizard a correctement persisté le profil (bug P3 — à corriger dans lot 1)
- Aucun brouillon : abandon à step 3 = perte totale → mitiger avec `sessionStorage`
- Sur mobile : multi-step dans Dialog = UX cassée → remplacer par `Sheet` bottom-up

**États vides** :
- Premier renfort : empty state proéminent avec illustration et CTA « Publier un renfort »
- Aucun résultat après publication : patience state « En attente de candidatures — votre annonce est visible »

**États erreur** :
- Date dans le passé → erreur inline champ date, focus auto
- Taux horaire = 0 → erreur inline, blocage passage step suivant
- `POST /missions` 500 → toast destructive + bouton retry actif (modale reste ouverte)
- `POST /missions` 400 → parse les erreurs de validation, revenir au step concerné
- Profil sans adresse → alert step 4, lien `/dashboard/account`

**Logique mobile** :
- `Sheet` bottom-up plein écran au lieu de `Dialog`
- Navigation step : barre de progression (pas stepper horizontal)
- Step 3 (contexte clinique) : accordion pour les champs avancés par défaut fermés
- CTA toujours visible en bas (sticky footer dans le Sheet)

---

### Flow B — Freelance → voir une mission → candidater

**Objectif** : Permettre à un freelance de trouver une mission adaptée à son profil et de postuler en < 2 clics.

**Déclencheur** : Arrivée sur `/marketplace` (onglet Missions), ou notification, ou lien direct.

**Écrans traversés** :
1. `/marketplace` (onglet Missions) → `MissionCard` grid avec filtres
2. Clic card → `/marketplace/missions/[id]` (détail mission)
3. Clic « Postuler » → `ApplyModal` (message optionnel + confirmation)
4. Confirmation → retour `/marketplace` ou `/dashboard` avec toast succès + badge « Candidature envoyée » sur la card

**CTA principal** : « Postuler » (teal, page détail mission)

**Frictions identifiées** :
- Manque endpoint `GET /missions/:id` public (détail) — aujourd'hui seul `GET /missions` liste existe → déduire détail depuis la liste ou ajouter endpoint
- Pas de filtre par métier ni compétences → limitation actuelle de `FindMissionsQueryDto`
- Profil PENDING → le freelance peut postuler mais l'établissement voit un badge « Profil non vérifié »

**États vides** :
- Aucune mission : « Aucune mission disponible — vérifiez vos filtres ou revenez plus tard » + bouton reset filtres
- Filtres trop restrictifs : « 0 résultat — essayez sans filtre de shift » (suggestion intelligente)
- Déjà postulé : bouton « Postuler » remplacé par badge « Candidature envoyée »

**États erreur** :
- `POST /missions/:id/apply` 409 (déjà appliqué) → toast info « Vous avez déjà postulé »
- Mission CLOSED → badge « Mission pourvue », bouton Postuler masqué
- API timeout → toast retry
- Profil incomplet → modale warning avec checklist des manques + lien `/dashboard/account`

**Logique mobile** :
- Grid 1 colonne sur mobile
- Filtres dans un Sheet collapsible (bouton « Filtres » avec badge count)
- Détail mission : page plein écran (pas panel latéral)
- `ApplyModal` → `Sheet` bottom-up

---

### Flow C — Établissement → confirmer → compléter une mission

**Objectif** : Permettre à l'établissement d'accepter un candidat, de gérer la mission et de la marquer comme complète pour déclencher la facturation.

**Déclencheur** : Notification « Nouvelle candidature » ou visite de `/dashboard/renforts`.

**Écrans traversés** :
1. `/dashboard/renforts` → Board par mission, liste de candidatures
2. Clic candidature → `CandidateCard` expandable (nom, métier, note, disponibilités)
3. Clic « Voir le profil » → `/freelances/[id]` (fiche complète, reviews, missions passées)
4. Clic « Confirmer » → modal confirmation (débit 1 crédit) → `POST /bookings/confirm`
5. Mission passe en `ASSIGNED` → board se rafraîchit
6. Date de mission passée → bouton « Marquer comme complétée » apparaît sur la card
7. Clic → modal confirmation bilatérale → `POST /bookings/complete`
8. Mission `COMPLETED_AWAITING_PAYMENT` → bouton « Valider le paiement » → `POST /bookings/authorize-payment`
9. Téléchargement facture → `GET /invoices/:id/pdf`

**CTA principal** : « Confirmer le freelance » (corail) + « Marquer comme complétée » (secondary)

**Frictions identifiées** :
- L'établissement peut avoir 0 crédit au moment de confirmer → blocker critique → afficher solde + lien achat avant action
- Pas de rejection dédiée : seule la `cancel` est disponible côté API → UX à adapter (« Décliner » = cancel)
- Complétion unilatérale : seul l'établissement complète → manque confirmation freelance → simuler en V1
- `COMPLETED_AWAITING_PAYMENT` → `authorize-payment` : pas de Stripe = juste changement de statut DB

**États vides** :
- Aucune candidature sur une mission : « En attente de candidatures » avec progress indicator
- Mission confirmée sans action due : état neutre « Mission en cours — rendez-vous le [date] »

**États erreur** :
- 0 crédit lors confirm → modal blocante : « Crédits insuffisants — achetez un pack pour continuer » + CTA vers `/dashboard/packs`
- `POST /bookings/confirm` 400/500 → toast destructive + retry
- Mission déjà assignée (race condition) → message « Cette mission a déjà été pourvue »
- Freelance a annulé → candidature disparaît du board, notification

**Logique mobile** :
- Board `/dashboard/renforts` : stack vertical de cards mission
- `CandidateCard` → drawer full-screen sur mobile
- Actions confirm/décliner → boutons sticky en bas du drawer

---

### Flow D — Review post-mission

**Objectif** : Déclencher et collecter des avis bilatéraux (ESTABLISHMENT→FREELANCE et FREELANCE→ESTABLISHMENT) dans les 72h suivant la complétion.

**Déclencheur** :
- Mission passe en `COMPLETED_AWAITING_PAYMENT` ou `COMPLETED`
- Notification push/email J+0 et rappel J+2

**Écrans traversés** :
1. Notification → deep link vers `/dashboard` avec `ReviewModal` auto-ouverte
2. `ReviewModal` Step 1 : Note globale (1-5 étoiles)
3. `ReviewModal` Step 2 : Note par critères (ponctualité, compétence, communication pour freelance ; organisation, clarté besoin, accueil pour établissement)
4. `ReviewModal` Step 3 : Commentaire libre (optionnel, max 500 chars)
5. Confirmation → `POST /reviews` (endpoint à créer — mocked en V1)
6. Dashboard : badge « Avis envoyé » sur la mission complétée

**CTA principal** : « Laisser un avis » (teal)

**Frictions identifiées** :
- Backend reviews inexistant (F14/F15/F16 Phase 3) → **mocker le POST en local** avec toast succès
- La fenêtre de review doit expirer à 7 jours → signaler dans l'UI « Plus que X jours pour noter »
- Si l'une des deux parties ne note pas → ne pas bloquer l'autre

**États vides** :
- Aucun avis à donner : rien affiché (pas d'état vide explicite)
- Mission sans avis reçu : « Pas encore d'avis — les avis apparaîtront ici une fois laissés »

**États erreur** :
- `POST /reviews` en erreur → toast retry
- Fenêtre expirée (> 7j) → bouton désactivé + message « La période pour noter est terminée »

**Logique mobile** :
- `ReviewModal` → `Sheet` bottom-up
- Étoiles : large touch targets (min 44px)

---

### Flow E — Freelance → catalogue ateliers → réserver

**Objectif** : Permettre à un établissement de découvrir les ateliers proposés par les freelances et d'en faire la demande de réservation.

> Note : la réservation d'atelier se fait côté **ESTABLISHMENT** (qui réserve pour son établissement), pas côté freelance.

**Déclencheur** : Onglet « Ateliers » dans le marketplace ou sidebar.

**Écrans traversés** :
1. `/marketplace` (onglet Ateliers) → `ServiceCard` grid
2. Filtres : catégorie (autisme, TDAH, gestion crise, bien-être…), format (présentiel/distanciel/hybride), durée, tarif
3. Clic card → `/marketplace/services/[id]` (fiche atelier)
4. Fiche : description, programme, durée, tarif, format, info freelance, reviews associées
5. Clic « Demander une réservation » → `BookServiceModal` (date souhaitée, message, nombre de participants)
6. `POST /services/:id/book` → statut `QUOTE_PENDING`
7. Confirmation → dashboard établissement, section « Mes réservations »

**CTA principal** : « Demander une réservation » (corail, fiche atelier)

**Frictions identifiées** :
- `GET /services` : pas de filtre par catégorie → à mocker côté front avec filtre client
- Reviews ateliers : `GET /services/:id` ne charge pas les reviews → manque backend
- Capacité : pas de gestion nb places restantes → masquer en V1

**États vides** :
- Catalogue vide : « Aucun atelier disponible pour le moment » + CTA si FREELANCE : « Créer votre premier atelier »
- Catalogue filtré 0 résultats : reset filtres CTA

**États erreur** :
- `POST /services/:id/book` 409 (déjà réservé) → « Vous avez déjà une demande en cours pour cet atelier »
- API error → toast retry

**Logique mobile** :
- Grid 1 colonne
- Fiche atelier : page plein écran
- `BookServiceModal` → `Sheet`

---

### Flow F — Freelance → Mes ateliers (créer + gérer)

**Objectif** : Permettre au freelance de créer ses ateliers et de gérer les demandes de réservation reçues.

**Déclencheur** : Onglet « Mes ateliers » dans `/dashboard/ateliers`.

**Écrans traversés** :
1. `/dashboard/ateliers` → liste des ateliers créés par le freelance
2. Clic « Créer un atelier » → `CreateServiceModal` (titre, description, durée, tarif, format, catégorie, places max)
3. `POST /services` → atelier créé
4. Card atelier → expand : voir les demandes de réservation reçues
5. Action sur réservation : Accepter (`POST /bookings/confirm`) / Décliner (`POST /bookings/cancel`)
6. Onglet « Réservations entrantes » : vue dédiée des demandes

**CTA principal** : « Créer un atelier » (teal, empty state)

**Frictions identifiées** :
- `/dashboard/ateliers` actuel : page existe mais aucun endpoint `GET /services/mine` → **bloquant** — endpoint à ajouter OU filtrer `/services` par `createdById` côté front si l'info est disponible
- Pas de statut DRAFT/PUBLISHED → en V1 tout est publié à la création
- Gestion réservations : via `/bookings` mais pas de filtre dédié ateliers

**États vides** :
- Aucun atelier créé : empty state avec illustration + CTA « Créer votre premier atelier »
- Atelier sans réservation : « Aucune demande pour le moment »

**États erreur** :
- `POST /services` 400 → erreurs inline
- Upload image atelier échoue → toast, l'atelier est créé sans image

**Logique mobile** :
- Stack vertical
- `CreateServiceModal` → `Sheet` plein écran

---

### Flow G — Messagerie

**Objectif** : Permettre la communication directe entre un établissement et un freelance dans le contexte d'une mission ou d'un atelier.

**Architecture cible V1 (sans WebSocket)** : polling toutes les 10s via `GET /messages?conversationId=xxx`. Temps réel différé.

**Déclencheur** :
- Clic « Envoyer un message » depuis une `CandidateCard` ou `MissionCard`
- Clic « Contacter le freelance » depuis `/freelances/[id]`
- Onglet « Messagerie » dans la sidebar → `/dashboard/inbox`

**Écrans traversés** :
1. `/dashboard/inbox` → split layout : liste conversations (gauche) + thread actif (droite)
2. Clic conversation → affichage messages chronologiques avec scroll to bottom
3. Input bas de page → envoi message → `POST /messages`
4. Polling → nouveaux messages apparaissent
5. Badge non-lu dans sidebar se met à jour

**CTA principal** : « Envoyer » (bouton teal, dans l'input)

**Frictions identifiées** :
- **Backend messaging inexistant** (F17/F18 — architecture plate `DirectMessage`) — toute la messagerie est **mockée** en V1 via actions Next.js avec Prisma direct (sécurité S8) → **remplacer par mocked state en mémoire** pour V1 front, backend à câbler en Phase 5
- Pas de modèle `Conversation` → difficile de grouper par interlocuteur

**États vides** :
- Aucune conversation : empty state « Pas encore de message — contactez un freelance depuis une mission »
- Thread sélectionné vide : impossible (une conversation démarre toujours avec un message)

**États erreur** :
- Message > limite chars → erreur inline compteur
- Envoi échoué → toast retry + message grisé en attente

**Logique mobile** :
- Mobile : liste conversations = plein écran, clic → push vers thread full-screen, bouton retour
- Pas de split layout sur mobile
- Clavier virtuel → le thread scroll automatiquement

---

### Flow H — Onboarding (établissement et freelance)

**Objectif** : Amener l'utilisateur à compléter son profil de base en < 6 minutes pour accéder aux fonctionnalités core.

**Établissement** :
1. `/register?role=ESTABLISHMENT` → `POST /auth/register`
2. `/wizard` step 1 : Établissement (nom, type, SIRET)
3. `/wizard` step 2 : Référent (prénom, nom, fonction, téléphone)
4. `/wizard` step 3 : Localisation (adresse, ville, CP)
5. `/wizard` step 4 : Récapitulatif → `PATCH /users/me/onboarding` (endpoint à corriger)
6. Redirect `/dashboard` avec empty state proéminent

**Freelance** :
1. `/register?role=FREELANCE` → `POST /auth/register`
2. `/wizard` step 1 : Identité (prénom, nom, métier)
3. `/wizard` step 2 : Professionnel (bio, compétences, diplômes)
4. `/wizard` step 3 : Disponibilités (ville, zone, taux horaire indicatif)
5. `/wizard` step 4 : Récapitulatif + éventuellement SIRET
6. Redirect `/marketplace` (job board) avec bandeau PENDING

**CTA principal** : « Continuer » (step) + « Valider mon profil » (step final)

**Frictions identifiées** :
- Bug critique : `updateOnboardingStep` n'écrit que le step dans User, pas les données dans Profile → les données wizard sont silencieusement perdues → **fix P0**
- Pas de persistence entre sessions (abandon wizard) → reprendre depuis `user.onboardingStep` au prochain login
- Validation côté front inexistante par step → users peuvent sauter avec champs vides

**États vides** :
- N/A — wizard est toujours pré-initialisé

**États erreur** :
- Email déjà pris → alert inline + lien se connecter
- Step soumis avec champ requis vide → highlight champ + message
- SIRET invalide (format) → validation Luhn côté front
- API `PATCH /users/me/onboarding` erreur → toast + retry possible sur le même step

**Logique mobile** :
- Wizard plein écran
- Stepper vertical compact ou texte « Étape 2 sur 4 »
- Bouton Continuer sticky en bas

---

## 3. Structure écran par écran — P0

---

### E.1 — Dashboard ESTABLISHMENT (`/dashboard`)

**Objectif** : Hub de pilotage — état actuel des missions, alertes, crédits, et accès rapide aux actions critiques.

**Contenu prioritaire** (ordre d'affichage) :
1. Bandeau alerte si 0 crédit (rouge subtil)
2. KPI row : missions actives | candidatures en attente | crédits disponibles | missions complétées
3. Section « À traiter maintenant » : candidatures non-répondues (badge rouge N)
4. Section « Missions en cours » : missions ASSIGNED avec date proche
5. Widget « Ateliers réservés » : prochains ateliers
6. Empty state si 0 mission : illustration + titre + CTA proéminent

**Composants** :
- `EstablishmentKpiGrid` (existant — à câbler correctement)
- `MissionsToValidateWidget` (existant)
- `UpcomingMissionsWidget` (existant)
- `CreditsWidget` (existant)
- `EmptyState` avec CTA « Publier un renfort »

**CTA principal** : « Publier un renfort » (corail, permanent dans header + empty state)
**CTA secondaires** :
- « SOS Renfort » (orange, header uniquement)
- « Découvrir les ateliers » (link, empty state secondaire)

**Données backend nécessaires** :
- `GET /bookings` → missions actives + candidatures
- `GET /credits` → solde crédits (actuel : action front)
- `GET /bookings` → upcoming missions (`ASSIGNED` avec date > now)

**États** :
- Loading : skeleton sur chaque widget (pas de spinner global)
- Vide complet (0 missions, 0 bookings) : empty state 2 colonnes avec illustration
- Erreur API : chaque widget indépendant → widget en erreur affiche « Impossible de charger — Réessayer »

**Responsive** :
- Desktop : bento grid 2-3 colonnes
- Tablette : 2 colonnes
- Mobile : stack vertical, KPI en grid 2×2

---

### E.2 — Dashboard FREELANCE (`/dashboard`)

**Objectif** : Vue centrée sur les opportunités actives et les revenus — le freelance veut savoir « j'ai quoi maintenant ».

**Contenu prioritaire** :
1. Bandeau PENDING si profil non vérifié (info, pas bloquant)
2. KPI row : missions en cours | candidatures en attente | revenus du mois | note moyenne
3. Section « Prochaine mission » : prochaine mission ASSIGNED (date, établissement, infos)
4. Section « Mes candidatures » : liste courte (5 max) des candidatures récentes
5. Section « Missions recommandées » : 3 missions OPEN matchant le profil
6. Empty state si 0 candidature

**Composants** :
- `FreelanceKpiGrid` (existant — à câbler)
- `NextMissionCard` (existant)
- `MatchingMissionsWidget` (existant — feed depuis `/marketplace`)
- `EmptyState`

**CTA principal** : « Voir les missions » (teal, permanent dans header + empty state)
**CTA secondaires** :
- « Voir mes ateliers »
- « Compléter mon profil » (si PENDING)

**Données backend nécessaires** :
- `GET /bookings` → candidatures + missions ASSIGNED
- `GET /missions` → 3 missions recommandées (filtre: métier du profil)
- `GET /users/me` → profil + statut (endpoint manquant → mocker depuis JWT)

**États** :
- Loading : skeletons
- Vide (nouvellement inscrit) : empty state « Votre espace est prêt — trouvez votre première mission »
- PENDING : bandeau info non-bloquant persistant

**Responsive** :
- Desktop : bento 2x2 + sidebar feed missions
- Mobile : stack vertical, KPI 2×2, missions = carousel horizontal

---

### E.3 — Onboarding Wizard ESTABLISHMENT (`/wizard`)

**Objectif** : Collecter les informations essentielles de l'établissement pour que la publication de renforts soit pré-remplie et fiable.

**Contenu par step** :
- Step 1 : Nom établissement + Type (IME, MECS, FAM, EHPAD, SSIAD, MAS, ITEP, Autre) + SIRET
- Step 2 : Référent (prénom, nom, fonction, téléphone)
- Step 3 : Localisation (adresse, ville, CP)
- Step 4 : Récapitulatif (toutes données, bouton « Valider »)

**Composants** :
- `OnboardingWizard` (existant, à corriger)
- `StepIndicator` horizontal (desktop) / `ProgressBar` + label (mobile)
- Inputs validés avec `react-hook-form` + `zod`
- `Select` pour type établissement

**CTA principal** : « Continuer » (corail, chaque step) + « Valider mon profil » (step final)

**Données backend** :
- `POST /auth/register` → création compte
- `PATCH /users/me/onboarding` (step + données profile) — endpoint à corriger
- Au load wizard : `GET /users/me` pour reprendre depuis `onboardingStep` sauvegardé

**États** :
- Loading submit : bouton disabled + spinner inline
- Vide (premier visit) : champs vides, hints placeholders
- Reprise (onboardingStep > 0) : champs pré-remplis depuis les données déjà soumises
- Erreur validation : highlight champ + message d'erreur contextuel
- Erreur API : toast + bouton retry actif

**Responsive** :
- Desktop : centré `max-w-lg`, padding généreux
- Mobile : plein écran, stepper compact, bouton sticky bottom

---

### E.4 — Onboarding Wizard FREELANCE (`/wizard`)

**Contenu par step** :
- Step 1 : Prénom, nom, métier (select sectoriel étendu), téléphone
- Step 2 : Bio (300 chars), compétences (multi-select tags : autisme, TDAH, polyhandicap, violence, déficience intellectuelle…), diplômes (select multiple)
- Step 3 : Ville, zone d'intervention (rayon en km ou liste départements), taux horaire indicatif (€/h), disponibilité immédiate (toggle)
- Step 4 : SIRET (optionnel, skippable) + récapitulatif

**Composants** :
- `FreelanceFlow` (existant, à corriger)
- `TagInput` multi-select pour compétences
- `Slider` ou `NumberInput` pour taux horaire et rayon

**CTA principal** : « Continuer » + « Valider mon profil »

**Données backend** :
- `PATCH /users/me/onboarding` — même correction
- `GET /users/me` pour reprise

**États** : identiques à E.3

---

### E.5 — Board Matching / Candidatures (`/dashboard/renforts`)

**Objectif** : Permettre à l'établissement de gérer toutes ses missions OPEN/ASSIGNED et d'agir sur les candidatures reçues.

**Contenu** :
1. Header : titre + bouton « Publier un renfort »
2. Tabs : « En cours » (OPEN + ASSIGNED) | « Complétées » (COMPLETED) | « Annulées »
3. Pour chaque mission : `MissionCard` expandable
   - En-tête : métier, dates, shift, badge statut
   - Body (expanded) : liste `CandidateCard` avec name, métier, ville, note, CTA
   - Candidature sans réponse : triée en premier
4. `CandidateCard` actions :
   - « Voir le profil » → `/freelances/[id]`
   - « Confirmer » → modal confirmation crédit
   - « Décliner » → `POST /bookings/cancel` (inline toast)
5. Mission ASSIGNED : bouton « Marquer comme complétée » visible si date passée

**Composants** :
- `GlassCard` / `MissionCard` (existant)
- `CandidateCard` (existant)
- `Badge` statut
- `Tabs` component
- Modal confirmation crédit (à créer)

**CTA principal** : « Confirmer » (corail, sur `CandidateCard`)

**Données backend** :
- `GET /missions/managed` → missions de l'établissement avec candidatures
- `POST /bookings/confirm` → confirmer candidature
- `POST /bookings/cancel` → décliner candidature
- `POST /bookings/complete` → complétion mission

**États** :
- Loading : skeletons mission cards
- Aucune mission ouverte : empty state + CTA « Publier un renfort »
- Mission sans candidature : patience state dans le body expandé
- 0 crédit lors de confirm : modal blocante (voir Flow C)

**Responsive** :
- Desktop : cards full-width, expand au clic pour voir candidatures
- Mobile : stack vertical, expand = accordion, `CandidateCard` actions en drawer bottom

---

### E.6 — Job Board Missions (`/marketplace` — onglet Missions)

**Objectif** : Feed filtrable de missions OPEN pour le freelance.

**Contenu** :
1. Header filtres : ville, date, métier, shift (Jour/Nuit/Coupé), taux min
2. `MissionCard` grid : métier, dates, shift, taux, ville, établissement (anonymisé ou non), badge SOS si urgent
3. Pagination basique (load more) ou virtualisée
4. Scroll-to-top sticky si > 6 missions

**Composants** :
- `MissionCard` (à créer ou adapter)
- `FilterBar` + `FilterSheet` mobile
- `Badge` (SOS, statut)
- `EmptyState`

**CTA principal** : « Postuler » (dans la card ou sur la page détail)

**Données backend** :
- `GET /missions` avec filtres `city`, `date`, (métier à ajouter en Phase 5)
- En V1 : filtres métier/shift = côté client (filtre du tableau retourné)

**États** :
- Loading : skeleton cards (4 à 6)
- Vide (0 missions) : empty state avec reset filtres
- Filtres actifs : badge count sur bouton « Filtres »

**Responsive** :
- Desktop : 2-3 colonnes
- Mobile : 1 colonne, filtres dans Sheet

---

### E.7 — Détail Mission (`/marketplace/missions/[id]`)

**Objectif** : Donner au freelance toutes les informations pour décider de candidater.

> Note : Cet écran n'existe pas encore (route à créer). Aujourd'hui la mission est consultée depuis la liste sans page dédiée.

**Contenu** :
1. Header : métier (badge) + shift + badge SOS si urgent
2. Établissement : type, ville (pas d'adresse complète avant confirmation)
3. Planning : dates, créneaux, durée estimée
4. Taux horaire (en gras)
5. Contexte clinique : description, public cible, compétences requises
6. Logistique : avantages (repas, parking…), transmissions, accès
7. CTA : « Postuler » ou « Candidature envoyée » (disabled)
8. Lien retour « ← Toutes les missions »

**Composants** :
- `GlassCard` sections
- `Badge` métier + shift + urgence
- `Button` primaire + secondaire
- `ApplyModal` pour le flow de candidature

**CTA principal** : « Postuler » (teal)

**Données backend** :
- Local : mission passée via route params depuis la liste (ou state Zustand)
- Idéalement : `GET /missions/:id` (endpoint à ajouter — mineure — en Phase 5)
- En V1 : récupérer depuis `GET /missions` et filtrer par id côté client

**États** :
- Loading : skeleton
- Mission CLOSED : banner « Mission pourvue » + bouton désactivé
- Déjà postulé : bouton remplacé par badge

**Responsive** :
- Desktop : 2 colonnes (info gauche + CTA sticky droite)
- Mobile : stack vertical, CTA sticky en bas de page

---

### E.8 — Catalogue Ateliers + Fiche (`/marketplace` onglet Ateliers + `/marketplace/services/[id]`)

**Catalogue** :
- Grid de `ServiceCard` : titre, freelance, thème, durée, tarif, format (présentiel/distanciel), note
- Filtres : thème/catégorie (client-side en V1), format, tarif max
- CTA : « Voir le détail »

**Fiche atelier** :
- Image de couverture (ou placeholder)
- Titre + freelance (lien `/freelances/[id]`)
- Description + programme détaillé
- Public cible, format, durée, tarif, places max
- Reviews (mockées en V1 — backend manquant)
- CTA : « Demander une réservation » → `BookServiceModal`

**Données backend** :
- `GET /services` → catalogue
- `GET /services/:id` → fiche détail
- `POST /services/:id/book` → réservation

**Responsive** :
- Catalogue : 2-3 colonnes desktop / 1 colonne mobile
- Fiche : page plein écran, image hero, sticky CTA

---

## 4. Mapping frontend ↔ backend

### Légende
- ✅ **Branchable** = endpoint disponible, données correctes, pas de mock nécessaire
- ⚠️ **Branchable partiel** = endpoint existe mais manque (filtres, champs, données liées)
- 🔶 **À mocker** = endpoint inexistant, simuler en front
- 🔧 **Ajustement API nécessaire** = modification mineure côté API pour débloquer le front

---

### Pilier Renfort

| Écran / Action | Endpoint | État | Notes |
|----------------|----------|------|-------|
| Register établissement | `POST /auth/register` | ✅ | OK |
| Register freelance | `POST /auth/register` | ✅ | OK |
| Login | `POST /auth/login` | ✅ | OK |
| Wizard — persister données | `PATCH /users/me/onboarding` | 🔧 | **Bug critique** : n'écrit que `onboardingStep`, pas les données Profile. Fix requis avant tout. |
| Reprendre wizard | `GET /users/me` | 🔧 | Endpoint inexistant → à ajouter. En attendant : données du JWT (incomplet) |
| Dashboard KPIs | `GET /bookings` | ⚠️ | Données disponibles mais agrégation KPI à faire côté front |
| Solde crédits | Action front `getCredits()` | 🔶 | Pas d'endpoint API — lecture directe Prisma dans l'action → sécurité S8. À déplacer vers `GET /users/me` |
| Publier renfort (classique) | `POST /missions` | ✅ | OK — validation métier côté front à renforcer |
| Publier SOS renfort | `POST /missions` avec `isRenfort: true` | ✅ | OK — flag existe dans le schema |
| Missions de l'établissement | `GET /missions/managed` | ✅ | OK |
| Job board missions (freelance) | `GET /missions` | ⚠️ | Filtres limités à `city` + `date`. Filtre métier/shift = côté client en V1 |
| Détail mission | `GET /missions/:id` | 🔧 | Endpoint inexistant → à ajouter (1 ligne controller). En V1 : filtrer depuis liste |
| Candidater à une mission | `POST /missions/:id/apply` | ✅ | OK |
| Voir candidatures reçues | `GET /missions/managed` (inclut bookings) | ✅ | OK — bookings inclus dans la réponse managed |
| Confirmer un freelance | `POST /bookings/confirm` | ✅ | OK — vérifier gestion 0 crédit |
| Décliner un freelance | `POST /bookings/cancel` | ⚠️ | Pas d'endpoint `reject` dédié — cancel = même résultat. Message UX à adapter |
| Voir profil freelance public | `GET /users/freelances/:id` | 🔶 | Endpoint inexistant. En V1 : mocker avec données de la candidature |
| Marquer mission complète | `POST /bookings/complete` | ✅ | OK — vérifier bug B6 (montant quote) |
| Valider paiement | `POST /bookings/authorize-payment` | ✅ | OK — sans Stripe = changement statut DB |
| Télécharger facture | `GET /invoices/:id/pdf` | ⚠️ | Existe mais noms erronés (bug B4). PDF généré mais informatif. |

### Pilier Ateliers

| Écran / Action | Endpoint | État | Notes |
|----------------|----------|------|-------|
| Catalogue ateliers | `GET /services` | ✅ | OK — filtres catégorie côté client en V1 |
| Fiche atelier | `GET /services/:id` | ✅ | OK — reviews non inclus |
| Reviews fiche atelier | — | 🔶 | Backend inexistant — afficher placeholder « Avis bientôt disponibles » |
| Réserver un atelier | `POST /services/:id/book` | ✅ | OK |
| Mes ateliers (freelance — liste) | — | 🔶 | **Endpoint inexistant** `GET /services/mine`. En V1 : filtrer `GET /services` côté client par `createdBy.id === userId` si la réponse inclut le créateur |
| Créer un atelier | `POST /services` | ✅ | OK |
| Modifier un atelier | `PATCH /services/:id` | 🔶 | Endpoint inexistant — masquer édition en V1 |

### Transversal

| Écran / Action | Endpoint | État | Notes |
|----------------|----------|------|-------|
| Messagerie — liste conversations | — | 🔶 | **Architecture cassée** (S8) + pas d'endpoint. Mocker avec état local en V1 |
| Messagerie — envoi message | — | 🔶 | Idem — mocker |
| Notifications — liste | — | 🔶 | Aucun endpoint `GET /notifications`. Mocker avec 0 notifications + badge 0 |
| Notifications — marquer lu | — | 🔶 | Idem |
| Mon profil — consulter | `GET /users/me` | 🔧 | Endpoint inexistant — ajouter (priorité haute) |
| Mon profil — modifier | `PATCH /users/me` | 🔧 | Endpoint inexistant — ajouter |
| Reviews — donner un avis | `POST /reviews` | 🔶 | Endpoint inexistant — mocker avec toast succès |
| Reviews — voir les avis | `GET /users/:id/reviews` | 🔶 | Endpoint inexistant — placeholder |
| Achat crédits / packs | Action front simulée | 🔶 | Pas d'endpoint API ni Stripe. Simuler en V1 |

### Ce qui est vraiment branchable aujourd'hui (sans ajustement)
1. Auth (register, login, logout)
2. Publication renfort `POST /missions`
3. Job board `GET /missions` (limité)
4. Candidature `POST /missions/:id/apply`
5. Missions gérées `GET /missions/managed`
6. Confirm/Complete/Authorize `POST /bookings/*`
7. Catalogue ateliers `GET /services` + `GET /services/:id`
8. Réservation atelier `POST /services/:id/book`
9. `GET /bookings` (page données)

### Ce qui doit être ajouté côté API (ajustements mineurs — phase 5 ou hot fix)
| Priorité | Endpoint | Coût estimé |
|----------|----------|-------------|
| 🔴 CRITIQUE | Corriger `PATCH /users/me/onboarding` pour écrire dans Profile | < 1h |
| 🔴 CRITIQUE | `GET /users/me` (profil complet) | < 2h |
| 🟠 HAUTE | `PATCH /users/me` (édition profil) | < 2h |
| 🟡 MOYENNE | `GET /missions/:id` (détail mission) | < 30min |
| 🟡 MOYENNE | Filtres métier/shift sur `GET /missions` | < 1h |
| 🟡 MOYENNE | `GET /services` avec filtre `createdBy` | < 30min |
| 🟢 BASSE | `GET /notifications` + `PATCH /notifications/:id/read` | < 3h (module manquant) |
| 🟢 BASSE | `POST /reviews` CRUD complet | < 4h (module manquant) |

---

## 5. Ordre d'implémentation — Phase 4B

### Lot 1 — Fondations critiques (déblocage)

**Objectif** : Corriger les bugs bloquants et câbler les fondations sans lesquelles aucun autre écran ne fonctionne.

**Écrans concernés** :
- Wizard établissement + freelance (correction persistance)
- Profil utilisateur (GET/PATCH /users/me)

**Tâches** :
1. Fix `PATCH /users/me/onboarding` — écriture dans Profile (correction bug wizard)
2. Ajouter `GET /users/me` + `PATCH /users/me` dans users controller
3. Corriger `OnboardingWizard` côté front : validation par step (zod), `PATCH` correct à chaque step
4. Validation step-by-step avec react-hook-form + zod dans `ClientFlow` et `FreelanceFlow`
5. Persistance sessionStorage des données wizard (anti-perte sur refresh)

**Dépendances** : aucune — peut démarrer immédiatement

**Définition de done** :
- Un établissement peut compléter le wizard en 4 steps, fermer le navigateur, revenir et reprendre là où il en était
- Les données sont réellement stockées dans Profile (vérifiable via GET /users/me)
- Chaque step bloque la progression si un champ requis est vide

---

### Lot 2 — Core loop établissement (Renfort)

**Objectif** : Permettre le cycle complet Publier → Matcher → Confirmer côté établissement.

**Écrans concernés** :
- Dashboard ESTABLISHMENT
- `RenfortModal` (publication classique + SOS)
- `/dashboard/renforts` (board matching)

**Tâches** :
1. Dashboard ESTABLISHMENT : câbler KPIs depuis `GET /bookings` + `getCredits`, empty state, skeletons
2. `RenfortModal` : ajouter step 5 récapitulatif + preview `MissionCard`, pré-remplissage depuis session/profil, mode urgence (SOS) distinct
3. Sheet mobile pour `RenfortModal` (remplacer Dialog sur mobile)
4. `/dashboard/renforts` : tabs En cours/Complétées/Annulées, `CandidateCard` actions + modal confirmation crédit 0
5. Gestion état 0 crédit : modal blocante avec CTA packs

**Dépendances** : Lot 1 (profil + wizard)

**Définition de done** :
- Un établissement peut publier un renfort en < 5 min (classique) et < 2 min (SOS)
- Le board matching montre les candidatures reçues avec actions fonctionnelles
- La confirmation d'un freelance est bloquée si 0 crédit avec message explicite

---

### Lot 3 — Core loop freelance (Missions)

**Objectif** : Permettre au freelance de trouver des missions et de candidater.

**Écrans concernés** :
- Dashboard FREELANCE
- `/marketplace` (onglet Missions / job board)
- `/marketplace/missions/[id]` (détail mission — écran à créer)

**Tâches** :
1. Dashboard FREELANCE : KPIs depuis `GET /bookings`, bandeau PENDING si statut PENDING, empty state + CTA
2. Job board : filtres (ville, dates, métier/shift côté client), `MissionCard` avec badge SOS, pagination
3. Écran détail mission `/marketplace/missions/[id]` : création, données depuis liste (client-side), `ApplyModal`
4. `ApplyModal` : message optionnel, confirmation, `POST /missions/:id/apply`, état déjà postulé
5. Filtres mobile dans Sheet collapsible avec badge count

**Dépendances** : Lot 1

**Définition de done** :
- Un freelance peut voir toutes les missions OPEN et les filtrer
- Il peut consulter le détail d'une mission sans page supplémentaire (ou avec une page dédiée)
- Il peut postuler en < 2 clics
- L'état « déjà postulé » est correctement affiché

---

### Lot 4 — Pilier Ateliers complet

**Objectif** : Rendre le pilier ateliers utilisable de bout en bout des deux côtés.

**Écrans concernés** :
- Catalogue + fiche atelier (`/marketplace/services/[id]`) — finalisation
- `BookServiceModal` (réservation atelier)
- `/dashboard/ateliers` — Mes ateliers freelance
- `CreateServiceModal` — création atelier

**Tâches** :
1. Catalogue : filtres catégorie/format côté client, `ServiceCard` avec note placeholder, `BookServiceModal` fonctionnel
2. Fiche atelier : sections complètes, placeholder reviews (« Avis bientôt disponibles »), CTA réservation
3. `/dashboard/ateliers` : câbler `GET /services` filtré par créateur, liste mes ateliers, gestion réservations entrantes
4. `CreateServiceModal` : `POST /services`, validation, preview
5. Ajout filtre `createdBy` côté API (ajustement mineur)

**Dépendances** : Lot 1 (profil), Lot 3 (composants partagés)

**Définition de done** :
- Un établissement peut consulter le catalogue, lire une fiche, et faire une demande de réservation
- Un freelance peut créer un atelier et voir les demandes reçues
- Les réservations sont visibles dans le board bookings existant

---

### Lot 5 — Messagerie V1 + Fiche freelance publique

**Objectif** : Activer la communication et donner aux établissements la visibilité sur les profils freelances.

**Écrans concernés** :
- `/dashboard/inbox` (messagerie)
- `/freelances/[id]` (profil public)

**Tâches** :
1. `/dashboard/inbox` : remplacer Prisma direct par état local mocké, conversation list, thread UI fonctionnel (UI only, pas de persistence)
2. Préparer les interfaces et types pour branchement API messaging en Phase 5
3. `/freelances/[id]` : page profil public avec bio, compétences, missions complétées (depuis bookings), placeholder reviews, action « Contacter »
4. `GET /users/me` pour données profil (lot 1) → page `/dashboard/account` édition profil

**Dépendances** : Lot 1, Lot 2, Lot 3

**Définition de done** :
- La messagerie V1 est visuelle (envoyer/recevoir dans la session) sans persistance — acceptable pour lancement
- Le profil public freelance affiche les données essentielles
- L'édition de profil fonctionne via `PATCH /users/me`

---

### Lot 6 — Reviews + Paiement manuel + Notifications

**Objectif** : Compléter la boucle de qualité et clarifier le statut financier.

**Écrans concernés** :
- `ReviewModal` post-mission (bilatéral)
- `/dashboard/finance` (revenus freelance)
- Badge notifications (sidebar)

**Tâches** :
1. `ReviewModal` : UI complète (étoiles, critères, commentaire), `POST /reviews` mocké → toast succès
2. Déclencher `ReviewModal` depuis dashboard quand mission COMPLETED
3. `/dashboard/finance` : tableau revenus depuis bookings COMPLETED, statut paiement manuel
4. Badge notifications : état local mocké (0 notifications), prêt pour branchement API Phase 5

**Dépendances** : Lots 2 + 3

**Définition de done** :
- Le flow review s'ouvre automatiquement après complétion de mission
- La page finance affiche les missions payées avec montants
- Le badge notification est présent et prêt à recevoir des données réelles

---

### Récapitulatif des lots

| Lot | Priorité | Écrans | Dépendances | Durée estimée |
|-----|----------|--------|-------------|---------------|
| 1 — Fondations | 🔴 P0 | Wizard ESTABLISHMENT + FREELANCE, profil | Aucune | Sprint 1 |
| 2 — Core établissement | 🔴 P0 | Dashboard ESTABLISHMENT, RenfortModal, Board renforts | Lot 1 | Sprint 1 |
| 3 — Core freelance | 🔴 P0 | Dashboard FREELANCE, Job board, Détail mission | Lot 1 | Sprint 2 |
| 4 — Ateliers | 🟠 P1 | Catalogue, Fiche, Mes ateliers, Créer atelier | Lots 1+3 | Sprint 2 |
| 5 — Messagerie + Profil | 🟡 P1 | Inbox, Profil public, Édition profil | Lots 1+2+3 | Sprint 3 |
| 6 — Reviews + Finance | 🟢 P1-P2 | ReviewModal, Finance, Notifications | Lots 2+3 | Sprint 3 |

---

## Annexe — Conventions de nommage et règles transversales

### Vocabulaire UI obligatoire
| ❌ Interdit | ✅ Obligatoire |
|------------|---------------|
| Talent | FREELANCE / Freelance |
| Client | ESTABLISHMENT / Établissement |
| Candidat | Freelance (dans le contexte matching) |
| Offre | Renfort (pilier 1) / Atelier (pilier 2) |
| Booking | Mission (côté freelance) / Renfort (côté établissement) |

### Règles responsive obligatoires
- Breakpoints : `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px
- Toute modale devient `Sheet` bottom-up sur mobile (`< lg`)
- Tout grid desktop devient stack vertical sur mobile
- CTA primaires : minimum 44px height sur mobile (touch target)
- Filtres : panel sidebar desktop → Sheet collapsible mobile
- Sidebars : masquées sur mobile, remplacées par une bottom navigation

### Règles états vides
- Tout état vide contient : illustration SVG + titre H3 + sous-titre descriptif + CTA primaire
- Pas de message générique « Aucun résultat » sans contexte
- Les empty states sont role-aware (différent pour ESTABLISHMENT vs FREELANCE)

### Règles états loading
- Skeletons : toujours préférer les skeletons aux spinners globaux
- Niveau de skeleton : card-level (pas page-level) sauf première charge
- Durée max avant message d'erreur automatique : 10s

### Règles états erreur
- Erreurs API 5xx : toast destructive + bouton retry visible
- Erreurs API 4xx : message inline contextualisé (jamais un toast seul)
- Erreurs réseau : banner persistant en haut de page « Impossible de se connecter »
- Jamais un écran blanc sans message d'erreur catchable

### Contraintes sécurité frontend
- Les Server Actions Next.js ne doivent jamais appeler Prisma directement (sécurité S8) — toutes les mutations passent par l'API NestJS
- Les tokens ne sont jamais stockés dans `localStorage` (XSS) — cookie httpOnly via session
- Les données sensibles (SIRET, adresse complète) ne sont pas exposées côté FREELANCE sans relation confirmée
