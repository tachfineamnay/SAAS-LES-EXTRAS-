# PHASE 2 — Design System / UX-UI / Direction Visuelle

> **Produit** : Les-Extras — SaaS spécialisé psycho-éducatif & médico-social de terrain
> **Piliers** : Renfort / Remplacement + Ateliers
> **Vocabulaire** : FREELANCE / ÉTABLISSEMENT
> **Mode** : Light only — pas de dark mode
> **Date** : 14 mars 2026

---

# A. DIRECTION ARTISTIQUE FINALE

## Trois directions évaluées

---

### Direction 1 — « Clinical Warmth »

| | |
|---|---|
| **Intention** | Un design médical assumé mais débarrassé de sa froideur. L'environnement rappelle les bâtiments de soins modernes : blanc, bois clair, touches de vert. La confiance passe par l'ordre et la prévisibilité. |
| **Palette** | Blanc pur + gris doux + vert sauge principal + bleu glacier accent + bois clair (sand) en surfaces |
| **Typo** | Inter (body) + DM Sans (titles) — arrondis, lisibilité médicale |
| **Personnalité** | Hôpital de jour rénové. Sobre, propre, rassurant. Peu d'ornement. |
| **Risque** | ★☆☆ Faible — Trop générique, ressemble à une mutuelle ou un EHR. Manque de différenciation et de chaleur humaine. |
| **Pertinence** | ▓▓▓░░ 3/5 — Le secteur médico-social a besoin de chaleur en plus de la rigueur. Trop clinique pour les ateliers et la relation humaine. |

---

### Direction 2 — « Quietly Bold » ← **SÉLECTIONNÉE**

| | |
|---|---|
| **Intention** | Allier la rigueur institutionnelle à une chaleur terraine. Le produit inspire confiance immédiate (teal profond, structure claire) tout en transmettant l'énergie du terrain (terracotta, sable chaud). Chaque interaction est lisible, rapide, sans décoration superflue. Le design peut « monter en intensité » pour l'urgence renfort sans perdre sa stabilité. |
| **Palette** | Ivoire chaud (fond) + Teal profond (nav, confiance) + Terracotta (CTA, urgence) + Sable doré (accueil, onboarding) + Émeraude (succès) + Ambre (avertissement) |
| **Typo** | Plus Jakarta Sans (display/headings — géométrique avec personnalité) + Inter (body — neutre, lisible, standard) |
| **Personnalité** | Directrice d'établissement expérimentée : calme, structurée, chaleureuse, mais capable de réagir vite en situation d'urgence. |
| **Risque** | ★★☆ Modéré — Le terracotta doit être dosé pour ne pas verser dans le « lifestyle ». Le teal profond doit garder assez de contraste sur les fonds ivoire. |
| **Pertinence** | ▓▓▓▓▓ 5/5 — Parfait équilibre confiance/chaleur. Le teal ancre l'institutionnel, le terracotta active l'urgence renfort, le sable accueille les freelances en onboarding. Fonctionne en mobile, en urgence et en consultation calme. |

---

### Direction 3 — « Sunrise Studio »

| | |
|---|---|
| **Intention** | Un design plus expressif, lumineux, orienté « communauté de pros ». Ambiance startup sociale bienveillante avec des couleurs chaudes dominantes et des illustrations organiques. |
| **Palette** | Pêche clair (fond) + Orange vif (primary) + Violet doux (accent) + Vert menthe (succès) + Crème |
| **Typo** | Satoshi (display) + General Sans (body) — typos modernes, très startup |
| **Personnalité** | Collectif de freelances créatifs. Dynamique, ouvert, communautaire. |
| **Risque** | ★★★ Élevé — Trop « startup tech » pour des cadres d'établissements médico-sociaux. Le violet et l'orange vif ne transmettent pas la confiance institutionnelle requise. Risque de ne pas être pris au sérieux par les directeurs d'EHPAD ou de MECS. |
| **Pertinence** | ▓▓░░░ 2/5 — Inadapté au secteur. Les décideurs du médico-social attendent de la sobriété et de la fiabilité, pas une esthétique Dribbble. |

---

## Direction retenue : « Quietly Bold »

**Raisons du choix :**

1. **Confiance terrain** — Le teal profond (170° 55% 30%) est perçu comme institutionnel et médical sans être froid. Il ancre la navigation et signifie « système fiable ».
2. **Urgence calibrée** — Le terracotta (14° 65% 48%) est suffisamment « chaud urgence » pour les boutons SOS Renfort sans être agressif. C'est un orange brûlé, pas un rouge d'alerte.
3. **Chaleur humaine** — Le fond ivoire (36° 25% 96%) et le sable (32° 75% 50%) réchauffent chaque écran. On n'est pas dans un tableur — on est dans un lieu de travail humain.
4. **Dualité Renfort/Ateliers** — Le teal porte le pilier Renfort (structure, confiance, urgence maîtrisée) ; le sable et le violet portent le pilier Ateliers (progression, créativité, compétences).
5. **Mobile-first opérationnel** — Les contrastes sont calculés pour WCAG AA minimum. Les interactive targets sont ≥44px. La densité d'information s'adapte par breakpoint.
6. **Personnalité typographique** — Plus Jakarta Sans a juste assez de caractère (géométrie arrondie) pour se distinguer d'un outil médical générique, sans verser dans le fantaisiste.

---

# B. DESIGN SYSTEM FOUNDATIONS

## B.1 — Color Tokens

### Primitive Tokens (valeurs brutes HSL)

```
/* ── Page ── */
--color-white:             0 0% 100%
--color-ivory:             36 25% 96%
--color-cream:             36 18% 93%

/* ── Teal scale (primary) ── */
--color-teal-50:           170 45% 96%
--color-teal-100:          170 45% 92%
--color-teal-200:          170 48% 82%
--color-teal-300:          170 50% 62%
--color-teal-400:          170 50% 42%
--color-teal-500:          170 55% 30%      ← brand primary
--color-teal-600:          170 52% 25%
--color-teal-700:          170 48% 22%
--color-teal-800:          170 45% 16%
--color-teal-900:          170 42% 11%

/* ── Coral / Terracotta scale (action) ── */
--color-coral-50:          14 80% 96%
--color-coral-100:         14 80% 94%
--color-coral-200:         14 72% 85%
--color-coral-300:         14 68% 72%
--color-coral-400:         14 65% 58%
--color-coral-500:         14 65% 48%       ← brand action
--color-coral-600:         14 60% 42%
--color-coral-700:         14 58% 36%
--color-coral-800:         14 52% 28%
--color-coral-900:         14 48% 20%

/* ── Sand scale (warmth) ── */
--color-sand-50:           32 80% 96%
--color-sand-100:          32 80% 93%
--color-sand-200:          32 75% 84%
--color-sand-300:          32 72% 72%
--color-sand-400:          32 72% 60%
--color-sand-500:          32 75% 50%       ← brand warmth
--color-sand-600:          32 70% 44%
--color-sand-700:          32 68% 40%

/* ── Navy scale (text) ── */
--color-navy-50:           220 20% 96%
--color-navy-100:          220 18% 90%
--color-navy-200:          220 15% 76%
--color-navy-300:          220 15% 60%
--color-navy-400:          220 15% 46%
--color-navy-500:          222 20% 35%
--color-navy-600:          222 30% 24%
--color-navy-700:          222 38% 18%
--color-navy-800:          222 42% 14%
--color-navy-900:          222 47% 11%      ← foreground

/* ── Logo Gray ── */
--color-gray-400:          220 9% 55%       ← #878B97
--color-gray-100:          220 14% 93%

/* ── Violet (ateliers, compétences) ── */
--color-violet-50:         258 90% 97%
--color-violet-100:        258 90% 95%
--color-violet-500:        258 68% 62%
--color-violet-700:        258 58% 48%

/* ── Status: Emerald ── */
--color-emerald-50:        145 76% 95%
--color-emerald-100:       145 76% 91%
--color-emerald-500:       145 62% 42%
--color-emerald-700:       145 55% 32%

/* ── Status: Amber ── */
--color-amber-50:          38 100% 96%
--color-amber-100:         38 100% 93%
--color-amber-500:         38 95% 52%
--color-amber-700:         38 80% 40%

/* ── Status: Red ── */
--color-red-50:            0 86% 97%
--color-red-100:           0 86% 94%
--color-red-500:           0 76% 56%
--color-red-700:           0 68% 44%
```

