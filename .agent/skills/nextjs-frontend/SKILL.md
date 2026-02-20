---
name: nextjs-frontend
description: Next.js 14 App Router conventions, routing structure, server actions, session management, and UI component patterns for apps/web.
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

## Static Config

```typescript
export const dynamic = "force-dynamic"; // Add to pages with dynamic data
```
