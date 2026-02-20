---
name: nestjs-api
description: NestJS API conventions, module/service/controller patterns, auth, and guards for the apps/api project.
---

# NestJS API — Conventions & Patterns

## Location

`apps/api/src/`

## Module Structure (Standard Pattern)

Every feature follows the NestJS module pattern:

```
src/<feature>/
├── <feature>.module.ts       # Imports PrismaModule + declares controller/service
├── <feature>.controller.ts   # HTTP routes, guards, decorators
├── <feature>.service.ts      # Business logic + Prisma calls
└── dto/
    ├── create-<feature>.dto.ts
    └── update-<feature>.dto.ts
```

### Example — Creating a New Module

```typescript
// feature.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

Register in `app.module.ts` imports array.

## Auth & Guards

```typescript
// Protect a route with JWT
@UseGuards(JwtAuthGuard)
@Get('/me')
getMe(@Req() req: AuthRequest) { ... }
```

- **Guard path**: `@/auth/jwt-auth.guard`
- **Current user**: Use `req.user` (typed as `AuthRequest` which includes `id` and `role`)
- **Role check**: Manual check via `req.user.role === UserRole.CLIENT`

## Prisma Usage

```typescript
// In any service constructor
constructor(private readonly prisma: PrismaService) {}

// Typical query patterns
await this.prisma.user.findUnique({ where: { id } });
await this.prisma.$transaction([...]);
```

- **PrismaService** is in `src/prisma/prisma.service.ts`
- Always use `PrismaModule` when creating a new module that needs DB access.

## Error Handling

```typescript
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

throw new NotFoundException('Resource not found');
throw new ForbiddenException('Solde insuffisant. Veuillez acheter un pack.');
throw new BadRequestException('Invalid data');
```

## API Prefix & Port

- **Prefix**: `/api` (all routes are `/api/...`)
- **Port**: `3001` (default), configurable via `PORT` env var
- **CORS**: Configured via `CORS_ORIGINS` env var (comma-separated URLs)

## Existing Modules

| Module | Path | Key Routes |
|---|---|---|
| AuthModule | `src/auth` | `POST /api/auth/login`, `POST /api/auth/register` |
| UsersModule | `src/users` | `GET /api/users/me`, `PATCH /api/users/me` |
| MissionsModule | `src/missions` | `GET/POST /api/missions` |
| ServicesModule | `src/services` | `GET/POST /api/services` |
| BookingsModule | `src/bookings` | `GET/POST/PATCH /api/bookings` |
| QuotesModule | `src/quotes` | `GET/POST /api/quotes` |
| InvoicesModule | `src/invoices` | `GET /api/invoices` |
| NotificationsModule | `src/notifications` | `GET /api/notifications` |

## Key Business Logic

### `BookingsService.confirmBooking`

- Checks `clientProfile.availableCredits > 0` (throws `ForbiddenException` if 0)
- Decrements credits by 1 inside a `$transaction`
- For mission bookings: auto-assigns mission, cancels other PENDING applications
- For service bookings: simple status update

### Credit Packs (PackPurchase model)

- Endpoint expected: `POST /api/users/me/credits/buy`
- Body: `{ amount: number, credits: number }`