### Semantic Tokens (rôles fonctionnels)

```
/* ── Surfaces ── */
--background:              var(--color-ivory)
--foreground:              var(--color-navy-900)
--surface-primary:         var(--color-white)           /* cards, modals */
--surface-secondary:       var(--color-cream)           /* sections, stripes */
--surface-raised:          var(--color-white)           /* popovers, tooltips */
--surface-overlay:         var(--color-navy-900) / 0.5  /* backdrop */

/* ── Text ── */
--text-primary:            var(--color-navy-900)        /* titres, body principal */
--text-secondary:          var(--color-navy-400)        /* descriptions, meta */
--text-tertiary:           var(--color-navy-300)        /* placeholders, hints */
--text-disabled:           var(--color-navy-200)
--text-inverse:            var(--color-white)
--text-link:               var(--color-teal-500)
--text-link-hover:         var(--color-teal-600)

/* ── Interactive ── */
--interactive-primary:     var(--color-teal-500)        /* boutons primary, liens nav */
--interactive-primary-hover: var(--color-teal-600)
--interactive-primary-active: var(--color-teal-700)

--interactive-action:      var(--color-coral-500)       /* CTA, urgence, renfort */
--interactive-action-hover: var(--color-coral-600)
--interactive-action-active: var(--color-coral-700)

--interactive-warm:        var(--color-sand-500)        /* boutons secondaires ateliers */
--interactive-warm-hover:  var(--color-sand-600)

/* ── Borders ── */
--border-default:          var(--color-navy-50) with 86% lightness  /* 36 15% 86% */
--border-strong:           var(--color-navy-200)
--border-focus:            var(--color-teal-500)
--border-error:            var(--color-red-500)

/* ── Status ── */
--status-success:          var(--color-emerald-500)
--status-success-bg:       var(--color-emerald-50)
--status-warning:          var(--color-amber-500)
--status-warning-bg:       var(--color-amber-50)
--status-error:            var(--color-red-500)
--status-error-bg:         var(--color-red-50)
--status-info:             var(--color-teal-500)
--status-info-bg:          var(--color-teal-50)

/* ── Brand semánticos ── */
--brand-renfort:           var(--color-coral-500)       /* pilier Renfort */
--brand-renfort-bg:        var(--color-coral-50)
--brand-atelier:           var(--color-violet-500)      /* pilier Ateliers */
--brand-atelier-bg:        var(--color-violet-50)
--brand-trust:             var(--color-teal-500)        /* confiance, vérification */
--brand-trust-bg:          var(--color-teal-50)

/* ── Focus ring ── */
--ring-default:            var(--color-teal-500) / 0.5
--ring-offset:             var(--color-white)
--ring-width:              2px
--ring-offset-width:       2px
```

---

## B.2 — Typography Scale

**Font stack :**
- **Display / Headings** : Plus Jakarta Sans 700–800
- **Body / UI** : Inter 400–600

| Token | Size | Line-height | Weight | Letter-spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| `display-2xl` | 3rem (48px) | 1.08 | 800 | -0.03em | Landing hero |
| `display-xl` | 2.5rem (40px) | 1.1 | 800 | -0.03em | Page hero |
| `display-lg` | 2rem (32px) | 1.15 | 700 | -0.025em | Section hero |
| `heading-xl` | 1.5rem (24px) | 1.25 | 700 | -0.02em | Page titles, card headers |
| `heading-lg` | 1.25rem (20px) | 1.3 | 600 | -0.015em | Section titles |
| `heading-md` | 1.125rem (18px) | 1.35 | 600 | -0.01em | Card titles, widget headers |
| `heading-sm` | 1rem (16px) | 1.4 | 600 | -0.01em | Sub-sections |
| `body-lg` | 1rem (16px) | 1.6 | 400 | 0 | Body principal |
| `body-md` | 0.875rem (14px) | 1.55 | 400 | 0 | UI text, form labels |
| `body-sm` | 0.8125rem (13px) | 1.5 | 400 | 0 | Captions, meta info |
| `caption` | 0.75rem (12px) | 1.4 | 500 | 0.02em | Badges, timestamps, status |
| `overline` | 0.6875rem (11px) | 1.3 | 600 | 0.08em | Overlines, labels uppercase |

**Règles :**
- Les `display-*` et `heading-*` utilisent `font-display` (Plus Jakarta Sans)
- Les `body-*` et `caption` utilisent `font-sans` (Inter)
- `overline` est en uppercase, toujours Inter
- Sur mobile (< 640px), `display-2xl` → 2.25rem, `display-xl` → 2rem, `display-lg` → 1.75rem

---

## B.3 — Spacing Scale

Base unit : **4px**. Tous les espacements sont des multiples de 4.

| Token | Value | Usage typique |
|-------|-------|---------------|
| `space-0` | 0px | Reset |
| `space-0.5` | 2px | Micro-ajustement (icon gap)) |
| `space-1` | 4px | Inline icon spacing, badge padding-y |
| `space-1.5` | 6px | Tight padding (status pills) |
| `space-2` | 8px | Icon-to-text gap, input padding-y |
| `space-3` | 12px | Card inner gap, small section gap |
| `space-4` | 16px | Default padding, form field gap |
| `space-5` | 20px | Card padding, sidebar item height |
| `space-6` | 24px | Section gap interne |
| `space-8` | 32px | Card padding large, section gap |
| `space-10` | 40px | Section margin |
| `space-12` | 48px | Page section gap |
| `space-16` | 64px | Hero padding |
| `space-20` | 80px | Landing section gap |
| `space-24` | 96px | Page top padding with navbar |

**Density rules :**
- **Compact** (mobile, tables, listes) : padding = `space-3` (12px), gap = `space-2` (8px)
- **Default** (desktop cards, formulaires) : padding = `space-5` (20px), gap = `space-4` (16px)
- **Relaxed** (landing, hero, onboarding) : padding = `space-8–16`, gap = `space-6–12`

---

## B.4 — Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Jamais utilisé (sauf tables internes) |
| `radius-sm` | 6px | Badges, status pills, inner elements |
| `radius-md` | 8px | Inputs, buttons small, table cells |
| `radius-lg` | 12px | Cards, dropdowns, modals (base `--radius`) |
| `radius-xl` | 16px | Feature cards, onboarding panels |
| `radius-2xl` | 20px | Hero cards, prominent CTAs |
| `radius-3xl` | 24px | Landing sections, glass panels |
| `radius-full` | 9999px | Avatars, pills, circular buttons |

**Règle directrice :** Les éléments conteneurs (cards, modals) ont un radius plus grand que leurs éléments internes (inputs, buttons). Ratio parent:enfant ≈ 1.5:1.

---

## B.5 — Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-xs` | `0 1px 2px hsl(220 25% 15% / 0.04)` | Inputs au repos, séparateurs subtils |
| `shadow-sm` | `0 1px 3px hsl(220 25% 15% / 0.05), 0 4px 12px hsl(220 25% 15% / 0.05)` | Cards au repos |
| `shadow-md` | `0 2px 8px hsl(220 25% 15% / 0.06), 0 8px 24px hsl(220 25% 15% / 0.07)` | Cards hover, dropdowns |
| `shadow-lg` | `0 4px 16px hsl(220 25% 15% / 0.08), 0 16px 48px hsl(220 25% 15% / 0.09)` | Modals, drawers |
| `shadow-xl` | `0 8px 32px hsl(220 25% 15% / 0.10), 0 2px 8px hsl(220 25% 15% / 0.07)` | Spotlight cards, popovers flottants |
| `shadow-focus-teal` | `0 0 0 3px hsl(170 45% 92%), 0 4px 20px hsl(170 55% 30% / 0.22)` | Focus ring teal |
| `shadow-focus-coral` | `0 0 0 3px hsl(14 80% 94%), 0 4px 20px hsl(14 65% 48% / 0.22)` | Focus ring coral |

