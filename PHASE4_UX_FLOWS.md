# PHASE 4 — UX Flows fonctionnels

> **Périmètre** : 2 piliers — Renfort/Remplacement + Ateliers.
> **Vocabulaire** : « renfort » côté établissement, « mission » côté freelance. FREELANCE / ESTABLISHMENT.
> **Pas de vivier, pas de RH complexe.**

---

## Table des matières

1. [Établissement → inscription → premier renfort publié](#flow-1--établissement--inscription--premier-renfort-publié)
2. [Freelance → inscription → profil vérifié → première mission vue](#flow-2--freelance--inscription--profil-vérifié--première-mission-vue)
3. [Publication renfort classique](#flow-3--publication-renfort-classique)
4. [Publication renfort urgence](#flow-4--publication-renfort-urgence)
5. [Matching candidats](#flow-5--matching-candidats)
6. [Candidature freelance](#flow-6--candidature-freelance)
7. [Confirmation mission](#flow-7--confirmation-mission)
8. [Complétion + facturation](#flow-8--complétion--facturation)
9. [Feedback / review](#flow-9--feedback--review)
10. [Découverte catalogue ateliers](#flow-10--découverte-catalogue-ateliers)
11. [Réservation / demande atelier](#flow-11--réservation--demande-atelier)
12. [Page "Mes ateliers"](#flow-12--page-mes-ateliers)
13. [Messaging](#flow-13--messaging)
14. [Documents / vérification](#flow-14--documents--vérification)

---

## Flow 1 — Établissement → inscription → premier renfort publié

### Objectif
Amener un directeur d'établissement de l'arrivée sur la plateforme à la publication de son premier besoin de renfort en **moins de 8 minutes**.

### Déclencheur
L'établissement arrive via lien (bouche-à-oreille, recherche, email partenaire) sur `/register?role=ESTABLISHMENT`.

### Étapes exactes

| # | Écran | Action utilisateur | Système |
|---|-------|-------------------|---------|
| 1 | `/register` | Sélectionne "Je recrute des renforts" (pré-sélectionné si `?role=ESTABLISHMENT`). Saisit email + mot de passe. Clique **Créer mon compte**. | Crée le User (role=ESTABLISHMENT, status=PENDING, onboardingStep=0). Crée la session. Redirige vers `/wizard`. |
| 2 | `/wizard` step 1 | Saisit : nom de l'établissement, type (IME, MECS, FAM, EHPAD…), SIRET. | Écrit dans Profile (companyName, establishmentType, siret). onboardingStep → 1. |
| 3 | `/wizard` step 2 | Saisit : prénom, nom, fonction (directeur, chef de service…), téléphone. | Écrit dans Profile (firstName, lastName, jobTitle, phone). onboardingStep → 2. |
| 4 | `/wizard` step 3 | Saisit : adresse complète (rue, ville, CP). | Écrit dans Profile (address, city, zipCode). onboardingStep → 3. |
| 5 | `/wizard` step 4 — Confirmation | Récapitulatif des infos. Clique **Valider et accéder à mon espace**. | onboardingStep → 4. Redirige vers `/dashboard`. |
| 6 | `/dashboard` | Voit le dashboard ESTABLISHMENT avec un **empty state proéminent** : "Publiez votre premier besoin de renfort". CTA corail : **Publier un renfort**. | Dashboard affiche 0 missions, 0 crédits, checklist trust incomplète. |
| 7 | `RenfortModal` step 1 | Sélectionne le métier recherché (éducateur spé, AES, moniteur éducateur, IDE, AS…). | Pré-charge les options depuis `sos-config.ts`. |
| 8 | `RenfortModal` step 2 | Saisit dates (début/fin ou créneaux), shift (Jour/Nuit), taux horaire. | Validation : dateStart dans le futur, dateEnd > dateStart, hourlyRate > 0. |
| 9 | `RenfortModal` step 3 | Saisit contexte clinique : description, public cible, taille d'unité, compétences requises. | Champs optionnels mais encouragés (jauge de complétude). |
| 10 | `RenfortModal` step 4 | Confirme adresse (pré-remplie depuis profil), instructions d'accès, avantages (repas, parking…). | Pré-remplit depuis Profile.address. |
| 11 | `RenfortModal` — Récap | Résumé complet du renfort. Clique **Publier**. | `POST /missions`. Mission créée status=OPEN. Toast succès. Modale se ferme. Dashboard se rafraîchit. |

### Friction actuelle probable
- **Wizard ne persiste pas dans Profile** : `updateOnboardingStep` n'écrit que `onboardingStep` dans User, les données formulaire sont silencieusement perdues (voir bug Phase 3 — users.service.ts).
- **Pas de validation côté wizard** : body non typé, pas de DTO, pas de class-validator. L'utilisateur peut soumettre des steps vides.
- **Dashboard empty state faible** : pas de CTA clair vers la publication de renfort — l'utilisateur doit deviner qu'il faut cliquer "Publier" dans le header ou la sidebar.
- **RenfortModal = 4 steps dans une modale** : sur mobile, c'est un formulaire multi-step dans un `Dialog` (pas un `Sheet`). Risque de scroll bloqué, modale trop petite.
- **Pas de crédits initiaux** : après publication, l'établissement ne pourra pas confirmer un candidat car il a 0 crédits. Pas de guidance vers l'achat.

### Logique cible

```
register → wizard (4 steps, données persistées dans Profile)
  → dashboard (empty state avec CTA proéminent)
    → RenfortModal (4 steps, validation chaque step)
      → Mission publiée
        → Redirect ou highlight vers la mission dans /dashboard/renforts
```

**Changements clés :**
- Wizard step data doit être persistée dans Profile via `PATCH /users/me/onboarding` (avec vraie écriture dans Profile).
- Dashboard empty state : illustration + titre + sous-titre + CTA primaire "Publier un renfort" + CTA secondaire "Découvrir le catalogue ateliers".
- Après publication, afficher un **interstitiel de succès** (pas juste un toast) : "Votre renfort est en ligne ! Les freelances peuvent maintenant postuler." + lien vers `/dashboard/renforts`.
- Offrir 1 crédit gratuit à l'inscription pour que le premier cycle soit complet sans friction de paiement.

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Register | Split 45/55 (brand panel + form) | Form plein écran, brand panel masqué |
| Wizard | Centré max-w-lg, stepper horizontal | Plein écran, stepper vertical compact en haut |
| Dashboard empty state | Bento card 2-col avec illustration | Stack vertical, illustration réduite |
| RenfortModal | Dialog centré 640px max | **Sheet bottom-up plein écran** (pas Dialog) |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Dashboard — aucune mission | "Vous n'avez pas encore publié de renfort. Commencez par décrire votre besoin." | **Publier un renfort** |
| Dashboard — aucun crédit | "Vous avez 0 crédit. Achetez un pack pour confirmer vos premiers candidats." | **Voir les packs** |
| /dashboard/renforts — vide | "Aucun renfort en cours. Publiez un besoin pour recevoir des candidatures." | **Publier un renfort** |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Email déjà pris (409) | Alert inline sous le formulaire : "Cette adresse email est déjà utilisée." | Lien "Se connecter" |
| Wizard step — champ manquant | Highlight champ + message sous le champ | Focus sur le premier champ en erreur |
| RenfortModal — dateStart passée | Alert : "La date de début doit être dans le futur." | Focus sur le champ date |
| RenfortModal — API error (500) | Toast destructive : "Impossible de publier. Réessayez." | Bouton visible reste actif pour retry |
| Session expirée | Redirect `/login` avec toast "Session expirée, reconnectez-vous." | — |

### CTA principal
**"Publier un renfort"** — bouton corail, visible dans : header (desktop), mobile bottom nav, dashboard empty state, sidebar.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Time to first publish | Temps entre register et première mission OPEN | < 8 min |
| Onboarding completion rate | % utilisateurs qui finissent le wizard | > 80% |
| First-session publish rate | % nouveaux établissements qui publient dans la première session | > 50% |

### Risques / Edge cases
- **Abandon wizard** : Si l'utilisateur quitte à step 2, il revient à step 2 (grâce à onboardingStep persisté). Mais si les données step 1 n'ont pas été sauvegardées, il voit des champs vides.
- **Multi-onglets** : Si l'utilisateur ouvre wizard dans 2 onglets et soumet step 1 dans les deux → race condition sur onboardingStep. Solution : le wizard fetch l'état courant au mount.
- **SIRET invalide** : Pas de validation Luhn côté front ni back. Risque de données corrompues.
- **Refresh pendant RenfortModal** : État multi-step dans Zustand (renfortStep) est perdu. Solution : soit conserver dans sessionStorage, soit accept la perte et restart à step 1.

---

## Flow 2 — Freelance → inscription → profil vérifié → première mission vue

### Objectif
Amener un freelance du médico-social de l'inscription à la vue de sa première mission disponible en **moins de 6 minutes**, avec un profil suffisamment complété pour postuler.

### Déclencheur
Le freelance arrive via lien sur `/register` ou `/register?role=FREELANCE`.

### Étapes exactes

| # | Écran | Action utilisateur | Système |
|---|-------|-------------------|---------|
| 1 | `/register` | Sélectionne "Je cherche des missions". Saisit email + mot de passe. Clique **Créer mon compte**. | Crée User (role=FREELANCE, status=PENDING, onboardingStep=0). Session. Redirige `/wizard`. |
| 2 | `/wizard` step 1 | Saisit : prénom, nom, métier (select parmi liste secteur). | Écrit dans Profile (firstName, lastName, jobTitle). onboardingStep → 1. |
| 3 | `/wizard` step 2 | Saisit : bio courte (max 300 chars), compétences (tags multi-select : autisme, TDAH, polyhandicap, gestion de crise…), diplômes (tags). | Écrit dans Profile (bio, skills, diplomas). onboardingStep → 2. |
| 4 | `/wizard` step 3 | Saisit : ville, zone d'intervention (rayon ou départements), disponibilités (toggle "Disponible immédiatement"), taux horaire indicatif. | Écrit dans Profile (city, interventionZone, hourlyRate). User.isAvailable → true. onboardingStep → 3. |
| 5 | `/wizard` step 4 | Upload photo de profil (optionnel) + SIRET (auto-entrepreneur) ou N° ADELI/RPPS. Récapitulatif. Clique **Valider**. | onboardingStep → 4. Upload via `POST /uploads`. Redirige `/marketplace`. |
| 6 | `/marketplace` | Voit le **Job Board** : liste des missions OPEN filtrables par ville, date, métier, shift. | `GET /missions` avec filtres. |
| 7 | `/marketplace` — 1ère mission | Clique sur une `MissionCard`. Voit le détail (métier, dates, taux, description, établissement). CTA : **Postuler**. | Si profil incomplet (status=PENDING, pas vérifié par admin), afficher warning "Votre profil est en attente de vérification — vous pouvez postuler mais votre candidature sera visible une fois vérifié." |

### Friction actuelle probable
- **`FreelanceFlow` dans wizard** : le composant `FreelanceFlow.tsx` existe mais le wizard `OnboardingWizard.tsx` dispatch vers `ClientFlow` ou `FreelanceFlow` selon le rôle. Les données ne sont pas persistées (même bug que Flow 1).
- **Pas de page profil éditable** : après le wizard, le freelance ne peut pas modifier ses infos (pas de `GET/PATCH /users/me`).
- **Pas d'upload avatar** : le champ existe dans Profile mais aucun module upload backend.
- **Job board sans filtre avancé** : `FreelanceJobBoard` appelle `GET /missions` mais les filtres sont limités à `city` et `date`. Pas de filtre métier, compétences, shift.
- **Vérification = manuelle par admin** : le freelance reste PENDING jusqu'à ce qu'un admin le passe en VERIFIED via `/admin/users/:id/verify`. Aucune indication de timeline côté freelance.

### Logique cible

```
register → wizard (4 steps, données persistées, avatar upload)
  → /marketplace (job board avec filtres riches)
    → Clic mission → détail en sheet/page
      → Postuler
```

**Changements clés :**
- Wizard freelance : step 4 upload avatar via `POST /uploads` + preview immédiate.
- Après onboarding, rediriger vers `/marketplace` (pas `/dashboard`) pour que le freelance voie immédiatement des missions.
- Afficher un **bandeau** en haut du dashboard tant que le profil est PENDING : "Profil en cours de vérification — Vous pouvez consulter les missions et postuler."
- Job board : filtres étendus (métier, shift, compétences, distance) côté API.

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Register | Split 45/55 | Form plein écran |
| Wizard | Centré, stepper horizontal | Plein écran, stepper compact |
| Marketplace/Job board | Grid 2-3 colonnes, filtres en sidebar | Stack vertical, filtres en Sheet collapsible |
| Mission détail | Panel latéral ou page dédiée | Page plein écran |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Job board — 0 missions | "Aucune mission disponible pour le moment. Ajustez vos filtres ou revenez bientôt." | **Modifier les filtres** / **Activer les alertes** (futur) |
| Job board — filtres trop restrictifs | "0 résultat avec ces filtres." + suggestion "Essayez sans filtre de shift" | **Réinitialiser les filtres** |
| Dashboard freelance — 0 candidatures | "Vous n'avez pas encore postulé. Découvrez les missions disponibles." | **Voir les missions** |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Email déjà pris | Alert inline | Lien "Se connecter" |
| Upload avatar échoue (413) | Toast : "Image trop grande (max 5 Mo)." | L'utilisateur peut ré-uploader |
| Missions API timeout | Toast : "Impossible de charger les missions." + bouton Retry | Retry visible |
| Profil incomplet → tentative de postuler | Warning modale : "Complétez votre profil avant de postuler (manque : diplôme, ville)." | Lien vers `/account` ou wizard step manquant |

### CTA principal
**"Voir les missions"** — bouton teal, visible dans : sidebar, dashboard empty state, header mobile.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Time to first view | Temps entre register et première mission consultée | < 6 min |
| Onboarding completion rate | % freelances wizard terminé | > 85% |
| First-session apply rate | % freelances qui postulent dans la 1ère session | > 30% |
| Profile completeness | Score moyen (0-100) des profils à J+1 | > 70% |

### Risques / Edge cases
- **Freelance sans SIRET** : auto-entrepreneurs en cours d'immatriculation. Permettre de sauter le champ SIRET mais l'exiger avant la première facturation.
- **Vérification longue** : si l'admin met 48h à vérifier, le freelance a déjà postulé à 5 missions mais aucune candidature visible par l'établissement → frustration. Solution : les candidatures sont visibles mais avec un badge "Profil en attente de vérification".
- **Zone géographique** : un freelance à Marseille ne doit pas voir les missions parisiennes en premier. Tri par pertinence géo par défaut.

---

## Flow 3 — Publication renfort classique

### Objectif
Permettre à un établissement de publier un besoin de renfort planifié (> 24h à l'avance) avec toutes les informations nécessaires pour recevoir des candidatures qualifiées.

### Déclencheur
Clic sur **Publier un renfort** depuis : header, sidebar, dashboard CTA, `/dashboard/renforts` CTA.

### Étapes exactes

| # | Écran/Composant | Action | Système |
|---|----------------|--------|---------|
| 1 | `RenfortModal` s'ouvre | — | Zustand : `isRenfortModalOpen → true`, `renfortStep → 0`. |
| 2 | Step 1 — Métier | Sélectionne le métier dans une liste sectorielle (éducateur spé, AES, moniteur éducateur, IDE, AS, psychologue, chef de service…). Option "Autre" avec champ libre. | Stocké localement dans le state de la modale. |
| 3 | Step 2 — Planning | Date de début, date de fin (ou créneau unique). Shift : Jour / Nuit / Coupé. Taux horaire proposé (€/h). | Validation : dates dans le futur, cohérence début < fin, taux > 0. Pour renfort classique : `isRenfort = false` (par défaut). |
| 4 | Step 3 — Contexte clinique | Description libre du besoin. Type d'établissement (pré-rempli depuis profil). Public cible (multi-select : enfants, ados, adultes, PA, PH…). Taille d'unité. Compétences requises (tags). Diplôme requis (toggle, default true). | Tous les champs sont optionnels sauf description. Jauge de complétude visuelle ("80% complet — les annonces complètes reçoivent 3x plus de candidatures"). |
| 5 | Step 4 — Logistique | Adresse (pré-remplie profil). Instructions d'accès. Transmissions (toggle + horaire si oui). Avantages (checkboxes : repas, parking, vestiaire, café…). | Pré-remplissage depuis Profile.address. |
| 6 | Step 5 — Récapitulatif | Vue résumé de toutes les infos. Bouton **Publier le renfort**. | Affichage lecture seule. Possibilité de revenir à chaque step (navigation libre). |
| 7 | Confirmation | — | `POST /missions`. Toast succès. Modale se ferme. `/dashboard/renforts` se rafraîchit. Mission visible avec badge "Ouverte". |

### Friction actuelle probable
- **`RenfortModal` existant** : Le composant existe avec 4 steps dans Zustand, mais les données de chaque step ne sont pas validées côté front avant passage au step suivant.
- **Pas de brouillon** : si l'utilisateur quitte à step 3, tout est perdu. Pas de `status=DRAFT` côté mission.
- **Pas de pré-remplissage** : l'adresse et le type d'établissement ne sont pas pré-remplis depuis le profil car le profil n'est pas correctement peuplé (bug wizard).
- **Pas de prévisualisation** : l'utilisateur ne voit pas à quoi ressemblera son annonce vue par les freelances.

### Logique cible

```
Clic "Publier un renfort"
  → RenfortModal (5 steps, validation par step, pré-remplissage profil)
    → Step 5 = preview façon "MissionCard"
      → Publier
        → Succès : interstitiel + redirect /dashboard/renforts
```

**Changements clés :**
- Ajout du step 5 "Récapitulatif" avec preview visuelle identique à ce que verra le freelance (MissionCard).
- Pré-remplissage depuis la session/profil : adresse, type établissement, nom.
- Jauge de complétude pour encourager les champs optionnels.
- Sauvegarde sessionStorage des données partielles pour survivre à un refresh.

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Modal | `Dialog` centré, 640px max-w | `Sheet` bottom-up plein écran |
| Navigation steps | Stepper horizontal en haut | Barre de progression + "Step 2/5" |
| Récapitulatif | 2 colonnes (infos + preview card) | Stack vertical |

### États vides
N/A — ce flow est toujours initié par action utilisateur.

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Date passée | Erreur inline sous le champ date | Correction immédiate |
| Taux horaire = 0 | "Le taux horaire doit être supérieur à 0" | — |
| API error 500 | Toast destructive + bouton Publier reste actif | Retry |
| API error 400 (validation) | Afficher les erreurs champ par champ, revenir au step concerné | Auto-navigation vers le step en erreur |
| Profil incomplet (pas d'adresse) | Alerte step 4 : "Complétez d'abord votre adresse dans les paramètres." | Lien vers `/account` |

### CTA principal
**"Publier le renfort"** — bouton corail, step final récapitulatif.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Publication completion rate | % de modales ouvertes qui aboutissent à une publication | > 70% |
| Abandonment step | Step auquel le plus d'utilisateurs quittent | Monitorer |
| Profile completeness of published missions | Score moyen de complétude des annonces | > 75% |
| Time to first candidature | Temps entre publication et première candidature reçue | < 24h |

### Risques / Edge cases
- **Modale refresh** : données perdues. Mitigation : sessionStorage.
- **Double publication** : clic rapide double sur le bouton "Publier". Mitigation : disable button pendant pending + debounce côté API.
- **Créneaux multiples** : un établissement veut publier pour mardi/mercredi/jeudi la même semaine. Actuellement 1 mission = 1 plage. Solution v1 : publier 3 missions. Solution future : champ `slots` (JSON array déjà dans le schema).
- **Taux horaire trop bas** : pas de minimum légal. Afficher un warning si < SMIC horaire sectoriel.

---

## Flow 4 — Publication renfort urgence

### Objectif
Permettre la publication d'un **SOS Renfort** (besoin < 24h) en **moins de 2 minutes** avec un flow raccourci et une mise en avant spéciale.

### Déclencheur
Clic sur **SOS Renfort** (bouton distinct, badge urgence) depuis header, sidebar, ou dashboard.

### Étapes exactes

| # | Écran/Composant | Action | Système |
|---|----------------|--------|---------|
| 1 | `RenfortModal` s'ouvre en **mode urgence** | Le mode est déterminé si l'utilisateur a cliqué "SOS Renfort" (pas "Publier un renfort"). | Zustand : `isRenfortModalOpen → true`, flag `isUrgent → true`. UI : bordure rouge/orange, badge "URGENT" visible. |
| 2 | Step unique — Formulaire condensé | **Métier** (select). **Date** (aujourd'hui ou demain, pré-sélectionné aujourd'hui). **Créneau** (heureDebut/heureFin). **Shift** (auto-détecté depuis l'heure). **Taux horaire** (pré-rempli avec moyenne sectorielle +15%). **Adresse** (pré-remplie profil). | Un seul écran au lieu de 5. Tous les champs contexte clinique sont optionnels et masqués derrière un "Ajouter plus de détails" (accordion). |
| 3 | Clic **Publier en urgence** | — | `POST /missions` avec `isRenfort: true`. Badge "SOS" sur la MissionCard. Notification push aux freelances de la zone (futur). Mission remonte en tête du job board. Toast succès. |

### Friction actuelle probable
- **Pas de distinction urgence/classique** : le champ `isRenfort` existe dans le schema mais le front ne propose pas de flow séparé. Le `RenfortModal` est le même pour les deux cas.
- **Pas de notification** : publier en urgence ne notifie personne — les freelances doivent checker manuellement le job board.
- **Pas de boost visuel** : les missions urgentes n'apparaissent pas différemment dans le job board (`MissionCard` ne distingue pas isRenfort).

### Logique cible

```
Clic "SOS Renfort"
  → RenfortModal mode urgence (1 écran condensé)
    → Publier en urgence
      → Mission publiée avec badge SOS
      → Notification push/email aux freelances dispo dans la zone (futur)
      → Mission en tête du job board
```

**Changements clés :**
- Flow en 1 seul écran (vs 5 steps classique).
- Taux horaire pré-rempli avec +15% pour attirer les candidats rapidement.
- Badge "SOS" rouge sur la MissionCard dans le job board.
- Tri job board : missions SOS en premier, puis par date.
- Futur : notification push/email aux freelances dont `interventionZone` matche et `isAvailable = true`.

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Modal | Dialog 540px, bordure rouge | Sheet plein écran, header rouge "SOS RENFORT" |
| Formulaire | Single column, tout visible | Scroll vertical, accordion pour optionnels |

### États vides
N/A — déclenché par action.

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Créneau dans le passé | "Ce créneau est déjà passé." | Auto-ajuster à "maintenant + 1h" |
| Profil sans adresse | "Ajoutez votre adresse pour publier." + lien settings | — |
| API error | Toast destructive, bouton reste actif | Retry |

### CTA principal
**"Publier en urgence"** — bouton rouge/corail avec icône alerte.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| SOS publish time | Temps pour compléter le flow SOS | < 2 min |
| SOS response time | Temps entre publication SOS et première candidature | < 2h |
| SOS fill rate | % de missions SOS qui reçoivent au moins 1 candidature | > 80% |

### Risques / Edge cases
- **Abus SOS** : un établissement publie tout en SOS pour le boost. Mitigation : limiter à X SOS/mois, ou détecter si dateStart > 48h et refuser le mode urgence.
- **Aucun freelance dispo** : mission SOS sans candidature après 4h. Prévoir un relancement automatique (email aux freelances qui n'ont pas encore vu) ou suggestion d'augmenter le taux.
- **Créneau extrêmement court** : "besoin d'1h de remplacement" —  valider que la durée min est raisonnable (ex: 2h min).

---

## Flow 5 — Matching candidats

### Objectif
Permettre à un établissement de consulter, comparer et choisir parmi les candidatures reçues sur une mission publiée.

### Déclencheur
L'établissement reçoit une notification "Nouvelle candidature sur votre mission [titre]" (in-app ou futur email). Ou consulte `/dashboard/renforts`.

### Étapes exactes

| # | Écran | Action | Système |
|---|-------|--------|---------|
| 1 | `/dashboard/renforts` | Voit ses missions en cours. Chaque mission affiche le nombre de candidatures. Clique sur une mission. | Fetch `GET /missions/managed`. Affiche les missions avec bookings[].freelance.profile. |
| 2 | Détail mission — section Candidatures | Voit la liste des candidatures (cards). Chaque `CandidateCard` affiche : photo, nom, métier, compétences, expérience, taux proposé, motivation, note moyenne (si reviews). | Bookings PENDING liés à cette mission. |
| 3 | Clic sur un candidat | Ouvre le **profil public** du freelance (sheet latéral ou page). Voit : bio, compétences, diplômes, zone, reviews, missions complétées. | `GET /users/:id/profile` (à implémenter). |
| 4 | Décision | Revient à la liste. Clique **Recruter** sur la carte du candidat choisi. Ou **Refuser** sur les autres. | "Recruter" → `POST /bookings/confirm` (bookingId). "Refuser" → `POST /bookings/:id/reject`. |
| 5 | Confirmation modale | Modale de confirmation : "Vous êtes sur le point de recruter [Prénom] pour [Mission]. 1 crédit sera déduit." Bouton **Confirmer le recrutement**. | Vérifie crédits > 0. Si OK → booking CONFIRMED, mission ASSIGNED, autres bookings CANCELLED. Si 0 crédit → "Achetez des crédits d'abord." |
| 6 | Post-confirmation | Mission passe en "Attribuée". Le freelance recruté est affiché. Les autres candidatures disparaissent. Bouton **Contacter** ouvre la messagerie. | Notification au freelance recruté. Notification "Non retenu" aux autres. |

### Friction actuelle probable
- **`/dashboard/renforts` existe** mais affiche les candidatures en `CandidateCard` directement dans la page. Pas de profil détaillé cliquable.
- **Pas de bouton "Refuser"** : la seule option est Annuler (via `POST /bookings/cancel`), mais c'est violent et pas adapté au flow "refuser une candidature" (qui est différent d'annuler un booking).
- **Pas de confirmation modale** avant recrutement : un clic = action immédiate.
- **Pas de profil public** : impossible de voir le détail d'un candidat avant de décider.
- **0 crédits = bloqué** sans message clair.

### Logique cible

```
/dashboard/renforts → mission card avec badge "3 candidatures"
  → Clic mission → vue détaillée avec liste candidats
    → Clic candidat → profil public (sheet)
    → Clic "Recruter" → modale confirmation (crédits)
      → Confirm → mission ASSIGNED
      → Refuser les autres → notification "non retenu"
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Mission detail | Page avec 2 colonnes : infos mission (gauche) + candidatures (droite) | Stack : infos mission, puis scroll candidatures |
| Profil candidat | Sheet latéral 480px | Page plein écran |
| Actions Recruter/Refuser | Boutons sur chaque CandidateCard | Sticky bottom bar quand profil ouvert |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Mission 0 candidature | "Aucune candidature pour le moment. Les freelances de votre zone seront notifiés." | — (patience) |
| 0 crédits au moment du recrutement | "Vous n'avez plus de crédit. Achetez un pack pour recruter." | **Acheter des crédits** |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Booking déjà CANCELLED (race) | "Ce candidat a retiré sa candidature." | Masquer la carte, rafraîchir |
| 0 crédits | Modale "Solde insuffisant" avec lien vers packs | Redirect `/dashboard/packs` |
| API error confirm | Toast destructive | Retry |

### CTA principal
**"Recruter"** — bouton teal sur chaque `CandidateCard`.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Time to confirm | Temps entre première candidature et recrutement | < 48h |
| Candidatures per mission | Nb moyen de candidatures par mission | > 2 |
| Confirm rate | % missions OPEN qui passent en ASSIGNED | > 60% |
| Profile view rate | % candidatures dont le profil est consulté avant décision | > 50% |

### Risques / Edge cases
- **1 seul candidat** : pas de "matching". L'établissement recrute par défaut ou attend. Indiquer "1 candidature reçue — vous pouvez attendre d'en recevoir d'autres ou recruter immédiatement."
- **Candidat retire sa candidature** entre la vue et le clic "Recruter". API retourne 404 → afficher "Ce candidat n'est plus disponible."
- **Mission expirée** (dateStart passée, toujours OPEN) : auto-archiver avec notification "Votre mission n'a pas été pourvue."
- **Multi-slot missions** : une mission sur 5 jours → un seul freelance pour les 5 jours. Pas de split (v1).

---

## Flow 6 — Candidature freelance

### Objectif
Permettre à un freelance de postuler à une mission depuis le job board avec un minimum de friction.

### Déclencheur
Clic sur **Postuler** depuis une `MissionCard` dans `/marketplace` (freelance view).

### Étapes exactes

| # | Écran/Composant | Action | Système |
|---|----------------|--------|---------|
| 1 | `/marketplace` — Job Board | Freelance consulte les missions. Clique sur une carte pour voir le détail. | `GET /missions` avec filtres appliqués. |
| 2 | Détail mission (sheet ou page) | Voit toutes les infos : métier, dates, shift, taux, description, public cible, compétences requises, avantages, localisation (carte). Badge de compétences matchées (highlight en vert). | Affichage détaillé. Matching visuel : si le freelance a "autisme" dans ses skills et la mission requiert "autisme" → badge vert "Match". |
| 3 | Clic **Postuler** | Ouvre `ApplyMissionModal`. | Zustand : `isApplyModalOpen → true`, `applyMissionId → missionId`. |
| 4 | `ApplyMissionModal` | Champ motivation (textarea, optionnel mais encouragé). Taux proposé (pré-rempli avec le taux de la mission, modifiable). Bouton **Envoyer ma candidature**. | Affiche un résumé : "Mission : [titre], [date], [taux]€/h". |
| 5 | Envoi | — | `POST /missions/:id/apply` avec { motivation, proposedRate }. |
| 6 | Confirmation | Toast succès : "Candidature envoyée ! L'établissement sera notifié." Mission dans la carte passe en "Candidature envoyée" (badge). | La mission reste visible dans le job board mais avec l'état "Postulé". Candidature visible dans `/dashboard` freelance (Mes Candidatures). |

### Friction actuelle probable
- **`ApplyMissionModal` existe** avec motivation + proposedRate. Fonctionnel.
- **Pas de matching visuel** : les compétences du freelance ne sont pas confrontées à celles de la mission.
- **Pas de feedback post-candidature** : la mission ne change pas visuellement après avoir postulé. Le freelance ne sait pas s'il a déjà postulé sans vérifier.
- **Pas de récap avant envoi** : le freelance valide sans revoir les infos de la mission.

### Logique cible

```
Job board → Clic mission → Sheet détail (avec matching score)
  → "Postuler" → ApplyMissionModal (motivation + taux)
    → Envoi → Mission marquée "Postulé" dans le board
      → Visible dans dashboard /Mes Candidatures
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Détail mission | Sheet latéral 560px | Page plein écran |
| ApplyMissionModal | Dialog centré 480px | Sheet bottom-up |
| Post-apply feedback | Badge "Postulé" sur la carte | Idem + toast |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| 0 missions après filtres | "Aucune mission trouvable avec ces filtres." | **Réinitialiser** |
| Candidature envoyée — attente | "Candidature envoyée le [date]. En attente de réponse." | — |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Déjà postulé (409) | Toast : "Vous avez déjà postulé à cette mission." | Modale se ferme |
| Mission plus OPEN (400) | Toast : "Cette mission n'est plus disponible." | MissionCard retirée du board |
| Profil incomplet | Warning dans la modale : "Complétez votre profil pour maximiser vos chances." + lien. Candidature quand même possible. | Lien vers `/account` |
| API error | Toast destructive | Retry |

### CTA principal
**"Postuler"** — bouton teal, visible dans le détail mission et sur la MissionCard (si non postulé).

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Apply conversion rate | % de missions consultées qui reçoivent une candidature | > 15% |
| Apply completion rate | % de ApplyModal ouvertes qui aboutissent | > 80% |
| Motivation fill rate | % de candidatures avec motivation remplie | > 60% |
| Avg candidatures per freelance per month | Volume d'activité | > 3 |

### Risques / Edge cases
- **Freelance non vérifié (PENDING)** : peut postuler mais l'établissement voit un warning. Détailler : "Ce candidat est en attente de vérification."
- **Mission dans une autre ville** : le freelance postule à 200km. Pas de blocage mais warning "Cette mission est à [distance] km de votre zone habituelle."
- **Taux proposé très différent** : freelance propose 50€/h pour une mission à 25€/h. Pas de blocage (négociation permise) mais warning si écart > 30%.
- **Auto-candidature** : l'établissement essaie de postuler à sa propre mission. Le rôle guard l'empêche (FREELANCE seulement).

---

## Flow 7 — Confirmation mission

### Objectif
Transformer une candidature acceptée en mission confirmée, avec débit de crédit et ouverture du canal de communication.

### Déclencheur
L'établissement clique **Recruter** sur un candidat dans `/dashboard/renforts` (voir Flow 5, step 4).

### Étapes exactes

| # | Écran | Action | Système |
|---|-------|--------|---------|
| 1 | Modale confirmation | "Recruter [Prénom] pour [Mission] ? 1 crédit sera débité." + résumé (date, taux, duration). | Affiche crédits restants. |
| 2 | Clic **Confirmer** | — | `POST /bookings/confirm` { bookingId }. Transaction : booking → CONFIRMED, mission → ASSIGNED, autres bookings → CANCELLED, crédits −1. |
| 3 | Succès | Modale se transforme en confirmation : "Mission confirmée ! [Prénom] a été notifié(e)." + 2 CTA : **Contacter [Prénom]** / **Retour au tableau de bord**. | Notification SUCCESS au freelance. Notification "Non retenu" aux autres candidats (Booking CANCELLED). |
| 4 | Côté freelance | Reçoit notification : "Vous avez été recruté pour [Mission] !". Mission visible dans Dashboard → Mon Agenda (CONFIRMED). CTA : **Contacter l'établissement**. | Notification in-app. Futur : email + push. |

### Friction actuelle probable
- **Pas de modale de confirmation** : `confirmBooking` est appelé directement sans double-check.
- **Race condition sur crédits** : voir Phase 3 bug S7.
- **Pas de notification aux refusés** : les autres candidats sont CANCELLED silencieusement.
- **Pas de bouton "Contacter"** : après confirmation, aucun raccourci vers la messagerie.

### Logique cible

```
Recruter → Modale confirmation (résumé + crédits)
  → Confirmer → Succès (notification bilatérale)
    → CTA Contacter → ouvre conversation liée à la mission
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Modale confirmation | Dialog centré 420px | Sheet bottom-up |
| Succès | Même dialog, contenu changé | Même sheet, contenu changé |

### États vides
N/A.

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| 0 crédits | "Crédits insuffisants. Achetez un pack." | Lien `/dashboard/packs` |
| Booking plus PENDING (race) | "Ce candidat n'est plus disponible." | Fermer modale, rafraîchir |
| API error | Toast + bouton reste actif | Retry |

### CTA principal
**"Confirmer le recrutement"** — bouton teal dans la modale confirmation.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Confirmation rate | % bookings PENDING qui passent en CONFIRMED | > 50% |
| Time to confirm | Temps entre candidature et confirmation | < 48h |
| Credits conversion | % crédits achetés qui sont utilisés | > 80% |
| Post-confirm messaging rate | % missions confirmées où une conversation est ouverte | > 70% |

### Risques / Edge cases
- **Dernier crédit** : l'établissement utilise son dernier crédit. Après confirmation, afficher "Vous avez utilisé votre dernier crédit. Approvisionnez votre compte pour vos prochains renforts." + CTA packs.
- **Freelance a retiré sa candidature** entre le clic "Recruter" et le clic "Confirmer". API 400 → message clair.
- **Confirmation accidentelle** : la modale de double-check protège. Pas d'action irréversible en 1 clic.

---

## Flow 8 — Complétion + facturation

### Objectif
Clôturer une mission terminée, générer la facture, et déclencher le processus de paiement.

### Déclencheur
La date de fin de la mission est passée. L'établissement ou le freelance initie la complétion.

### Étapes exactes

| # | Acteur | Écran | Action | Système |
|---|--------|-------|--------|---------|
| 1 | Système | Dashboard ESTABLISHMENT | Badge sur la mission : "Mission terminée — Action requise". Widget `MissionsToValidateWidget` affiche les missions en attente de complétion. | Détection automatique : si dateEnd < now() ET status = ASSIGNED → afficher dans la zone d'action. |
| 2 | ESTABLISHMENT | `/dashboard` ou `/dashboard/renforts` | Clique **Marquer comme terminée** sur la mission. | Ouvre modale de résumé : "Mission [titre] avec [freelance], du [date] au [date]. Montant estimé : [taux × heures] €." |
| 3 | ESTABLISHMENT | Modale complétion | Confirme les heures réellement effectuées (pré-remplies, modifiables). Clique **Valider la complétion**. | `POST /bookings/complete`. Booking → COMPLETED_AWAITING_PAYMENT. Invoice créée (PENDING_PAYMENT) avec montant calculé. Notification au freelance. |
| 4 | FREELANCE | Dashboard | Reçoit notification : "Mission terminée. Facture de [montant]€ en attente de paiement." Peut consulter la facture (lien). | Invoice visible dans `/finance`. |
| 5 | ESTABLISHMENT | Dashboard | Widget paiement : "Facture de [montant]€ en attente." CTA : **Autoriser le paiement**. | `PaymentValidationWidget` affiche les factures PENDING_PAYMENT. |
| 6 | ESTABLISHMENT | Modale paiement | "Valider le paiement de [montant]€ pour [Mission] ?" Bouton **Payer**. | `POST /bookings/authorize-payment`. Booking → PAID. Invoice → PAID. Notification au freelance. (Futur : Stripe Checkout). |
| 7 | FREELANCE | Dashboard | Notification : "Paiement de [montant]€ reçu !" Facture accessible en PDF. | Invoice PAID + PDF téléchargeable via `GET /invoices/:id/download`. |

### Friction actuelle probable
- **Complétion initiée uniquement par l'établissement** : le freelance ne peut pas marquer la mission comme terminée. Pas de validation bilatérale.
- **Bug montant** : `completeBooking` ne charge pas la relation `quote`, donc le calcul de montant pour les devis est toujours 0 (Phase 3 bug B6).
- **Invoice PDF bugué** : utilise `.client` et `.talent` au lieu de `.establishment` et `.freelance` (Phase 3 bug B4).
- **Pas de modale de résumé** : la complétion est un clic direct sans confirmation des heures.
- **Pas de Stripe** : "autoriser le paiement" change juste un statut en DB. Aucun mouvement d'argent réel.
- **Pas de détection automatique** : rien ne signale qu'une mission est terminée. L'établissement doit le faire manuellement.

### Logique cible

```
dateEnd passée → badge "Action requise" sur le dashboard
  → "Marquer comme terminée" → modale résumé (confirmer heures)
    → Complétion → Invoice PENDING_PAYMENT
      → "Payer" → modale paiement (Stripe Checkout futur)
        → PAID → Notification + facture PDF
          → Review window ouverte (voir Flow 9)
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Widget action | Bento card en zone haute dashboard | Card full-width en haut, sticky |
| Modale complétion | Dialog 520px | Sheet bottom-up |
| Facture PDF | Preview inline + download | Direct download |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Aucune mission à compléter | — (widget masqué) | — |
| Aucune facture en attente | — (widget masqué) | — |
| FREELANCE — 0 factures | "Aucune facture pour le moment. Complétez des missions pour générer des factures." | **Voir les missions** |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Booking pas CONFIRMED (bad status) | "Cette mission ne peut pas être marquée comme terminée." | — |
| Invoice déjà existante (double complete) | "Cette mission est déjà en attente de paiement." | Redirect vers paiement |
| PDF generation error | Toast : "Erreur de génération. Réessayez." | Retry |
| Stripe payment failed (futur) | "Paiement refusé. Vérifiez votre moyen de paiement." | Retry / changer de carte |

### CTA principal
- ESTABLISHMENT : **"Marquer comme terminée"** puis **"Payer"**
- FREELANCE : **"Télécharger la facture"**

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Completion rate | % missions ASSIGNED qui passent en COMPLETED | > 90% |
| Time to complete | Temps entre dateEnd et complétion | < 3 jours |
| Time to pay | Temps entre complétion et paiement | < 7 jours |
| Invoice download rate | % factures PAID téléchargées | > 60% |

### Risques / Edge cases
- **Mission annulée après le début** : le freelance a travaillé 2 jours sur 5. Complétion partielle → l'établissement doit ajuster les heures manuellement dans la modale.
- **Désaccord sur les heures** : pas de flow de dispute. V1 : l'établissement est maître des heures. Futur : le freelance peut contester.
- **Freelance n'a pas de Stripe** : le paiement est enregistré mais le virement ne part pas. Bloquer le PAID tant que le freelance n'est pas onboardé Stripe Connect.

---

## Flow 9 — Feedback / review

### Objectif
Collecter des avis bidirectionnels (établissement → freelance ET freelance → établissement) après chaque prestation complétée, pour alimenter la confiance de la plateforme.

### Déclencheur
Le booking passe en PAID. Une fenêtre de 14 jours s'ouvre pour laisser un avis.

### Étapes exactes

| # | Acteur | Écran | Action | Système |
|---|--------|-------|--------|---------|
| 1 | Système | — | Booking passe PAID. | Créer 2 "review slots" : un pour l'établissement, un pour le freelance. Notification aux deux : "Laissez votre avis sur [Prénom/Mission] !" |
| 2 | USER (E ou F) | Dashboard banners / notifications | Voit un prompt : "Que pensez-vous de [Prénom] pour la mission [titre] ?" CTA : **Laisser un avis**. | Le prompt apparaît dans le dashboard (widget ou banner) et en notification. |
| 3 | USER | Review modale/drawer | **Rating** : 1-5 étoiles (clic ou tap). **Commentaire** : textarea (optionnel, encouragé si rating < 4). | Preview : "Votre avis sera publié sous [Votre Prénom] et visible sur le profil de [Destinataire]." |
| 4 | USER | Clic **Publier mon avis** | — | `POST /reviews` { bookingId, rating, comment, type }. Validation : booking PAID, auteur est partie prenante, max 1 review par booking+author, dans les 14j. |
| 5 | Confirmation | Toast : "Merci pour votre avis !" | La review est immédiatement visible sur le profil public du destinataire. Note moyenne mise à jour. | Review prompt disparaît du dashboard. |

### Friction actuelle probable
- **Aucun module reviews** : le model `Review` existe en Prisma mais il n'y a ni controller, ni service, ni endpoint.
- **Aucune UI review** : pas de composant étoiles, pas de modale review, pas de widget prompt.
- **Pas de reviews sur les profils** : le profil public n'existe pas non plus.
- **Tout est à construire** pour ce flow.

### Logique cible

```
Booking PAID → notification "Laissez un avis"
  → Dashboard banner / notification cliquable
    → Review modale (étoiles + commentaire)
      → POST /reviews
        → Review visible sur profil public
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Review prompt | Banner en haut du dashboard, dismissable | Card sticky en haut |
| Review modale | Dialog 420px | Sheet bottom-up demi-écran |
| Étoiles | 5 étoiles cliquables, hover preview | 5 étoiles tap, taille agrandie (44px touch targets) |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Profil sans reviews | "Aucun avis pour le moment." | — |
| Pas encore de booking PAID | Review prompt invisible | — |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Déjà reviewé (409) | "Vous avez déjà laissé un avis pour cette prestation." | Fermer modale |
| Délai 14j dépassé | "Le délai pour laisser un avis est expiré." | Masquer le prompt |
| Rating = 0 (oublié) | "Sélectionnez une note." | Focus sur les étoiles |
| API error | Toast destructive | Retry |

### CTA principal
**"Laisser un avis"** — bouton teal/corail dans le prompt dashboard.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Review submission rate | % bookings PAID qui reçoivent au moins 1 review | > 50% |
| Bilateral review rate | % bookings où les 2 parties ont reviewé | > 30% |
| Average rating | Note moyenne globale | > 4.2/5 |
| Comment fill rate | % reviews avec commentaire | > 40% |
| Time to review | Temps entre PAID et review | < 5 jours |

### Risques / Edge cases
- **Review négatif injuste** : pas de modération v1. Futur : signalement par le destinataire + modération admin.
- **Pression sociale** : le freelance n'ose pas noter < 5 de peur de représailles. Les reviews sont publiées simultanément (les deux voient en même temps, ou après que les deux aient posté) ? V1 : publication immédiate. Futur : publication croisée.
- **Mission annulée mais partiellement effectuée** : si la mission a été annulée après 2 jours, peut-on reviewer ? Règle : seuls les bookings PAID/COMPLETED ouvrent la review window.

---

## Flow 10 — Découverte catalogue ateliers

### Objectif
Permettre à un établissement de parcourir le catalogue d'ateliers proposés par les freelances et trouver une prestation adaptée à ses besoins.

### Déclencheur
Clic sur **Ateliers** / **Catalogue** depuis la sidebar, le header, ou le dashboard (CTA secondaire). Route : `/marketplace` (vue ESTABLISHMENT).

### Étapes exactes

| # | Écran | Action | Système |
|---|-------|--------|---------|
| 1 | `/marketplace` (ESTABLISHMENT) | Voit le `ClientCatalogue` : grille de `ServiceCard` + barre de filtres. Onglets possibles : "Ateliers" / "Freelances". | `GET /services` (filtre isHidden=false). Affiche les services avec owner.profile. |
| 2 | Filtres | Filtre par : **catégorie** (gestion des émotions, habiletés sociales, sensorialité…), **type** (WORKSHOP, TRAINING), **budget** (slider min/max), **public cible** (enfants, ados, adultes), **disponibilité** (dates). | Filtres côté client (v1 en mémoire) ou côté API (cible : query params). |
| 3 | `ServiceCard` | Chaque carte affiche : titre, catégorie, prix (ou "Sur devis"), durée, freelance (nom + avatar + note), nombre de réservations. | Card design phase 2. |
| 4 | Clic sur une carte | Navigation vers `/marketplace/services/[id]`. | `GET /services/:id`. Affiche la fiche détaillée. |
| 5 | Fiche atelier | **Hero** : titre, catégorie, badge type. **Infos** : description, objectifs, méthodologie, évaluation, matériel, public cible. **Freelance** : mini profil avec note + lien vers profil public. **Créneaux** : dates disponibles. **Reviews** : derniers avis. **Prix** : montant ou "Sur devis". | Page dédiée (pas une modale). |
| 6 | Action | CTA principal : **Réserver** (si SESSION/PER_PARTICIPANT) ou **Demander un devis** (si QUOTE). | Ouvre `BookServiceModal` ou `QuoteRequestModal`. |

### Friction actuelle probable
- **`ClientCatalogue` existe** : affiche services + onglet talents. Mais :
  - Filtres limités (pas de catégorie, public cible, budget).
  - Pas de pagination (tous les services chargés d'un coup).
  - `ServiceCard` manque de détails (pas de note, pas de nombre de réservations).
- **Page détail `/marketplace/services/[id]` existe** mais contenu minimal (description + prix + CTA).
- **`ServiceDetailActions` existe** : gère les boutons Réserver/Devis. Fonctionnel.
- **Pas de reviews affichés** sur la fiche atelier.

### Logique cible

```
/marketplace (ESTABLISHMENT)
  → Catalogue grille + filtres riches
    → Clic ServiceCard → /marketplace/services/[id]
      → Fiche complète (description, méthodologie, reviews, créneaux)
        → "Réserver" ou "Demander un devis"
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Catalogue | Grid 3 colonnes + sidebar filtres | Stack 1 colonne + filtres en Sheet (bouton "Filtrer") |
| ServiceCard | Card horizontale ou verticale | Card verticale compacte |
| Fiche atelier | 2 colonnes : contenu (gauche) + sidebar sticky booking (droite) | Stack vertical, CTA sticky bottom bar |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| 0 ateliers | "Aucun atelier disponible pour le moment. Les freelances publient régulièrement de nouvelles prestations." | — |
| 0 résultats filtres | "Aucun atelier ne correspond à vos critères." | **Réinitialiser les filtres** |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| API timeout | Skeleton + "Impossible de charger le catalogue." + Retry | Retry |
| Service 404 (url cassée) | Page 404 : "Cet atelier n'existe plus." | Lien retour catalogue |

### CTA principal
**"Réserver cet atelier"** ou **"Demander un devis"** — bouton corail, sticky en bas sur mobile.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Catalogue visit rate | % établissements qui visitent /marketplace par mois | > 40% |
| Service detail view rate | % visites catalogue qui cliquent sur une fiche | > 25% |
| Filter usage rate | % visites avec au moins 1 filtre appliqué | > 30% |
| Booking conversion from detail | % vues fiche → réservation/devis | > 10% |

### Risques / Edge cases
- **Catalogue vide au lancement** : peu de freelances = peu d'ateliers. Solution : template ateliers pré-remplis que les freelances peuvent adapter, ou ateliers "à la demande" (formulaire de besoin).
- **Prix très variés** : 50€ à 2000€. Le slider budget doit refléter la distribution réelle.
- **Atelier sans créneaux** : le freelance n'a pas rempli les slots. Afficher "Dates sur demande" au lieu de cacher l'atelier.

---

## Flow 11 — Réservation / demande atelier

### Objectif
Permettre à un établissement de réserver un atelier (prix fixe) ou de demander un devis (prix sur mesure) avec un maximum de contexte pour le freelance.

### Déclencheur
Clic sur **Réserver** ou **Demander un devis** depuis la fiche atelier `/marketplace/services/[id]`.

### Étapes exactes

#### Scénario A — Réservation directe (pricingType = SESSION ou PER_PARTICIPANT)

| # | Composant | Action | Système |
|---|-----------|--------|---------|
| 1 | `BookServiceModal` s'ouvre | — | Zustand : `isBookServiceModalOpen → true`. |
| 2 | Formulaire | Sélectionne une **date** (parmi les slots dispo ou date libre). Saisit **nombre de participants**. **Message** optionnel (contexte, besoins spécifiques). | Affiche le prix calculé : fixe (SESSION) ou `pricePerParticipant × nbParticipants` (PER_PARTICIPANT). |
| 3 | Récapitulatif | "Atelier : [titre]. Date : [date]. Participants : [nb]. Montant : [prix]€." Bouton **Confirmer la réservation**. | — |
| 4 | Envoi | — | `POST /services/:id/book` { date, message, nbParticipants }. Booking PENDING créé. |
| 5 | Confirmation | Toast : "Demande envoyée ! [Freelance] reviendra vers vous sous 48h." | Notification au freelance. Booking visible dans dashboard ESTABLISHMENT (Mes Réservations). |

#### Scénario B — Demande de devis (pricingType = QUOTE)

| # | Composant | Action | Système |
|---|-----------|--------|---------|
| 1 | `QuoteRequestModal` s'ouvre | — | Zustand : `isQuoteRequestModalOpen → true`. |
| 2 | Formulaire | Date souhaitée. Nombre de participants. Message détaillé obligatoire (description du besoin, public, contraintes). | Le prix n'est pas affiché ("Le freelance vous enverra un devis personnalisé.") |
| 3 | Envoi | — | `POST /services/:id/book` { date, message, nbParticipants } → crée Booking PENDING + Quote PENDING (transaction) |
| 4 | Confirmation | toast: "Demande de devis envoyée ! [Freelance] vous enverra une proposition." | Notification au freelance. Quote visible dans dashboard des 2 parties. |
| 5 | Freelance rédige le devis | Freelance ouvre `QuoteEditorModal`. Saisit montant, description détaillée, dates. | `PATCH /quotes/:id` { amount, description }. Notification à l'établissement. |
| 6 | ESTABLISHMENT décide | Voit le devis dans Dashboard → Mes Devis. **Accepter** ou **Refuser**. | `PATCH /quotes/:id/accept` → Booking CONFIRMED. `PATCH /quotes/:id/reject` → Booking CANCELLED. |

### Friction actuelle probable
- **`BookServiceModal` et `QuoteRequestModal` existent** et sont fonctionnels. `BookServiceModal` envoie date, message, nbParticipants.
- **`QuoteEditorModal` existe** pour le freelance côté devis.
- **Pas de capacité check** : si l'atelier a 12 places et 10 sont déjà réservées, la réservation pour 5 passe quand même.
- **Pas de créneau sélectionnable** : le champ date est libre au lieu de proposer les slots définis par le freelance.
- **Prix dynamique PER_PARTICIPANT** : pas évident que le calcul est fait côté front ou back.
- **Flow devis long** : 6 étapes impliquant 2 acteurs avec des allers-retours. Risque d'abandon.

### Logique cible

```
Fiche atelier → CTA Réserver/Devis
  ├── SESSION/PER_PARTICIPANT → BookServiceModal (date + nb + message)
  │     → Booking PENDING → freelance confirme (via /bookings/confirm)
  │       → CONFIRMED → suite complétion (Flow 8)
  │
  └── QUOTE → QuoteRequestModal (date + nb + message détaillé)
        → Booking PENDING + Quote PENDING
          → Freelance → QuoteEditorModal (montant + description)
            → ESTABLISHMENT accepte/refuse
              → CONFIRMED ou CANCELLED
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| BookServiceModal | Dialog 480px | Sheet bottom-up |
| QuoteRequestModal | Dialog 520px | Sheet bottom-up plein écran |
| QuoteEditorModal (freelance) | Dialog 520px | Sheet plein écran |
| Prix dynamique | Calcul live dans le récap | Idem |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| Aucun créneau dispo | "Pas de créneau disponible. Proposez vos dates dans le message." | — |
| Freelance n'a pas répondu au devis (> 5j) | "En attente de réponse. Vous pouvez relancer." | **Relancer** (notification) |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Déjà une demande en cours (409) | "Vous avez déjà une demande en cours pour cet atelier." | Lien vers la demande existante |
| Capacité dépassée | "Plus de places disponibles pour cet atelier." | Proposer une autre date |
| Date passée | "La date sélectionnée est passée." | Re-sélectionner |
| API error | Toast destructive | Retry |

### CTA principal
- **"Confirmer la réservation"** — bouton corail (réservation directe)
- **"Envoyer ma demande de devis"** — bouton corail (devis)

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Booking conversion | % clics Réserver qui aboutissent | > 70% |
| Quote request rate | % clics Devis qui aboutissent | > 60% |
| Quote response time | Temps entre demande de devis et réponse freelance | < 48h |
| Quote accept rate | % devis envoyés qui sont acceptés | > 50% |

### Risques / Edge cases
- **Freelance ne répond jamais au devis** : auto-relance J+3, auto-expiration J+7 avec notification.
- **Négociation** : l'établissement refuse le devis mais veut négocier. V1 : refuser → nouvelle demande. Futur : contre-proposition dans la messagerie.
- **Même atelier, même date, 2 établissements** : le premier qui réserve consomme les places. Le second reçoit "Plus de places." Implémenter le capacity check côté API.

---

## Flow 12 — Page "Mes ateliers"

### Objectif
Donner au freelance une vue centralisée de ses ateliers publiés avec gestion du cycle de vie (brouillon, actif, archivé) et suivi des réservations.

### Déclencheur
Navigation vers une page dédiée **"Mes ateliers"** depuis la sidebar (freelance). Route cible : `/dashboard/ateliers` (n'existe pas encore).

### Étapes exactes

| # | Écran | Contenu | Actions |
|---|-------|---------|---------|
| 1 | `/dashboard/ateliers` | Liste des ateliers du freelance. Onglets : **Actifs** / **Brouillons** / **Archivés**. Chaque carte affiche : titre, catégorie, prix, nb réservations, nb avis, note moyenne. | **Créer un atelier** (CTA header). |
| 2 | Clic sur un atelier | Vue détaillée de gestion. Sections : infos atelier (éditable), réservations en cours, historique. | **Modifier** / **Archiver** / **Voir les réservations**. |
| 3 | Réservations | Liste des bookings liés à ce service. Statuts : PENDING (à confirmer), CONFIRMED (à venir), COMPLETED. | **Confirmer** (PENDING → CONFIRMED) / **Contacter** (ouvrir messagerie). |
| 4 | Création atelier | CTA **Créer un atelier** → ouvre le formulaire de création (via `PublishModal` existant ou page dédiée). | `POST /services` → atelier créé en ACTIVE (ou DRAFT si publié plus tard). |
| 5 | Modification | Clic **Modifier** → formulaire pré-rempli. | `PATCH /services/:id`. |
| 6 | Archivage | Clic **Archiver** → confirmation. | `DELETE /services/:id` (soft delete → status ARCHIVED). L'atelier disparaît du catalogue mais reste dans les archives du freelance. |

### Friction actuelle probable
- **La page n'existe pas** : aucune route `/dashboard/ateliers`. Le freelance voit ses services via le marketplace uniquement (mélangés avec ceux des autres).
- **Pas d'endpoint `GET /services/mine`** : le freelance ne peut pas lister ses propres ateliers.
- **Pas d'endpoint `PATCH /services/:id`** ni `DELETE /services/:id` : impossible de modifier ou archiver.
- **Pas de vue réservations par service** : le freelance voit ses bookings globalement dans `/bookings` mais pas filtrés par atelier.
- **`PublishModal` existe** pour créer un service mais sans state DRAFT.

### Logique cible

```
Sidebar "Mes ateliers" → /dashboard/ateliers
  → Liste ateliers (onglets : Actifs / Brouillons / Archivés)
    → Clic atelier → détail gestion
      → Modifier / Archiver / Voir réservations
  → CTA "Créer un atelier" → PublishModal ou page dédiée
```

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Liste ateliers | Grid 2-3 colonnes | Stack 1 colonne |
| Détail atelier | 2 colonnes : infos (gauche) + réservations (droite) | Stack vertical, onglets |
| Création/modification | Dialog large ou page | Page plein écran |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| 0 ateliers | "Vous n'avez pas encore publié d'atelier. Proposez vos compétences aux établissements." | **Créer mon premier atelier** |
| 0 réservations sur un atelier | "Aucune réservation pour cet atelier. Partagez le lien pour gagner en visibilité." | **Copier le lien** |
| Tab Brouillons vide | "Aucun brouillon." | — |
| Tab Archives vide | "Aucun atelier archivé." | — |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| API timeout | Skeleton + retry | Retry |
| Archivage d'un atelier avec bookings PENDING | "Cet atelier a des réservations en cours. Traitez-les avant d'archiver." | Lien vers les réservations |
| Modification échoue (conflict) | Toast destructive | Retry |

### CTA principal
**"Créer un atelier"** — bouton teal, header de la page.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Services per freelance | Nb moyen d'ateliers publiés par freelance actif | > 2 |
| Active service rate | % ateliers en status ACTIVE (vs DRAFT/ARCHIVED) | > 70% |
| Service page visit rate | % freelances qui consultent "Mes ateliers" par semaine | > 30% |
| Booking management time | Temps entre booking PENDING et CONFIRMED sur les ateliers | < 48h |

### Risques / Edge cases
- **Modification d'un atelier avec bookings en cours** : modifier le prix ne doit pas affecter les bookings existants (snapshotter le prix au moment de la réservation).
- **Archivage** : un atelier archivé ne doit plus apparaître dans le catalogue mais les factures/bookings restent accessibles.
- **Duplication** : le freelance veut créer un atelier similaire. Futur : bouton "Dupliquer" qui pré-remplit le formulaire.

---

## Flow 13 — Messaging

### Objectif
Permettre une communication directe entre un établissement et un freelance, contextualisée par une mission ou un atelier, sans quitter la plateforme.

### Déclencheur
- Clic **Contacter** depuis : profil freelance, candidature, mission confirmée, réservation atelier.
- Clic sur une conversation existante depuis `/dashboard/inbox`.

### Étapes exactes

| # | Écran | Action | Système |
|---|-------|--------|---------|
| 1 | Trigger | Clic **Contacter [Prénom]** quelque part dans l'app. | `POST /conversations` { participantId, bookingId?, missionId? }. Crée ou retrouve la conversation existante. Redirige vers `/dashboard/inbox?conv=:id`. |
| 2 | `/dashboard/inbox` | **Panel gauche** : liste des conversations. Chaque entrée : avatar, nom, dernier message (tronqué), timestamp, badge unread count. **Panel droit** : messages de la conversation sélectionnée. | `GET /conversations` (paginé). `GET /conversations/:id/messages` (paginé). |
| 3 | Lecture | Scroll dans les messages. Anciens messages chargés au scroll vers le haut (pagination inversée). | Messages ordonnés par date. Marquage auto lu à l'ouverture : `PATCH /conversations/:id/read`. |
| 4 | Envoi message | Saisit le texte dans le champ en bas. Appuie Entrée ou clique **Envoyer**. | `POST /conversations/:id/messages` { content }. Message apparaît immédiatement (optimistic update). WebSocket broadcast aux participants. |
| 5 | Réception (autre user) | Notification in-app : "Nouveau message de [Prénom]". Badge update dans la sidebar (nombre non lus). | WebSocket `message:new`. Notification `notification:new`. |
| 6 | Contexte | En haut de la conversation, bandeau contextuel : "Concernant la mission [titre]" ou "Concernant l'atelier [titre]" avec lien. | Affiché si `bookingId` ou `missionId` est lié à la conversation. |

### Friction actuelle probable
- **Messaging cassé architecturalement** : le frontend (`messaging.ts` actions) utilise **Prisma directement** au lieu de l'API. Bypass total de l'authentification.
- **Modèle `DirectMessage` plat** : pas de Conversation. Impossible de lister les conversations, juste des messages entre 2 users.
- **Page `/dashboard/inbox` existe** mais utilise les actions Prisma directes. Probablement non fonctionnel en production (le client Next.js n'a pas accès à Prisma sauf en SSR).
- **Pas de WebSocket** : pas de temps réel, polling uniquement.
- **Pas de contexte** : les messages ne sont pas liés à une mission ou un atelier.

### Logique cible

```
"Contacter" → POST /conversations (create or find)
  → /dashboard/inbox?conv=:id
    → Liste conversations (gauche) | Messages (droite)
      → Envoi message → WebSocket broadcast
        → Notification in-app en temps réel
```

**Changements structurels majeurs :**
1. Remplacer `DirectMessage` par `Conversation + Message` (Phase 3 schema).
2. Créer un module `messaging/` backend complet (REST + WebSocket).
3. Réécrire `messaging.ts` frontend pour utiliser l'API REST au lieu de Prisma.
4. Implémenter le WebSocket client côté Next.js.

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Layout | Split 2 panels (conversations 320px + messages flex) | Page conversations → tap → page messages (navigation) |
| Input message | Textarea auto-resize en bas du panel droit | Input sticky bottom avec bouton Envoyer |
| Contexte | Bandeau horizontal dans le header conversation | Bandeau compact sous le nom |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| 0 conversations | "Aucune conversation. Contactez un freelance depuis une mission ou un atelier." | **Voir les missions** / **Voir les ateliers** |
| Conversation — 0 messages | "Commencez la conversation !" (placeholder dans le champ message) | — |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| WebSocket déconnecté | Bandeau discret : "Reconnexion…" (auto-reconnect) | Auto-retry exponentiel |
| Message non envoyé | Message en rouge avec icône retry | Clic pour ré-envoyer |
| Conversation 404 | "Cette conversation n'existe plus." | Retour à la liste |
| User bloqué/banni | Impossible d'envoyer. Message : "Cette conversation est fermée." | — |

### CTA principal
**"Envoyer"** — bouton dans l'input zone de la conversation.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Message rate | Nb messages envoyés / booking confirmé | > 3 |
| Response time | Temps moyen entre un message et la réponse | < 4h |
| Inbox open rate | % users qui ouvrent leur inbox par semaine | > 30% |
| Conversation to booking conversion | % conversations qui mènent à un booking | > 20% |

### Risques / Edge cases
- **Spam** : un user envoie 100 messages. Rate limit côté API (throttler) + max 1 message/sec côté WebSocket.
- **User banni** : les conversations existantes sont marquées "Fermée". Pas de nouveaux messages.
- **Message trop long** : validation max 2000 caractères côté DTO.
- **Contenu inapproprié** : v1 pas de modération. Futur : signalement + review admin.
- **Conversation hors contexte** : un freelance contacte un établissement sans booking/mission lié. Autorisé (recherche proactive) mais la conversation n'aura pas de contexte.

---

## Flow 14 — Documents / vérification

### Objectif
Collecter et vérifier les documents nécessaires à la conformité de la plateforme : attestation d'assurance RC Pro, diplômes, KBIS/SIRET, pièce d'identité pour les freelances. Justificatifs d'existence pour les établissements.

### Déclencheur
- Onboarding wizard step 4 (upload initial).
- Notification / checklist "Complétez votre dossier" dans le dashboard.
- Page dédiée `/account` → section Documents.

### Étapes exactes

| # | Écran | Action | Système |
|---|-------|--------|---------|
| 1 | Dashboard — `TrustChecklistWidget` | Le freelance voit une checklist de confiance : "Profil complété ✅ / Diplôme uploadé ❌ / RC Pro ❌ / SIRET ✅". Pourcentage de complétude. | Calculé depuis Profile + Uploads. |
| 2 | Clic sur une ligne incomplète ou **Compléter mon dossier** | Redirige vers `/account` section Documents. | — |
| 3 | `/account` — Section Documents | Liste des types de documents attendus avec leur statut : Non fourni / En attente de vérification / Vérifié / Expiré. | `GET /uploads?userId=me`. Affiche par type. |
| 4 | Upload | Clic **Ajouter** à côté d'un type de document. Ouvre un file picker (ou drop zone). | Validation front : type MIME (PDF, JPG, PNG), taille max (10 Mo documents, 5 Mo images). |
| 5 | Envoi | — | `POST /uploads` (multipart/form-data) { file, type: "DOCUMENT" | "ATTESTATION" }. Fichier stocké (local dev / R2 prod). |
| 6 | Post-upload | Document apparaît avec statut "En attente de vérification". | Admin notifié qu'un nouveau document est à vérifier. |
| 7 | Vérification admin | Admin consulte `/admin/users/:id` → section Documents. Approve ou Reject avec commentaire. | `POST /admin/users/:userId/documents/:uploadId/verify` (ou `/reject`). Notification au user. |
| 8 | Résultat | User voit le nouveau statut. Si rejeté : message du motif + possibilité de re-uploader. Si vérifié : badge vert ✅. | Notification : "Votre diplôme a été vérifié !" ou "Document rejeté : [motif]. Merci de renvoyer." |

### Friction actuelle probable
- **Aucun module upload** : pas d'endpoint, pas de storage, pas de modèle Upload dans Prisma.
- **`TrustChecklistWidget` existe** dans le dashboard mais la checklist est hardcodée — pas de données réelles.
- **Page `/account` existe** mais sans section Documents.
- **Admin n'a pas de vue documents** : `/admin/users/:id` affiche l'email, le rôle, le statut — pas de documents.
- **Tout est à construire** pour ce flow.

### Logique cible

```
Dashboard → TrustChecklistWidget (% complétude réelle)
  → Clic "Compléter" → /account#documents
    → Drop zone / file picker par type de document
      → POST /uploads → stockage R2
        → Admin review → approve/reject
          → Notification user
            → Badge confiance mis à jour
```

**Types de documents par rôle :**

| Rôle | Document | Obligatoire | Expiration |
|------|----------|-------------|------------|
| FREELANCE | Pièce d'identité | ✅ | Non |
| FREELANCE | Diplôme(s) | ✅ | Non |
| FREELANCE | Attestation RC Pro | ✅ | Annuelle |
| FREELANCE | SIRET / Attestation URSSAF | ✅ | Non |
| FREELANCE | Casier judiciaire (B3) | Recommandé | 3 mois |
| ESTABLISHMENT | SIRET / KBIS | ✅ | Non |
| ESTABLISHMENT | Autorisation d'exploitation (ARS) | Recommandé | Annuelle |

### Desktop vs Mobile
| Aspect | Desktop | Mobile |
|--------|---------|--------|
| TrustChecklist | Widget bento dans le dashboard | Card full-width |
| /account Documents | Section avec drop zones côte à côte | Stack vertical, 1 drop zone par document |
| Drop zone | Drag & drop + clic | Clic uniquement (camera ou fichier) |
| Admin review | Table avec preview inline | Cards empilées |

### États vides
| Contexte | Message | CTA |
|----------|---------|-----|
| 0 documents | "Aucun document fourni. Complétez votre dossier pour être vérifié." | **Ajouter un document** |
| Document expiré | "Votre attestation RC Pro a expiré. Merci d'en fournir une nouvelle." | **Mettre à jour** |
| Admin — 0 documents à vérifier | "Aucun document en attente." | — |

### États erreur
| Erreur | Affichage | Recovery |
|--------|-----------|----------|
| Fichier trop gros (413) | "Fichier trop volumineux (max 10 Mo)." | Compresser et ré-uploader |
| Type MIME invalide | "Format non supporté. PDF, JPG ou PNG uniquement." | — |
| Upload timeout | "L'upload a échoué. Vérifiez votre connexion." | Retry |
| Document rejeté par admin | Statut "Rejeté" + motif. | Bouton **Renvoyer** |
| Storage R2 indisponible | "Service temporairement indisponible." | Retry |

### CTA principal
**"Ajouter un document"** — bouton par type dans la section Documents.

### KPI associé
| KPI | Mesure | Cible |
|-----|--------|-------|
| Document upload rate | % freelances avec ≥ 1 document uploadé à J+7 | > 50% |
| Full compliance rate | % freelances avec tous les docs obligatoires vérifiés | > 30% à J+30 |
| Admin review time | Temps entre upload et vérification/rejet | < 48h |
| Trust score impact | Corrélation entre trust score et taux de recrutement | Positif |

### Risques / Edge cases
- **Document falsifié** : la vérification est manuelle (admin). Pas de vérification automatique OCR. Futur : API vérification SIRET, validation diplôme via RPPS.
- **Document expiré non détecté** : la RC Pro expire chaque année. Prévoir un cron job qui détecte les expirations et notifie l'utilisateur + bloque les candidatures si expiré depuis > 30j.
- **Upload depuis mobile camera** : l'input file doit accepter `capture="camera"` sur mobile pour permettre la photo directe du document.
- **RGPD** : les documents sont des données sensibles. Chiffrement au repos dans R2 + suppression sur demande. Durée de conservation : 3 ans après dernière activité.
- **Admin overwhelmed** : si 50 freelances s'inscrivent en même temps, 50 × 3 documents = 150 vérifications. Prioriser : vérifier les freelances qui ont déjà des candidatures en attente.

---

## Synthèse — Matrice des dépendances

```
Flow 1 (Inscription ESTAB)    ─┐
Flow 2 (Inscription FREE)     ─┤──► Pré-requis : T-001 (bugfixes), T-020+ (profil)
                                │
Flow 3 (Renfort classique)     ─┤──► Pré-requis : T-080+ (missions améliorées)
Flow 4 (Renfort urgence)       ─┘
                                │
Flow 5 (Matching)              ─┤──► Pré-requis : T-022 (profil public), T-082 (reject)
Flow 6 (Candidature)           ─┤
Flow 7 (Confirmation)          ─┤──► Pré-requis : T-006 (credits race fix)
                                │
Flow 8 (Complétion + facture)  ─┤──► Pré-requis : T-001 (bug B4/B6), T-070+ (Stripe)
                                │
Flow 9 (Reviews)               ─┤──► Pré-requis : T-030+ (module reviews)
                                │
Flow 10 (Catalogue ateliers)   ─┤──► Pré-requis : T-011 (pagination), T-086 (filtres)
Flow 11 (Réservation atelier)  ─┤──► Pré-requis : T-087 (capacity check)
Flow 12 (Mes ateliers)         ─┤──► Pré-requis : T-083/84/85 (CRUD services)
                                │
Flow 13 (Messaging)            ─┤──► Pré-requis : T-040+ (module messaging + WebSocket)
                                │
Flow 14 (Documents)            ─┘──► Pré-requis : T-060+ (module uploads)
```

## Synthèse — Priorité d'implémentation

| Priorité | Flows | Justification |
|----------|-------|---------------|
| **P0 — Critique** | 1, 2, 3, 6, 7, 8 | Core loop : inscription → publication → candidature → confirmation → paiement |
| **P1 — Important** | 4, 5, 9, 13 | Différenciateurs : urgence, matching, reviews, messaging |
| **P2 — Nécessaire** | 10, 11, 12 | Pilier Ateliers complet |
| **P3 — Confiance** | 14 | Documents et vérification — confiance, compliance |
