---
name: design-system
description: Design system "Quietly Bold After Dark" — dark mode tokens, glassmorphism specs, color roles, font constants, animation library, and CSS utility reference for apps/web.
---

# Design System — Quietly Bold After Dark

Créé le 19 mars 2026 pour le projet Les Extras.  
Thème dark-first. Zéro couleur hexadécimale directe dans les composants — tout passe par les tokens CSS.

---

## Activation dark mode

```tsx
// apps/web/src/app/layout.tsx
<html lang="fr" data-theme="dark" ...>
```

```typescript
// apps/web/tailwind.config.ts
darkMode: ["selector", '[data-theme="dark"]'],
```

---

## Palette de couleurs

| Rôle | Token CSS | Valeur HSL | Hex approximatif |
|------|-----------|------------|------------------|
| Fond principal | `--background` | `192 40% 5%` | `#071316` |
| Carte / surface | `--card` | `185 55% 13%` | `#0d2c34` |
| Primary (teal) | `--primary` | `185 84% 24%` | `#0A6870` |
| Accent (coral) | `--accent` | `14 65% 52%` | `#D95F3B` |
| Texte principal | `--foreground` | `180 20% 95%` | bleu-blanc froid |
| Texte secondaire | `--muted-foreground` | `185 15% 55%` | gris teal |

### Règles d'utilisation strictes

| Couleur | Usage autorisé | **INTERDIT** |
|---------|----------------|-------------|
| **Teal** `#0A6870` | Actions primaires · nav · focus ring · scroll progress · titres gradient | Badges urgences |
| **Coral** `hsl(14 65% 52%)` | Badge `"Urgent"` · icône Zap · bouton `"Postuler maintenant"` **UNIQUEMENT** | Tout autre élément |
| **Violet** `--color-violet-500` | Pilier Ateliers (section card dédiée) | Renfort, éléments primary |
| **Sand** `--color-sand-300` | Éléments de chaleur / warmth | Actions clickables |

> **Règle mnémotechnique :** Coral = urgence/danger. Teal = action normale. Violet = éducation/ateliers.

---

## Glassmorphism

### Spécifications officielles

```
background : rgba(13, 44, 52, 0.72)
backdrop-filter : blur(32px) saturate(1.8)
border : 1px solid rgba(255, 255, 255, 0.10)
```

### Classes CSS (définis dans globals.css)

```css
.glass-panel          /* spec officielle ci-dessus */
.glass-panel-dense    /* opacité 0.85, moins transparent */
.glass-nav            /* pour la navbar sticky — bg plus foncé */
```

### Effets décoratifs glass

```css
.highlight-top        /* ::before — filet lumineux 1px en haut de carte */
.mirror-reflection    /* ::after — reflet miroir semi-transparent sous les cards flottantes */
.dot-mesh             /* pseudo — réseau de points subtils en fond */
.glow-ambient-teal    /* radial-gradient teal en fond d'une section */
.glow-ambient-coral   /* radial-gradient coral */
.shimmer-border       /* animation @keyframes shimmer-sweep sur le bord */
```

### Ombres Tailwind (shadow tokens)

```typescript
shadow-dark-glass       // ombre standard dark
shadow-dark-glass-lg    // ombre large (carte hover)
shadow-dark-glow-teal   // halo lumineux teal (focus, active)
shadow-dark-glow-coral  // halo lumineux coral (urgence)
```

---

## Typographie

### Polices (chargées dans layout.tsx)

| Variable CSS | Police | Usage |
|---|---|---|
| `--font-display` | Plus Jakarta Sans | Titres, headlines |
| `--font-body` | Inter | Corps de texte |
| `--font-mono` | JetBrains Mono | Code, chiffres techniques |

### Constantes TypeScript recommandées

```typescript
const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO    = "font-[family-name:var(--font-mono)]";
```

### Titres display

Tous les titres principaux (H1, H2 de section) :

```tsx
<h1 className={`${DISPLAY} font-extrabold tracking-[-0.04em] text-gradient-dark`}>
  Titre
</h1>
```

- `tracking-[-0.04em]` : indispensable pour le look "tech premium"
- `text-gradient-dark` : classe CSS → dégradé `#67e8f9` → `#a5f3fc` (via `background-clip: text`)

---

## CSS Utilities — référence complète

Toutes définies dans `apps/web/src/app/globals.css` dans le bloc `[data-theme="dark"]`.