**Règle :** Les ombres sont toujours en `hsl(220 25% 15%)` (navy teinté), jamais en `rgba(0,0,0,...)` pur. Cela intègre une chaleur dans les ombres qui s'harmonise avec le fond ivoire.

---

## B.6 — Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-default` | `1px solid hsl(var(--border))` | Cards, inputs, séparateurs |
| `border-strong` | `1px solid hsl(var(--color-navy-200))` | Conteneurs imbriqués, tables |
| `border-subtle` | `1px solid hsl(var(--border) / 0.5)` | Séparateurs internes légers |
| `border-focus` | `2px solid hsl(var(--color-teal-500))` | État focus |
| `border-error` | `1px solid hsl(var(--color-red-500))` | Validation erreur |
| `border-success` | `1px solid hsl(var(--color-emerald-500))` | Validation succès |
| `border-brand-teal` | `1px solid hsl(var(--color-teal-500) / 0.2)` | Containers tintés teal |
| `border-brand-coral` | `1px solid hsl(var(--color-coral-500) / 0.2)` | Containers tintés coral |

---

## B.7 — Breakpoints & Grid

### Breakpoints

| Token | Value | Cible |
|-------|-------|-------|
| `sm` | 640px | Mobile paysage |
| `md` | 768px | Tablette portrait |
| `lg` | 1024px | Tablette paysage / petit desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Grand écran |

### Grid System

- **Container max-width** : 1400px avec `padding: 2rem`
- **Grid colonnes** :
  - Mobile (`< sm`) : 4 colonnes, gutter 16px, marge 16px
  - Tablet (`sm–lg`) : 8 colonnes, gutter 24px, marge 24px
  - Desktop (`lg+`) : 12 colonnes, gutter 24px, marge 32px
- **Layout principal dashboard** :
  - Sidebar fixe : 256px (desktop), drawer (mobile)
  - Content : `1fr` restant, max 1144px

---

## B.8 — Motion Tokens

### Durées

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 100ms | Tooltips, hover color |
| `duration-fast` | 150ms | Button press, toggle |
| `duration-normal` | 250ms | Dropdowns, cards hover translate |
| `duration-slow` | 350ms | Modals, drawers, page transitions |
| `duration-slower` | 500ms | Fade-up entrance, skeleton reveal |

### Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions générales |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Sortie d'éléments |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrée d'éléments |
| `ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Rebond naturel — cards, modals |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-interactions (badge pop, toast) |

### Animations prédéfinies

| Nom | Description |
|-----|-------------|
| `fade-up` | translateY(12px) → 0, opacity 0 → 1, 500ms spring — Entrée de cards, sections |
| `fade-in` | opacity 0 → 1, 300ms ease — Contenus légers |
| `scale-in` | scale(0.95) → 1, opacity 0 → 1, 300ms spring — Modals, popovers |
| `slide-in-left` | translateX(-16px) → 0, opacity 0 → 1, 350ms spring — Sidebar, drawers |
| `shimmer` | translateX(-100%) → 100%, 1.8s infinite — Skeletons |

**Règle :** `prefers-reduced-motion: reduce` désactive toutes les animations sauf `opacity`. Les `duration` passent à 0ms.

---

## B.9 — Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Contenu normal |
| `z-raised` | 10 | Cards avec hover, éléments surélevés |
| `z-dropdown` | 100 | Dropdowns, selects, popovers |
| `z-sticky` | 200 | Header sticky, sidebar |
| `z-overlay` | 300 | Backdrop modal/drawer |
| `z-modal` | 400 | Modals, dialogs |
| `z-drawer` | 400 | Drawers (même niveau modal) |
| `z-toast` | 500 | Toasts, notifications |
| `z-tooltip` | 600 | Tooltips |
| `z-max` | 9999 | Urgence (loading overlay global) |

---

## B.10 — Density Rules

| Contexte | Padding card | Gap interne | Font body | Touch target |
|----------|-------------|-------------|-----------|-------------|
| **Compact** (mobile, listes, tables) | 12px | 8px | 13px | 44px min |
| **Default** (desktop, formulaires) | 20px | 16px | 14px | 36px min |
| **Relaxed** (landing, hero, onboarding) | 32–64px | 24–48px | 16px | 48px min |

**Règle mobile :** Sur `< 640px`, tous les interactive targets (boutons, liens, checkboxes) ont une zone tactile minimum de 44×44px, même si l'élément visuel est plus petit (padding invisible étendu).

---

# C. COMPOSANTS PRIORITAIRES

---

## C.1 — Button

**Rôle :** Action principale ou secondaire déclenchée par l'utilisateur.

### Variantes

| Variante | Background | Text | Border | Usage |
|----------|-----------|------|--------|-------|
| `primary` | teal-500 | white | none | Actions structurelles : valider, confirmer, naviguer |
| `action` / `coral` | coral-500 | white | none | CTA urgentes : publier renfort, postuler, réserver |
| `secondary` | transparent | teal-500 | 1px teal-500/20 | Actions secondaires : filtrer, rafraîchir |
| `ghost` | transparent | navy-400 | none | Actions tertiaires : annuler, retour |
| `destructive` | red-500 | white | none | Supprimer, annuler mission |
| `warm` | sand-100 | sand-700 | 1px sand-500/20 | Ateliers : parcourir, consulter |
| `outline` | transparent | foreground | 1px border | Neutre : actions contextuelles |

### Tailles

| Taille | Height | Padding-x | Font | Icon size |
|--------|--------|-----------|------|-----------|
| `xs` | 28px | 10px | 12px / caption | 14px |
| `sm` | 32px | 14px | 13px / body-sm | 16px |
| `md` | 40px | 20px | 14px / body-md | 18px |
| `lg` | 48px | 24px | 16px / body-lg | 20px |
| `xl` | 56px | 32px | 16px / body-lg 600w | 22px |

### États

| État | Comportement |
|------|-------------|
| **Default** | Repos — couleur pleine, cursor pointer |
| **Hover** | Lightness -5%, shadow-xs apparaît, transition 150ms |
| **Active / Pressed** | Lightness -10%, scale(0.97), transition 80ms |
| **Focus** | Ring de 2px `ring-default`, offset 2px |
| **Disabled** | Opacity 0.5, cursor-not-allowed, pas de hover |
| **Loading** | Contenu remplacé par spinner, disabled implicite, largeur fixée |

### Mobile
- Taille minimum `md` (40px) sur mobile
- Full-width (`w-full`) dans les formulaires et modals mobiles
- Quand 2 boutons côte à côte en mobile : stack vertical si `< 400px`

### Accessibilité
- Toujours un `aria-label` si icon-only
- `aria-busy="true"` + `aria-disabled="true"` en loading
- Focus visible ring obligatoire (pas de `outline: none` sans anneau)
- Contraste texte/fond ≥ 4.5:1 (AA)

### Do / Don't
- ✅ Un seul bouton `action` (coral) par écran/section visible
- ✅ Le bouton le plus important est à droite (ou en bas sur mobile)
- ❌ Ne pas utiliser `destructive` pour des actions réversibles
- ❌ Ne pas mettre 2 boutons `primary` au même niveau visuel
- ❌ Ne pas utiliser `ghost` pour une action critique

---

## C.2 — Input

**Rôle :** Saisie de texte, email, mot de passe, nombre.

### Variantes
- `default` — Input standard avec label flottant ou fixe
- `with-icon` — Icône à gauche (ex: recherche, email)
- `with-addon` — Texte/select collé à gauche ou droite (ex: €, https://)
- `textarea` — Multi-lignes, min-height 100px

### États

| État | Visuels |
|------|---------|
| **Rest** | Border `border-default`, bg `surface-primary`, text `text-secondary` (placeholder) |
| **Focused** | Border `border-focus` (teal), ring `shadow-focus-teal`, label color teal |
| **Filled** | Border `border-default`, text `text-primary`, label reste visible (réduit) |
| **Error** | Border `border-error`, anneau rouge léger, message erreur en dessous en red-500 |
| **Disabled** | Bg `cream`, text `text-disabled`, cursor-not-allowed |
| **Read-only** | Bg `cream`, border-default, cursor-default, pas de focus ring |

### Dimensions
- Height : 44px (mobile), 40px (desktop)
- Padding : 12px horizontal, 8px vertical
- Font : body-md (14px)
- Label : body-sm (13px) au-dessus ou caption (12px) en mode flottant

### Mobile
- Touch target 44px garanti
- Pas de label flottant en mobile (trop petit) — label fixe au-dessus toujours
- Input type adapté (`inputmode="numeric"`, `type="email"`, etc.)

### Accessibilité
- `<label>` associé via `htmlFor`/`id` toujours
- `aria-describedby` vers le message d'erreur
- `aria-invalid="true"` en état erreur
- Contraste placeholder ≥ 3:1 (relaxed AA pour texte large)

### Do / Don't
- ✅ Toujours un label visible (pas de placeholder-only)
- ✅ Message d'erreur sous le champ, pas en tooltip
- ❌ Ne pas désactiver le zoom mobile sur les inputs
- ❌ Ne pas utiliser `readonly` pour cacher une saisie — utiliser `disabled`

---

## C.3 — Select

**Rôle :** Choix unique dans une liste fermée.

### Variantes
- `default` — Select natif Radix avec chevron
- `with-icon` — Icône catégorie à gauche
- `inline` — Select compact dans une toolbar/filter bar

### États : identiques à Input

### Contenu dropdown
- Max-height : 300px avec scroll
- Items : 40px height, padding 12px
- Groupes : label `overline` en haut de groupe
- Item sélectionné : bg `teal-50`, checkmark à droite

### Mobile : Utiliser la sheet native (drawer bottom) pour les selects avec > 6 options

### Accessibilité
- Navigation clavier complète (↑↓, Enter, Escape, Type-ahead)
- `role="listbox"` sur le dropdown, `role="option"` sur les items
- `aria-expanded`, `aria-selected`

---

## C.4 — Combobox

**Rôle :** Recherche + sélection dans une liste longue (villes, compétences, diplômes).

### Variantes
- `single` — Un seul choix
- `multi` — Choix multiples, chips/tags affichés dans l'input
- `creatable` — Permet de créer une nouvelle entrée

### Comportement
- Debounce recherche : 300ms
- Minimum 2 caractères avant filtrage
- Afficher « Aucun résultat » si vide après recherche
- Items : même style que Select dropdown
- Tags (multi) : badge `sm` avec bouton ×, max 5 visibles puis « +N autres »

### Mobile : Ouvre un drawer full-height avec un input de recherche en haut sticky

### Accessibilité : `role="combobox"`, `aria-autocomplete="list"`, navigation ↑↓

---

## C.5 — Modal (Dialog)

**Rôle :** Interaction bloquante nécessitant une décision ou un formulaire.

### Variantes
- `default` — 480px max-width, centrée
- `large` — 640px max-width — formulaires complexes, aperçus
- `full` — 90vw × 90vh — comparaisons, tableaux

### Structure
```
┌─ Header ──────────────────────────────┐
│  Title (heading-lg)     [×] Close     │
│  Description (body-sm, text-secondary)│
├─ Content ─────────────────────────────┤
│                                       │
│  Contenu scrollable si overflow       │
│                                       │
├─ Footer ──────────────────────────────┤
│              [Secondary]  [Primary]   │
└───────────────────────────────────────┘
```

### États
- **Ouverture** : `scale-in` (0.95→1, opacity, 300ms spring), backdrop fade-in
- **Fermeture** : opacity out 150ms, scale 1→0.98
- **Backdrop** : `navy-900/50`, clic externe ferme (sauf si `preventClose`)

### Mobile
- `< 640px` : la modal devient un drawer bottom full-width, `border-radius-top: 24px`
- Le footer est sticky en bas
- Le contenu scroll entre header et footer

### Accessibilité
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` vers le titre
- Focus trap : le focus reste dans la modal
- `Escape` ferme la modal
- Restauration du focus à l'élément déclencheur après fermeture

