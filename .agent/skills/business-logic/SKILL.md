---
name: business-logic
description: Core business workflows — mission lifecycle, booking flow, quote-to-invoice, credits system. Read before implementing features involving bookings, payments, or missions.
---

# Core Business Logic

## Mission Lifecycle (Renfort)

```
CLIENT creates ReliefMission (OPEN)
  → TALENT sees it in marketplace
  → TALENT applies (creates Booking: PENDING)
  → CLIENT reviews candidates (dashboard/renforts)
  → CLIENT confirms one → confirmBooking()
      ├── Checks CLIENT availableCredits > 0
      ├── Decrements credits by 1
      ├── Sets winning Booking → CONFIRMED
      ├── Sets Mission → ASSIGNED
      └── Cancels all other PENDING bookings for the mission
  → Mission is fulfilled
```

## Service Booking Flow

```
CLIENT creates Service (training/workshop)
  → TALENT/CLIENT books via BookingModal
  → Creates Booking: PENDING
  → CLIENT confirms → confirmBooking()
      ├── Checks credits
      ├── Decrements credits
      └── Sets Booking → CONFIRMED
  → Booking is confirmed
```

## Payment & Invoice Flow

```
Booking CONFIRMED
  → Mark booking as COMPLETED_AWAITING_PAYMENT (endMission)
  → System generates Invoice (PENDING_PAYMENT)
  → CLIENT validates payment → authorizePayment()
  → Invoice → PAID, Booking → PAID
```

## Quote System

```
TALENT creates Quote for a CLIENT
  → Quote: PENDING
  → CLIENT accepts Quote
  → System creates Booking (PENDING)
  → Normal booking flow continues
```

## Credit System (Pack de Mises en Relation)

### Business Rule

1. Clients must have `availableCredits > 0` to confirm a booking
2. Each booking confirmation costs 1 credit
3. Credits expire? No (current implementation)

### Packs Available

```typescript
const PACKS = {
  STARTER:    { amount: 150, credits: 1 },
  PRO:        { amount: 400, credits: 3 },
  ENTERPRISE: { amount: 600, credits: 5 },
};
```

### API Endpoint (to implement)

`POST /api/users/me/credits/buy` — `{ amount, credits }` → adds credits to Profile

### Frontend

- `CreditsWidget` on dashboard displays balance and buy button
- `buyPack()` server action in `apps/web/src/actions/credits.ts`
- `getCredits()` fetches balance from API (`/users/me/profile`)

## Key Backend Methods

| Method | File | What it does |
|---|---|---|
| `confirmBooking(bookingId)` | `bookings.service.ts` | Credit check + mission assignment |
| `completeBooking(bookingId)` | `bookings.service.ts` | Marks AWAITING_PAYMENT + creates Invoice |
| `authorizePayment(bookingId)` | `bookings.service.ts` | Marks PAID, updates Invoice |
| `applyToMission(missionId)` | Client action | Creates PENDING Booking |
| `acceptCandidate(bookingId)` | Client action | Calls confirmBooking |

## Commission (Future)

- `Invoice.commissionAmount` is prepared (default 0)
- Platform takes a % of each transaction
- Not yet implemented — field exists for future billing logic