| Classe | Effet |
|--------|-------|
| `.glass-panel` | Fond glass standard (voir specs ci-dessus) |
| `.glass-panel-dense` | Variante opaque |
| `.glass-nav` | Nav sticky glass |
| `.highlight-top` | Filet lumineux haut via `::before` |
| `.mirror-reflection` | Reflet miroir via `::after` |
| `.dot-mesh` | Fond à points |
| `.glow-ambient-teal` | Lueur de fond teal |
| `.glow-ambient-coral` | Lueur de fond coral |
| `.dark-card-shadow` | Ombre standard dark |
| `.dark-card-shadow-hover` | Ombre agrandie au hover |
| `.shimmer-border` | Bord animé scintillant |
| `.text-gradient-dark` | Texte en dégradé teal |

### Keyframes disponibles

| Keyframe | Usage |
|----------|-------|
| `oscillate` | Cartes satellites flottantes (montée/descente cyclique) |
| `shimmer-sweep` | Balayage lumineux sur `.shimmer-border` |

---

## Bibliothèque de motion (`@/lib/motion`)

### Courbes d'easing

```typescript
EASE_PREMIUM = [0.22, 1, 0.36, 1]   // décélération douce — standard
EASE_SNAPPY  = [0.16, 1, 0.3, 1]    // plus rapide — micro-interactions
EASE_BOUNCE  = [0.34, 1.56, 0.64, 1] // léger rebond
```

### Presets spring

```typescript
SPRING_SOFT    // { type: "spring", stiffness: 100, damping: 20 }
SPRING_MEDIUM  // { type: "spring", stiffness: 200, damping: 25 }
SPRING_SNAPPY  // { type: "spring", stiffness: 400, damping: 30 }
```

### Variants prêts à l'emploi

```typescript
import { containerVariants, itemFadeUp, hoverLift } from "@/lib/motion";

// containerVariants : stagger 0.08s sur les enfants
// itemFadeUp        : { hidden: {opacity:0, y:24}, visible: {opacity:1, y:0} }
// hoverLift         : { whileHover: {y:-4, transition: SPRING_SOFT} }
```

### Durées

```typescript
DURATION = {
  fast:   0.15,
  normal: 0.35,
  slow:   0.55,
  page:   0.6,
}
```

---

## Règles de performance motion

1. `will-change: "transform"` sur **tous** les éléments animés.
2. Guard `prefers-reduced-motion` obligatoire sur tous les effets 3D et oscillations :

```tsx
const prefersReduced = useReducedMotion(); // hook dans v2/page.tsx ou custom hook

// Dans useEffect / handler :
if (prefersReduced) return; // désactiver Tilt, oscillation, custom cursor
```

3. Cartes hover : toujours `whileHover={{ y: -4 }}` + `shadow-dark-glass-lg` — pas `scale`.
4. `viewport={{ once: true, margin: "-60px" }}` sur tous les `whileInView`.

---

## Composants v2 (définis dans `apps/web/src/app/v2/page.tsx`)

### Composants réutilisables à extraire si nécessaire

| Composant | Props | Description |
|-----------|-------|-------------|
| `Tilt` | `children, className` | 3D mouse-follow via `useMotionValue/useSpring/useTransform` — désactivé si `prefersReduced` |
| `SatelliteCard` | `children, offsetY, delay` | Carte flottante oscillante — `glass-panel highlight-top` |
| `GlassHoverCard` | `children, delay` | `whileInView` + `whileHover: {y:-4}` — carte glass standard |
| `ScrollProgress` | — | Barre de progression teal fixe en haut (2px) via `useScroll` |
| `CustomCursor` | — | Curseur spring-physics, `mix-blend-difference`, masqué sur mobile/touch |
| `Stat` | `target, suffix, prefix, label` | Compteur animé avec `useInView` — cubic-ease |

---

## Structure des sections landing `/v2`

| # | Section | Classe principale | Notes |
|---|---------|-------------------|-------|
| 1 | Navbar | `.glass-nav` sticky | Logo + liens + bouton teal |
| 2 | Hero Split | `dot-mesh` + `glow-ambient-teal` | `Tilt` produit + 3 `SatelliteCard` + `.mirror-reflection` |
| 3 | Stats Band | `glass-panel` | 4 `Stat` avec compteurs animés |
| 4 | Process | grille 4 `GlassHoverCard` | Étapes numérotées |
| 5 | Pillars | Renfort (coral) + Ateliers (violet) | Deux `Tilt` côte à côte |
| 6 | Testimonials | grille 3 colonnes | `glass-panel-dense` + étoiles |
| 7 | Final CTA | `glow-ambient-coral` | Bouton Postuler coral |
| 8 | Footer | fond `--background` | Liens + social |