---

## C.6 — Drawer (Sheet)

**Rôle :** Panneau latéral (desktop) ou bottom-sheet (mobile) pour des actions secondaires ou des détails.

### Variantes
- `right` — Desktop default, 400px width
- `bottom` — Mobile default, 85vh max-height
- `left` — Sidebar navigation mobile

### Structure : identique à Modal (Header / Content scrollable / Footer sticky)

### Comportement
- **Bottom (mobile)** : Drag-to-dismiss (swipe down), snap points à 50% et 85%
- **Right (desktop)** : Slide-in-right, 350ms spring
- Backdrop identical à Modal

### Accessibilité : identique à Modal

---

## C.7 — Card

**Rôle :** Conteneur d'information ou d'action. Unité de base de toutes les interfaces.

### Variantes

| Variante | Style | Usage |
|----------|-------|-------|
| `default` | bg white, border, shadow-sm, radius-lg | Info standard |
| `interactive` | + hover:shadow-md, hover:-translate-y-0.5, cursor-pointer | Cliquable |
| `elevated` | shadow-md, pas de border | Mise en avant |
| `tinted-teal` | bg teal-50, border teal/0.16 | Confiance, verification |
| `tinted-coral` | bg coral-50, border coral/0.16 | Urgence, renfort |
| `tinted-violet` | bg violet-50, border violet/0.16 | Ateliers |
| `tinted-sand` | bg sand-50, border sand/0.20 | Onboarding, accueil |
| `ghost` | bg transparent, border-dashed | Placeholder, « ajouter » |

### Dimensions
- Padding : `space-5` (20px) desktop, `space-4` (16px) mobile
- Gap interne : `space-3` (12px)
- Border-radius : `radius-lg` (12px)

### Mobile : Cards full-width, pas de grid — liste verticale avec `space-3` gap

---

## C.8 — Renfort Card

**Rôle :** Afficher une mission de renfort/remplacement disponible dans le feed freelance.

### Structure
```
┌─────────────────────────────────────────┐
│ 🔴 URGENT        il y a 2h             │  ← badge urgence + timestamp
│                                         │
│ Aide-soignant(e) de nuit                │  ← titre (heading-md)
│ EHPAD Les Tilleuls · Bordeaux           │  ← établissement · ville
│                                         │
│ 📅 17-19 mars · 🕐 21h–7h · 💰 28€/h  │  ← meta row
│                                         │
│ [Diplôme requis] [Nuit] [Urgent]        │  ← badges compétences
│                                         │
│             [ Voir & Postuler → ]       │  ← CTA coral
└─────────────────────────────────────────┘
```

### Variantes
- `urgent` — Bordure gauche 3px coral, badge « URGENT » coral
- `normal` — Bordure gauche 3px teal, pas de badge urgence
- `closed` — Opacity réduite, badge « Pourvu » emerald, pas de CTA

### États
- **Default** : shadow-sm
- **Hover** : shadow-md, translate-y -1px, bordure gauche s'élargit à 4px
- **Pressed** : shadow-sm, translate-y 0

### Mobile : Full-width, stack vertical, meta row wraps sur 2 lignes

### Accessibilité
- `article` sémantique avec `aria-label` du titre complet
- Badge urgence : `aria-label="Mission urgente"`
- CTA cliquable clairement identifié

---

## C.9 — Freelance Card

**Rôle :** Présenter un freelance disponible dans le catalogue establishment.

### Structure
```
┌─────────────────────────────────────────┐
│  [Avatar]  Marie D.           ⭐ 4.8   │  ← identité + rating
│            Aide-soignante DE            │  ← titre pro
│            Bordeaux · Disponible        │  ← lieu + dispo
│                                         │
│  [Nuit] [Gériatrie] [DE validé]        │  ← badges compétences
│                                         │
│  12 missions · Membre depuis janv. 2025 │  ← social proof
│                                         │
│  [ Voir le profil ]  [ Proposer ↗ ]    │  ← actions
└─────────────────────────────────────────┘
```

### Variantes
- `available` — Badge vert « Disponible »
- `busy` — Badge gris « En mission »
- `verified` — Checkmark teal sur l'avatar
- `compact` — Version réduite pour les listes (pas de badges compétences)

### États : identiques à Card interactive

### Mobile : Full-width, avatar + nom sur une ligne, badges wrap

---

## C.10 — Atelier Card

**Rôle :** Afficher un atelier proposé par un freelance.

