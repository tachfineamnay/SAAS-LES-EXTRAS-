---
name: prisma-schema
description: Database schema, models, enums, and Prisma conventions for the project. Read before modifying the database schema.
---

# Prisma Schema — Models & Conventions

## Location

`apps/api/prisma/schema.prisma`

## Database

- **Provider**: PostgreSQL
- **URL**: `env("DATABASE_URL")` in `apps/api/.env`
- **Client**: `@prisma/client` (generated in `node_modules`)

## Enums

```prisma
enum UserRole      { CLIENT  TALENT  ADMIN }
enum UserStatus    { PENDING  VERIFIED  BANNED }
enum BookingStatus {
  PENDING  CONFIRMED  CANCELLED  COMPLETED
  COMPLETED_AWAITING_PAYMENT  PAID  ASSIGNED
}
enum ReliefMissionStatus { OPEN  ASSIGNED  COMPLETED  CANCELLED }
enum ServiceType         { WORKSHOP  TRAINING  COACHING }
enum InvoiceStatus       { PENDING_PAYMENT  PAID  CANCELLED }
enum QuoteStatus         { PENDING  ACCEPTED  DECLINED }
```

## Core Models

### User

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  password        String
  role            UserRole
  status          UserStatus  @default(PENDING)
  onboardingStep  Int         @default(0)
  isAvailable     Boolean     @default(false)
  profile         Profile?
  clientMissions  ReliefMission[] @relation("ClientMissions")
  ownerServices   Service[]       @relation("OwnerServices")
  clientBookings  Booking[]       @relation("ClientBookings")
  talentBookings  Booking[]       @relation("TalentBookings")
  packPurchases   PackPurchase[]
  notifications   Notification[]
  // ... messages, quotes
}
```

### Profile (extended user info)

```prisma
model Profile {
  userId           String   @unique
  firstName        String
  lastName         String
  companyName      String?  // CLIENT only
  siret            String?  // CLIENT only
  availableCredits Int      @default(0)  // CLIENT recruitment credits
  // ... bio, avatar, skills, etc.
}
```

### ReliefMission (Renfort)

```prisma
model ReliefMission {
  id          String               @id @default(cuid())
  clientId    String
  title       String
  description String
  date        String
  startTime   String
  endTime     String
  status      ReliefMissionStatus  @default(OPEN)
  bookings    Booking[]
  client      User                 @relation("ClientMissions", ...)
}
```

### Booking

```prisma
model Booking {
  id               String        @id @default(cuid())
  clientId         String
  talentId         String
  status           BookingStatus @default(PENDING)
  reliefMissionId  String?      // nullable — null = service booking
  serviceId        String?      // nullable — null = mission booking
  invoice          Invoice?
  // ... quotes relation
}
```

### PackPurchase (Credit History)

```prisma
model PackPurchase {
  id           String   @id @default(cuid())
  clientId     String
  amount       Float
  creditsAdded Int
  createdAt    DateTime @default(now())
  client       User     @relation(...)
}
```

### Invoice

```prisma
model Invoice {
  amount           Float
  commissionAmount Float  @default(0)  // Platform fee (future)
  status           InvoiceStatus
  url              String           // PDF URL
  bookingId        String  @unique
}
```

## Migration Workflow

```bash
# 1. Edit schema.prisma
# 2. Generate types locally (without DB connection)
npx prisma generate

# 3. Run migration (requires active DB connection)
npx prisma migrate dev --name <descriptive_name>

# 4. If DB connection fails but you need types:
#    Run generate only, code against the types.
```

> **IMPORTANT**: The production DB is hosted on Coolify. When running migrations locally, ensure the `DATABASE_URL` in `apps/api/.env` points to the correct host. Local Docker may be needed.
