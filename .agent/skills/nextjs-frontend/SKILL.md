---
name: nextjs-frontend
description: Next.js 14 App Router conventions, routing structure, server actions, session management, UI component patterns, and dark-mode glass design system for apps/web.
---

# Next.js 14 — Frontend Conventions

## Location

`apps/web/src/`

## App Router Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register pages (no auth needed)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/         # All authenticated pages
│   │   ├── layout.tsx       # Dashboard shell (sidebar, header)
│   │   ├── dashboard/page.tsx
│   │   ├── marketplace/     # Mission & service catalog
│   │   ├── bookings/        # Bookings management
│   │   ├── renforts/        # Establishment quick-hire (was /sos)
│   │   ├── inbox/           # Messaging
│   │   ├── account/         # Profile settings
│   │   └── dashboard/finance/ # Invoices & finance
│   ├── v2/                  # ✨ Landing page dark-glass (19 mars 2026)
│   │   └── page.tsx         # Standalone, ~1300 lignes, "use client"
│   ├── actions/             # Server actions (bookings.ts)
│   └── (public)/            # Public landing pages
├── actions/                 # Global server actions
│   ├── credits.ts           # buyPack, getCredits
│   ├── finance.ts           # getInvoices
│   ├── missions.ts          # applyToMission, acceptCandidate
│   └── quotes.ts            # createQuote, getQuotes
├── components/
│   ├── dashboard/           # Dashboard widgets
│   │   ├── BentoGrid.tsx    # Grid layout component
│   │   ├── StatsWidget.tsx
│   │   ├── BookingListWidget.tsx
│   │   ├── CreditsWidget.tsx
│   │   ├── client/          # CLIENT-only widgets
│   │   └── TrustChecklistWidget.tsx
│   ├── marketplace/         # Marketplace components
│   ├── cards/               # ServiceCard, MissionCard, TalentCard
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── api.ts               # apiRequest() helper
    └── session.ts           # getSession() — read JWT from cookies
```

## Session Management

```typescript
// Get session in any RSC or Server Action
import { getSession } from "@/lib/session";

const session = await getSession();
if (!session) redirect("/login");

const { token } = session;  // JWT bearer token
const { id, role } = session.user;  // user data
```

## API Calls

```typescript
import { apiRequest } from "@/lib/api";

// GET
const data = await apiRequest<MyType>("/missions", { token });

// POST
await apiRequest("/bookings", {
  method: "POST",
  token,
  body: { talentId, missionId },
});
```

**Base URL**: `process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"`

## Server Actions

```typescript
"use server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

export async function myAction(data: MyInput): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Non connecté" };

  try {
    await apiRequest("/endpoint", { method: "POST", token: session.token, body: data });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e: any) {
    return { error: e.message ?? "Erreur" };
  }
}
```

## Dashboard Page Pattern

Dashboard pages use `BentoGrid` + `BentoCard` layout:

```tsx
import { BentoGrid, BentoCard } from "@/components/dashboard/BentoGrid";

// Inside the CLIENT branch:
<BentoGrid>
  <BentoCard title="Mon Widget" icon={<Icon />} colSpan={2} rowSpan={2}>
    <MyWidget data={data} />
  </BentoCard>
</BentoGrid>
```

`dashboard/page.tsx` has two branches:

1. `if (userRole === "CLIENT") { return (...) }` — Establishment view
2. Default `return (...)` — Talent/Freelance view

## Role-Based Rendering

```tsx
const { role: userRole } = session.user;

if (userRole === "CLIENT") {
  // Client/Establishment view
}
// else: Talent view
```

## UI Library

- **shadcn/ui**: `@/components/ui/*` — Button, Card, Dialog, Alert, Calendar, etc.
- **Lucide React**: Icons (`import { DollarSign } from "lucide-react"`)
- **Sonner**: Toasts (`import { toast } from "sonner"`)
- **Framer Motion**: Animations (page transitions, hero slider)
- **Règle** : Toutes les couleurs passent par les tokens CSS (`hsl(var(--primary))`) — aucune valeur hexadécimale directe dans les composants.

---

## Design System — Dark Mode (19 mars 2026)

### Activation

`[data-theme="dark"]` est posé sur `<html>` dans `apps/web/src/app/layout.tsx`.  
Tailwind lit le sélecteur :

```typescript
// tailwind.config.ts
darkMode: ["selector", '[data-theme="dark"]'],
```

### Tokens CSS (`globals.css`)

Les tokens sémantiques sont définis dans `:root` puis écrasés dans `[data-theme="dark"]`.  
Tokens dark clés :

| Token | Valeur | Description |
|-------|--------|-------------|
| `--background` | `192 40% 5%` | `#071316` fond teal-noir |
| `--card` | `185 55% 13%` | base carte foncée |
| `--primary` | `185 84% 24%` | `#0A6870` teal actions |
| `--accent` | `14 65% 52%` | coral — urgences UNIQUEMENT |
| `--glass-blur` | `32px` | flou backdrop |
| `--glass-sat` | `1.8` | saturation backdrop |
| `--glass-border` | `0 0% 100% / 0.10` | bordure glass |

### Règles couleurs obligatoires

| Couleur | Usage autorisé | Interdit |
|---------|----------------|----------|
| Teal `#0A6870` | Actions primaires, nav, focus, progress | Badges urgences |
| Coral `hsl(14 65% 52%)` | Badge "Urgent", bouton "Postuler" **seulement** | Tout autre élément |
| Violet | Pilier Ateliers uniquement | Renfort, primary |

### Utilitaires CSS disponibles

```css
.glass-panel          /* bg rgba(13,44,52,.72) + blur(32px) saturate(1.8) + border rgba(255,255,255,.10) */
.glass-panel-dense    /* variante plus opaque */
.glass-nav            /* barre de navigation sticky */
.highlight-top        /* ::before — filet lumineux en haut de carte */
.mirror-reflection    /* ::after — reflet miroir sous les cartes flottantes */
.dot-mesh             /* fond à points subtils */
.glow-ambient-teal    /* lueur ambiante teal */
.glow-ambient-coral   /* lueur ambiante coral */
.dark-card-shadow     /* ombre dark mode */
.shimmer-border       /* animation bord scintillant */
.text-gradient-dark   /* dégradé teal clair sur titres */
```

### Polices

```typescript
const DISPLAY = "font-[family-name:var(--font-display)]";  // Plus Jakarta Sans 800
const MONO    = "font-[family-name:var(--font-mono)]";     // JetBrains Mono
```

Tous les titres display : `tracking-[-0.04em]` + `font-extrabold` + `DISPLAY`.

### Motion — règles de performance

- `will-change: transform` sur **tous** les éléments animés (Tilt, cartes satellites, hover)
- Guard `prefers-reduced-motion` obligatoire sur les effets 3D :

```tsx
const prefersReduced = useReducedMotion();
if (prefersReduced) return; // désactiver Tilt, oscillation, etc.
```

- Cartes hover : `whileHover={{ y: -4 }}` + `shadow-dark-glass-lg`
- Constantes depuis `@/lib/motion` — jamais de valeurs inline :
  `EASE_PREMIUM [0.22,1,0.36,1]`, `EASE_SNAPPY [0.16,1,0.3,1]`, `SPRING_SOFT`, etc.

### Exemple — glass card conforme

```tsx
<motion.div
  className="glass-panel highlight-top dark-card-shadow relative overflow-hidden"
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  whileHover={{ y: -4 }}
  style={{ willChange: "transform" }}
>
  {children}
</motion.div>
```

## Static Config

```typescript
export const dynamic = "force-dynamic"; // Add to pages with dynamic data
```