### Structure
```
┌─────────────────────────────────────────┐
│  🎓                                     │
│  Atelier Montessori pour EHPAD          │  ← titre
│  par Sarah K. · ⭐ 4.9                  │  ← freelance + rating
│                                         │
│  Initiation aux principes Montessori    │  ← description 2 lignes max
│  adaptés aux personnes âgées.           │
│                                         │
│  📅 Sessions dispo · 2h · 450€         │  ← meta
│  [Gériatrie] [Montessori]              │  ← tags
│                                         │
│  [ En savoir plus ]  [ Réserver ]       │  ← actions
└─────────────────────────────────────────┘
```

### Variantes
- `default` — Bordure violette légère à gauche
- `featured` — Shadow-md, badge « Recommandé » sand
- `booked` — Badge « Réservé » teal, CTA disparaît

### Tint : `tinted-violet` (bg violet-50)

### Mobile : Full-width, description truncated à 1 ligne

---

## C.11 — Review Card

**Rôle :** Afficher un avis post-mission.

### Structure
```
┌─────────────────────────────────────────┐
│  [Avatar] Jean M.          ⭐⭐⭐⭐⭐  │  ← auteur + étoiles
│           Directeur · EHPAD Bellevue    │  ← rôle + établissement
│                                         │
│  « Marie a géré le service de nuit      │  ← texte review (italic)
│  avec beaucoup de professionnalisme. »  │
│                                         │
│  Mission : AS nuit · Mars 2026          │  ← contexte
└─────────────────────────────────────────┘
```

### Variantes
- `default` — Card standard
- `compact` — Inline : avatar mini + étoiles + texte truncated 1 ligne
- `highlight` — Tinted-sand, pour la landing page

### Mobile : Full-width, texte review max 3 lignes avec « Lire la suite »

---

## C.12 — Empty State

**Rôle :** Communiquer l'absence de données avec contexte, guidance et action.

### Structure
```
┌─────────────────────────────────────────┐
│            [ Icône 48px ]               │
│                                         │
│      Titre explicatif (heading-md)      │
│  Description contextuelle (body-md,     │
│  text-secondary, max 2 lignes)          │
│                                         │
│         [ Action principale ]           │
│                                         │
│  💡 Tip optionnel (caption, italic)     │
└─────────────────────────────────────────┘
```

### Variantes
- `default` — Icône grise, fond transparent
- `tinted` — Fond teal-50 ou sand-50 selon contexte
- `illustration` — SVG illustratif au lieu d'icône (si disponible)

### Règle : Toujours proposer une action. Jamais juste « Aucun résultat. »

---

## C.13 — Skeleton

**Rôle :** Placeholder visuel pendant le chargement. Préserve le layout et réduit le CLS.

### Variantes
- `text` — Rectangle arrondi, hauteur 14–20px, largeur variable (60–80%)
- `heading` — Rectangle arrondi, hauteur 24–32px, largeur 50%
- `avatar` — Cercle 40–48px
- `card` — Rectangle plein radius-lg, 100% width, hauteur fixe
- `button` — Rectangle radius-md, même dimensions que le bouton attendu

### Animation : `shimmer` — dégradé `teal/0.07` traverse de gauche à droite, 1.8s infinite

### Règle : Le skeleton doit exactement reproduire les dimensions du contenu qu'il remplace. Pas de skeleton générique « block gris ».

---

## C.14 — Badge

**Rôle :** Label catégoriel ou indicateur de statut compact.

### Variantes

| Variante | Background | Text | Usage |
|----------|-----------|------|-------|
| `default` | navy-50 | navy-500 | Tags neutres (type, catégorie) |
| `teal` | teal-50 | teal-700 | Statut confiance, vérifié |
| `coral` | coral-50 | coral-700 | Urgent, important |
| `sand` | sand-50 | sand-700 | Recommandé, nouveau |
| `violet` | violet-50 | violet-700 | Atelier, compétence |
| `emerald` | emerald-50 | emerald-700 | Succès, validé, disponible |
| `amber` | amber-50 | amber-700 | Avertissement, en attente |
| `red` | red-50 | red-700 | Erreur, annulé |
| `outline` | transparent | foreground | border-default, neutre discret |

### Tailles
- `sm` : height 20px, text caption (12px), padding 6px horizontal
- `md` : height 24px, text body-sm (13px), padding 8px horizontal

### Dot indicator : Option `withDot` — petit cercle 6px de couleur à gauche du label

### Accessibilité : Si le badge transmet une info essentielle (statut), utiliser `aria-label` descriptif

---

## C.15 — Trust Block

**Rôle :** Bloc de réassurance montrant les vérifications et la crédibilité.

### Structure
```
┌─ Trust Block ─────────────────────────────┐
│  ✅ Diplôme vérifié                       │
│  ✅ Casier judiciaire contrôlé            │
│  ✅ 12 missions réalisées                 │
│  ✅ Membre depuis janvier 2025            │
│  ⏳ Assurance RC en cours de vérification │
└───────────────────────────────────────────┘
```

### Variantes
- `inline` — Liste horizontal de badges trusted
- `block` — Card tinted-teal avec checklist verticale
- `compact` — Single line : « ✅ Profil vérifié · 12 missions »

### États des items
- ✅ Vérifié — icône emerald, texte normal
- ⏳ En cours — icône amber, texte secondary
- ❌ Non fourni — icône red, texte secondary

---

## C.16 — Filters (FilterBar)

**Rôle :** Barre de filtres horizontale pour les listes (missions, freelances, ateliers).

### Structure
```
[ 🔍 Recherche...  ] [ Département ▾ ] [ Diplôme ▾ ] [ Type ▾ ] [ ✕ Réinitialiser ]
```

### Comportement
- Filtres : boutons-pills `secondary` qui ouvrent un dropdown/combobox
- Filtre actif : pill teal-50 avec border-teal, texte teal, × pour retirer
- Compteur : « 24 résultats » à droite (desktop) ou en dessous (mobile)
- « Réinitialiser » : `ghost` button, visible uniquement si ≥1 filtre actif

### Mobile
- Les filtres scrollent horizontalement (overflow-x auto)
- Bouton « Filtres (3) » qui ouvre un drawer bottom avec tous les filtres empilés

### Accessibilité : Chaque filtre est un bouton avec `aria-expanded` qui contrôle un listbox

---

## C.17 — Tabs

**Rôle :** Navigation entre vues au même niveau hiérarchique.

### Variantes
- `underline` — Tabs avec indicateur bottom 2px teal (default)
- `pill` — Tabs sous forme de pills bg, actif = teal-500 text-white
- `segment` — Tabs type segmented control, fond muted, actif = white + shadow-xs

### Dimensions
- Height : 40px (desktop), 44px (mobile)
- Gap entre tabs : 4px (pill/segment), 24px (underline)

### Comportement
- Indicateur underline : `transition transform 250ms spring` au changement
- Contenu : `fade-in 200ms` au switch

### Mobile : Si > 4 tabs, scroll horizontal avec fade-out gradient à droite

### Accessibilité : `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, navigation ←→

---

## C.18 — Sidebar

**Rôle :** Navigation principale du dashboard.

### Structure
```
┌──────────────────┐
│  [Logo]           │
│                   │
│  ── PRINCIPAL ──  │
│  📊 Dashboard     │  ← active: bg teal-50, text teal, border-left 3px teal
│  🔍 Marketplace   │
│  📋 Réservations  │
│  💬 Messages      │
│                   │
│  ── GESTION ──    │
│  📄 Devis         │
│  💰 Finances      │
│  👤 Mon profil    │
│                   │
│  ── BAS ──        │
│  ⚙️ Paramètres    │
│  🚪 Déconnexion   │
└──────────────────┘
```

### Dimensions
- Width : 256px fixe (desktop), drawer (mobile)
- Item height : 40px, padding 12px horizontal
- Section label : `overline` (11px), uppercase, text-tertiary, margin-bottom 8px

### États items
- **Default** : text-secondary, hover: bg-muted
- **Active** : bg teal-50, text teal-700, border-left 3px teal-500, font-weight 600
- **With badge** : Indicateur numérique (ex: messages non lus) — badge coral petit à droite

### Mobile : Drawer left, slide-in-left, backdrop, hamburger trigger dans le Header

---

## C.19 — Mobile Bottom Navigation

