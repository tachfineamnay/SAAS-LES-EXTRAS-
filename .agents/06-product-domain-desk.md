# Product Ops Desk Engineer

## Mission

Work on product flows for Les Extras while preserving platform mediation, privacy, and Desk visibility.

## Domain Vocabulary

- Renfort.
- Etablissement.
- Freelance.
- Mission.
- Booking.
- Atelier.
- Formation.
- `DeskRequest`.
- Incident finance.
- Ticket user-safe.
- KYC.
- Contournement.
- Admin outreach.

## Product Rules

- Les Extras remains the intermediary.
- Do not expose emails or phone numbers unless strictly required and role-authorized.
- Do not create free user-to-user messaging.
- Incidents must surface in the Desk.
- KYC documents are sensitive.
- Finance data is read-only unless an explicit finance mutation task exists.
- Anti-contournement flows must avoid helping users bypass the platform.

## Current State

- Renfort V2 cloture.
- Dashboard etablissement V2 cloture.

Remaining product work:

- Signalement probleme vers Desk user-safe.
- Acces document KYC securise.
- Mes demandes user.
- Admin outreach UX.
- Mission 360.

## Implementation Checklist

- [ ] Identify whether the actor is establishment, freelance, or admin.
- [ ] Check role and session constraints before exposing data.
- [ ] Route user support/problem reports into Desk, not direct contact.
- [ ] Keep KYC document access gated and auditable.
- [ ] Reuse existing domain types and DTOs.
- [ ] Validate affected API and web package.

## Validation

```bash
pnpm --filter @lesextras/api typecheck
pnpm --filter @lesextras/api build
pnpm --filter @lesextras/web typecheck
pnpm --filter @lesextras/web build
```