**Rôle :** Navigation principale en mobile (< 768px), remplace la sidebar.

### Structure
```
┌──────────────────────────────────────────────────┐
│  🏠 Home   🔍 Explorer   ➕   📋 Résa   👤 Profil │
│                          FAB                      │
└──────────────────────────────────────────────────┘
```

### Dimensions
- Height : 64px (+ safe-area-inset-bottom)
- Icon : 24px, label : caption (11px)
- FAB central (➕) : 48px cercle, bg coral-500, shadow-md, -12px translateY

### États
- **Default** : icon + label `text-tertiary`
- **Active** : icon `teal-500`, label `teal-700`, font-weight 600
- **FAB** : Toujours coral, hover: shadow-lg, press: scale(0.95)

### Comportement
- Le FAB ouvre un menu radial ou un action sheet avec les actions rapides (Publier renfort, Proposer atelier)
- La bottom nav se masque au scroll down et réapparaît au scroll up (300ms transition)

### Accessibilité
- `<nav aria-label="Navigation principale">`
- Chaque item : `aria-current="page"` si actif

---

## C.20 — Stepper

**Rôle :** Progression dans un flux multi-étapes (onboarding, publication renfort).

### Structure (horizontal desktop, vertical mobile)
```
  ①───────②───────③───────④
  Profil    Diplômes  Disponibilité  Confirmation
```

### États
- **Completed** : cercle teal-500 avec checkmark blanc + ligne teal
- **Current** : cercle teal-500 avec numéro blanc + ligne grise, label bold
- **Upcoming** : cercle border-default avec numéro gris + ligne grise

### Mobile : Vertical, chaque step est une row avec le contenu en dessous du step courant

### Dimensions
- Cercle : 32px (desktop), 28px (mobile)
- Ligne : 2px height, flex-1
- Label : body-sm, text sous le cercle

---

## C.21 — Toast

**Rôle :** Notification éphémère confirmant une action ou signalant un événement.

### Variantes

| Variante | Icône | Bord gauche | Usage |
|----------|-------|-------------|-------|
| `success` | ✅ emerald | 3px emerald | Action réussie |
| `error` | ❌ red | 3px red | Échec action |
| `warning` | ⚠️ amber | 3px amber | Attention requise |
| `info` | ℹ️ teal | 3px teal | Information |
| `renfort` | 🚨 coral | 3px coral | Nouveau renfort disponible |

### Structure
```
┌──────────────────────────────────────┐
│ ✅  Mission confirmée avec succès.  ×│
│     Vous recevrez un email.          │
└──────────────────────────────────────┘
```

### Comportement
- Position : top-right (desktop), top-center full-width (mobile)
- Entrée : slide-in-left + fade (desktop), slide-down + fade (mobile)
- Durée : 5s par défaut, persistent si action requise
- Stack : max 3 visibles, les suivants remplacent le plus ancien
- Swipe-to-dismiss sur mobile

### Dimensions
- Max-width : 420px (desktop), calc(100vw - 32px) (mobile)
- Padding : 16px, gap 12px icône-to-text
- z-index : `z-toast` (500)

---

## C.22 — Alert Block

**Rôle :** Message contextuel important intégré dans le contenu (pas éphémère contrairement au toast).

### Variantes

| Variante | Background | Border | Icône | Usage |
|----------|-----------|--------|-------|-------|
| `info` | teal-50 | teal/0.2 | ℹ️ teal | Information contextuelle |
| `success` | emerald-50 | emerald/0.2 | ✅ emerald | Confirmation persistante |
| `warning` | amber-50 | amber/0.2 | ⚠️ amber | Avertissement important |
| `error` | red-50 | red/0.2 | ❌ red | Erreur bloquante |
| `renfort` | coral-50 | coral/0.2 | 🚨 coral | Notification renfort |

### Structure
```
┌─ Alert ──────────────────────────────────┐
│ ⚠️  Votre diplôme expire dans 30 jours.  │
│     Mettez à jour votre profil pour      │
│     continuer à recevoir des missions.   │
│                                          │
│     [ Mettre à jour mon profil → ]       │
└──────────────────────────────────────────┘
```

### Options
- `dismissible` : bouton × en haut à droite
- `with-action` : bouton/lien dans le corps du message
- `compact` : padding réduit, single line

---

# D. PATTERNS MÉTIER

---

## D.1 — Publication de Renfort

**Contexte :** Un établissement a besoin d'un professionnel en urgence ou planifié.

### Flow

```
Étape 1 : Type & Urgence
├── Choix : « Renfort urgent (< 48h) » ou « Remplacement planifié »
├── Si urgent : fond coral-50, badge URGENT auto
└── Input : poste recherché (combobox métiers)

Étape 2 : Détails mission  
├── Dates (date picker range)
├── Horaires (select créneaux prédéfinis : Matin / Après-midi / Nuit / Journée)
├── Lieu (adresse autocomplete)
├── Rémunération (input €/h avec suggestion marché)
└── Description libre (textarea, 500 car max)

Étape 3 : Exigences
├── Diplômes requis (combobox multi)
├── Expérience minimum (select : Toute, 1 an+, 3 ans+, 5 ans+)
└── Compétences spécifiques (tags multi)

Étape 4 : Récapitulatif & Publication
├── Card récapitulative (preview de la Renfort Card telle qu'elle sera vue)
├── Estimation reach : « ~12 freelances correspondants dans votre zone »
└── [Publier la mission] (coral, xl) + [Sauvegarder en brouillon] (ghost)
```

### Comportement
- Stepper horizontal (desktop), vertical simplifié (mobile)
- Sauvegarde automatique à chaque étape (draft)
- Si urgent : le bouton publier pulse légèrement (animation `pulse-ring-coral`)
- Après publication : toast success + redirection vers le board de matching

---

## D.2 — Matching Board

**Contexte :** L'établissement visualise les candidatures reçues sur une mission.

### Layout
```
┌── Sidebar filtre ──┬── Board principal ─────────────────────────┐
│                    │                                             │
│  Mission:          │   [Candidature 1]  [Candidature 2]  ...   │
│  AS Nuit 17-19     │                                             │
│  ── Filtres ──     │   Chaque candidature = Freelance Card      │
│  □ Diplôme vérifié │   augmentée de :                           │
│  □ Dispo confirmée │   - Score matching (%)                      │
│  □ Déjà travaillé  │   - Disponibilité confirmée / non          │
│  Tri: Pertinence ▾ │   - [ Proposer → ] [ Refuser ]             │
│                    │                                             │
└────────────────────┴─────────────────────────────────────────────┘
```

### Mobile
- Filtres dans un drawer
- Les candidatures sont en liste verticale full-width
- Actions en swipe (droite = proposer, gauche = refuser) ou boutons en bas de card

### Indicateurs visuels
- Score matching < 60% : badge amber
- Score matching 60–80% : badge teal
- Score matching > 80% : badge emerald + bordure emerald
- « Déjà travaillé avec vous » : badge sand spécial ★

---

## D.3 — Fiche Freelance

**Contexte :** Page profil complète d'un freelance, vue par un établissement.

### Layout (single page, sections empilées)

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar XL]  Marie Dupont                    [ Chat ]  │
│               Aide-soignante DE                         │
│               Bordeaux · ⭐ 4.8 (23 avis)              │
│               ✅ Profil vérifié                          │
├─────────────────────────────────────────────────────────┤
│  SECTION: Trust Block (diplômes, vérifications)          │
├─────────────────────────────────────────────────────────┤
│  SECTION: Compétences & Spécialisations (badges)         │
├─────────────────────────────────────────────────────────┤
│  SECTION: Disponibilités (calendrier semaine)            │
├─────────────────────────────────────────────────────────┤
│  SECTION: Ateliers proposés (Atelier Cards, horizontal)  │
├─────────────────────────────────────────────────────────┤
│  SECTION: Avis (Review Cards, liste ou carousel)         │
├─────────────────────────────────────────────────────────┤
│  SECTION: Historique missions (liste compacte)           │
└─────────────────────────────────────────────────────────┘

CTA sticky bottom (mobile) : [ Proposer une mission ] coral
```

---

## D.4 — Catalogue Ateliers

**Contexte :** Un établissement browse les ateliers disponibles.

### Layout
```
┌── FilterBar : [Catégorie ▾] [Public ▾] [Durée ▾] [🔍 Recherche] ──┐
│                                                                      │
│  Section: « Recommandés pour vous » (2-3 Atelier Cards featured)    │
│                                                                      │
│  Section: « Tous les ateliers » (grid 3 colonnes desktop)           │
│  [Atelier Card] [Atelier Card] [Atelier Card]                       │
│  [Atelier Card] [Atelier Card] [Atelier Card]                       │
│                                                                      │
│  [ Charger plus ] ou scroll infini                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Catégories type
- Montessori, Snoezelen, Médiation animale, Art-thérapie, Psychomotricité, Communication non-violente, Gestion de crise, etc.

### Mobile
- FilterBar horizontale scrollable
- Grid → liste verticale single-column
- Atelier cards en mode compact

---

## D.5 — Fiche Atelier

**Contexte :** Détail complet d'un atelier.

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  🎓 Atelier Montessori pour EHPAD                       │
│  par Sarah K. · ⭐ 4.9 · 18 sessions réalisées         │
├─────────────────────────────────────────────────────────┤
│  SECTION: Description détaillée                          │
│  Objectifs, contenu, méthodologie (body-lg)              │
├─────────────────────────────────────────────────────────┤
│  SECTION: Infos pratiques                                │
│  Durée · Groupe max · Prérequis · Matériel inclus       │
├─────────────────────────────────────────────────────────┤
│  SECTION: Tarification                                   │
│  [Prix session unique] [Prix pack 3] [Prix pack 5]      │
│  Cards tintées avec le meilleur rapport en « Recommandé » │
├─────────────────────────────────────────────────────────┤
│  SECTION: Disponibilités (calendrier ou créneaux)        │
├─────────────────────────────────────────────────────────┤
│  SECTION: Avis sur cet atelier (Review Cards)            │
├─────────────────────────────────────────────────────────┤
│  SECTION: Autres ateliers de Sarah K.                    │
└─────────────────────────────────────────────────────────┘

CTA sticky : [ Réserver une session ] coral + [ Demander un devis ] secondary
```

---

## D.6 — « Mes Ateliers » (freelance)

**Contexte :** Le freelance gère ses ateliers proposés.

### Layout
```
┌── Header ────────────────────────────────────────────────┐
│  Mes Ateliers (3)              [ + Créer un atelier ]    │
├── Tabs ──────────────────────────────────────────────────┤
│  [Actifs] [Brouillons] [Archivés]                        │
├── Liste ─────────────────────────────────────────────────┤
│  ┌─ Atelier Row ────────────────────────────────────┐    │
│  │ Montessori EHPAD · ⭐4.9 · 18 sessions · 450€  │    │
│  │ Actif · Dernière résa il y a 3j                  │    │
│  │                     [Modifier] [Voir stats] [···]│    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [Atelier Row 2]                                         │
│  [Atelier Row 3]                                         │
└──────────────────────────────────────────────────────────┘
```

### Empty state (si 0 ateliers)
```
🎓
Vous n'avez pas encore créé d'atelier.
Partagez votre expertise avec les établissements.
[ Créer mon premier atelier → ]
```

---

## D.7 — Reviews

### Pattern : Sollicitation post-mission

**Trigger :** 24h après la fin d'une mission marquée « complétée ».

**Flow :**
1. Notification (toast + email) : « Comment s'est passée la mission avec [Nom] ? »
2. Clic → Modal de review :
   - Étoiles (1–5), sélection avec animation scale
   - Textarea « Votre avis » (optionnel mais encouragé)
   - Tags rapides prédéfinis : « Ponctuel », « Professionnel », « Bienveillant », « Compétent », « Recommandé » (clic-toggle)
3. Confirmation → toast success

**Affichage reviews :**
- Sur profil freelance : liste de Review Cards, triées par date, filtrables par note
- Résumé : barre de distribution des étoiles + note moyenne + nombre total
- Sur fiche atelier : reviews spécifiques à l'atelier seulement

---

## D.8 — Complétion Mission

**Contexte :** Fin de mission, l'établissement confirme la réalisation.

### Flow
```
Mission terminée ?
├── [ Confirmer la mission ] (primary, teal)
│   ├── Modal récapitulatif :
│   │   - Freelance, dates, heures réalisées
│   │   - Montant calculé
│   │   - Checkbox : « Les heures sont correctes »
│   │   - [ Valider et déclencher le paiement ] (coral)
│   └── Après validation : badge « Complétée » emerald + toast + trigger review 24h
│
├── [ Signaler un problème ] (ghost)
│   └── Modal avec formulaire : type de problème + description
│       → Crée un ticket support, mission reste en « litige »
```

---

## D.9 — Feedback Post-Mission

**Contexte :** Le freelance donne son retour sur la mission (symétrique).

### Flow (identique structure au D.7 côté établissement)
1. Notification 24h post-mission
2. Modal : étoiles + textarea + tags (« Bien organisé », « Bon accueil », « Clair sur les attentes », « Je reviendrais »)
3. Confirmation

**Affichage :** Sur la fiche établissement (visible par les freelances dans le feed).

---

## D.10 — Réservation / Demande Atelier

**Contexte :** Un établissement réserve une session d'atelier.

### Flow
```
Étape 1 : Choix créneau
├── Calendrier avec créneaux disponibles (highlight violet)
├── Ou « Demander un créneau personnalisé » (formulaire date + heure souhaitées)
└── Nombre de participants (input number)

Étape 2 : Détails
├── Lieu (adresse de l'établissement, pré-remplie si profil complet)
├── Remarques / besoins spécifiques (textarea optionnel)
└── Formule choisie (session unique / pack 3 / pack 5)

Étape 3 : Récapitulatif & Validation
├── Card récapitulative : atelier + date + formule + prix
├── CGV checkbox
└── [ Confirmer la réservation ] (coral)
    → Toast success + email confirmation + état « En attente de confirmation freelance »
```

---

# E. HIÉRARCHIE VISUELLE — ÉCRAN PAR ÉCRAN

> Pour chaque écran : contenu prioritaire (1 = plus visible) avec le traitement visuel associé.

---

## E.1 — Home (Landing Page)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Headline + valeur prop | `display-2xl`, teal, fond ambient-top gradient |
| 2 | CTA double « Je suis un établissement / un freelance » | 2 boutons `xl` : coral (establishment) + teal (freelance) |
| 3 | Social proof compact | « 200+ établissements · 500+ freelances · 4.8/5 » — `heading-sm`, text-secondary |
| 4 | 3 bénéfices piliers | Grid 3 cols, cards tintées (teal = renfort, violet = ateliers, sand = confiance) |
| 5 | Témoignages | Carousel Review Cards `highlight` |
| 6 | Partenaires / logos | Grayscale, opacity 0.5, petits |
| 7 | Footer CTA | Bandeau coral-50, CTA « S'inscrire gratuitement » |

---

## E.2 — Page Établissements

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Headline « Trouvez vos renforts en quelques clics » | `display-xl`, fond teal-50 |
| 2 | 3 features renfort | Cards icônes : ⚡ Réactivité · ✅ Profils vérifiés · 📊 Suivi complet |
| 3 | Screenshot/mockup du dashboard | Image ou card représentative, shadow-lg |
| 4 | Testimonial établissement | Review Card `highlight`, grande |
| 5 | CTA « Créer mon compte établissement » | Bouton coral `xl` centré |
| 6 | FAQ section | Accordéon épuré |

---

## E.3 — Page Freelances

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Headline « Rejoignez le réseau des extras » | `display-xl`, fond coral-50 |
| 2 | 3 bénéfices freelance | 💼 Missions adaptées · 🎓 Valorisez vos ateliers · 💰 Paiement sécurisé |
| 3 | Feed aperçu (fake Renfort Cards) | 2-3 Renfort Cards en preview |
| 4 | Testimonial freelance | Review Card |
| 5 | CTA « M'inscrire comme freelance » | Bouton teal `xl` centré |

---

## E.4 — Page Ateliers (Landing)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Headline « Des ateliers par des professionnels, pour des professionnels » | `display-xl`, fond violet-50 |
| 2 | Grille catégories illustrées | 6 catégories en cards compactes avec icône |
| 3 | Ateliers populaires | 3 Atelier Cards `featured` |
| 4 | Comment ça marche (3 étapes) | Stepper horizontal illustré : Explorez → Réservez → Réalisez |
| 5 | CTA dual | « Explorer le catalogue » (violet) + « Proposer un atelier » (teal) |

---

## E.5 — Dashboard Établissement

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Alertes actives (missions urgentes sans candidat, paiements en attente) | Alert blocks coral/amber en haut |
| 2 | KPI row | 4 KPI tiles : Missions actives · Réservations en cours · Crédits dispo · Note moyenne |
| 3 | Missions à valider | Widget card avec liste des candidatures pending, CTA « Voir le board » |
| 4 | Prochaines missions | Timeline compacte : date, freelance, poste |
| 5 | Dernières factures | Table compacte 5 lignes, lien « Voir tout » |
| 6 | Ateliers réservés | Widget card compact |

---

## E.6 — Dashboard Freelance

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Prochaine mission | Card mise en avant (elevated), date, lieu, horaire, countdown « dans 2 jours » |
| 2 | KPI row | 4 tiles : Missions réalisées ce mois · CA ce mois · Note moyenne · Profil complété % |
| 3 | Nouvelles missions correspondantes | 3 Renfort Cards compactes, CTA « Voir toutes les missions » |
| 4 | Mes ateliers (aperçu) | Stats rapides : X sessions ce mois, Y€ revenus |
| 5 | Trust progress | Trust Block montrant la complétion du profil |
| 6 | Derniers avis reçus | 1-2 Review Cards compactes |

---

## E.7 — Publication Renfort

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Stepper progress | En haut, visible toujours |
| 2 | Formulaire de l'étape courante | Card centrée, max-width 640px |
| 3 | Indicateur urgence | Si « urgent » coché : bandeau coral discret au-dessus de la card |
| 4 | Preview live (desktop) | Split-screen : form à gauche, Renfort Card preview à droite |
| 5 | Actions navigation | [Précédent] ghost + [Suivant] primary, sticky bottom mobile |

---

## E.8 — Feed Missions (Freelance)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | FilterBar sticky | En haut sous le header |
| 2 | Compteur résultats | « 24 missions disponibles » — badge teal |
| 3 | Missions urgentes (first) | Renfort Cards `urgent` en premier, bordure coral |
| 4 | Missions normales | Renfort Cards `normal`, grid 2 cols desktop / 1 col mobile |
| 5 | Empty state si aucune mission | « Aucune mission ne correspond à vos critères. Élargissez vos filtres. » |

---

## E.9 — Matching (Board Établissement)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Mission contexte | Barre top sticky : titre mission + badges + nombre de candidats |
| 2 | Candidatures triées | Freelance Cards augmentées, score matching proéminent |
| 3 | Filtres | Sidebar left (desktop) ou drawer (mobile) |
| 4 | Actions rapides | [ Proposer ] coral / [ Passer ] ghost sur chaque card |
| 5 | Empty state si 0 candidature | « Aucun freelance n'a encore postulé. Partagez votre mission. » |

---

## E.10 — Fiche Freelance

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Identité + rating + badge vérifié | Header large, avatar XL |
| 2 | Trust Block | Card tintée teal, directement sous le header |
| 3 | Compétences / diplômes | Badges en row |
| 4 | Disponibilités | Calendrier semaine compact |
| 5 | Ateliers proposés | Carousel horizontal ou grid 2 cols |
| 6 | Avis | Review Cards |
| 7 | CTA sticky | « Proposer une mission » (coral, fixed bottom mobile) |

---

## E.11 — Catalogue Ateliers (App)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | FilterBar | Sticky sous header |
| 2 | Section « Recommandés » | 2-3 Atelier Cards `featured`, tintées violet |
| 3 | Grid tous les ateliers | 3 cols desktop, 1 col mobile |
| 4 | Pagination ou infinite scroll | Load more button ou auto-trigger |

---

## E.12 — Fiche Atelier

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Titre + animateur + rating | Header plein, fond violet-50 |
| 2 | Description | Texte long, body-lg, max-width prose |
| 3 | Infos pratiques | Grid 2×2 : durée, groupe, prérequis, matériel |
| 4 | Tarifs (packs) | 3 cards pricing côte à côte, « Recommandé » en violet |
| 5 | Disponibilités | Calendrier avec créneaux violet |
| 6 | Reviews | Review Cards |
| 7 | CTA sticky | « Réserver » (coral) + « Demander un devis » (secondary) |

---

## E.13 — Mes Ateliers (Freelance)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Header + bouton « Créer » | Heading + button coral en haut à droite |
| 2 | Tabs (Actifs / Brouillons / Archivés) | Tabs `underline` |
| 3 | Liste des ateliers | Atelier Row cards avec stats inline |
| 4 | Empty state par tab | Contextualisé (brouillon vs actif vs archivé) |

---

## E.14 — Revenus (Freelance)

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | KPI revenus | 3 tiles : CA ce mois · CA total · Prochaine facture |
| 2 | Graphique mensuel | Bar chart ou sparkline, couleur teal |
| 3 | Liste factures | Table : date, mission/atelier, montant, statut (badge) |
| 4 | Actions facturation | « Télécharger PDF » sur chaque ligne |
| 5 | Infos fiscales | Card info tintée sand : rappel statut (auto-entrepreneur, etc.) |

---

## E.15 — Messagerie

| Priorité | Élément | Traitement |
|----------|---------|-----------|
| 1 | Liste conversations (left panel) | Sidebar 320px : avatar + nom + dernier message + timestamp + badge non-lu |
| 2 | Thread actif (right panel) | Messages en bulles : envoyé (teal-50, align-right) / reçu (white, align-left) |
| 3 | Input message | Sticky bottom : textarea + bouton send (teal) + attachment icon |
| 4 | Contexte mission/atelier | Bandeau top dans le thread : lien vers la mission/atelier concerné |

### Mobile
- Vue liste full-width par défaut
- Clic sur conversation → vue thread full-width (push navigation, back button)
- Input sticky avec safe-area

---

# ANNEXES

## Iconographie

- **Bibliothèque** : Lucide Icons (déjà dans le projet)
- **Style** : Outline 1.5px, taille standard 20px (body), 24px (navigation), 16px (inline)
- **Couleur** : Hérite du texte parent (`currentColor`) sauf dans les icon containers tintés
- **Icônes métier** :
  - Renfort : `Siren` ou `AlertTriangle`
  - Atelier : `GraduationCap`
  - Disponibilité : `CalendarCheck`
  - Vérifié : `ShieldCheck`
  - Freelance : `UserCheck`
  - Établissement : `Building2`

## Principes d'écriture UX

- **Tonalité** : Professionnelle et chaleureuse. Tutoiement proscrit. Vouvoiement systématique.
- **Labels boutons** : Verbes d'action à l'infinitif : « Publier », « Réserver », « Postuler »
- **Messages vides** : Toujours donner le contexte + l'action. Jamais « Pas de données. »
- **Erreurs** : Expliquer ce qui s'est passé + ce que l'utilisateur peut faire
- **Confirmations** : « [Action] effectuée avec succès. » — bref, affirmatif

## Contraste & Accessibilité

| Combinaison | Ratio | Conformité |
|------------|-------|-----------|
| teal-500 sur blanc | 5.1:1 | ✅ AA (texte normal) |
| coral-500 sur blanc | 3.8:1 | ✅ AA (texte large 18px+) ⚠️ Pas AA pour texte < 18px |
| coral-700 sur blanc | 5.5:1 | ✅ AA (tout texte) |
| navy-900 sur ivoire | 13.2:1 | ✅ AAA |
| navy-400 sur ivoire | 4.7:1 | ✅ AA |
| white sur teal-500 | 5.1:1 | ✅ AA |
| white sur coral-500 | 3.8:1 | ✅ AA (texte large) |

**Règle :** Pour le texte courant (< 18px), toujours utiliser `coral-700` au lieu de `coral-500` pour le texte sur fond clair. Le `coral-500` est réservé aux fonds de boutons (texte blanc dessus) et aux bordures/icônes.
