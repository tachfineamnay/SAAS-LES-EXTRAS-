---
name: auth-flow
description: Authentication flow — JWT-based login/register, session cookies, and guard usage in this project.
---

# Authentication Flow

## Overview

This project uses **JWT** (JSON Web Tokens) for authentication.

```
Browser → Next.js Action → NestJS API (issues JWT) → stored in cookie → used in all API calls
```

## Backend (NestJS)

### Auth Endpoints

- `POST /api/auth/register` — Creates user (returns `{ token, user }`)
- `POST /api/auth/login` — Validates credentials (returns `{ token, user }`)

### JWT Guard

```typescript
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('/me')
async getMe(@Req() req: AuthRequest) {
  return req.user; // { id, email, role, status }
}
```

## Frontend (Next.js)

### Session Storage

- JWT token is stored in a **cookie** (httpOnly in production)
- Read via `getSession()` utility

### getSession()

```typescript
// apps/web/src/lib/session.ts
import { getSession } from "@/lib/session";

const session = await getSession();
// Returns: { token: string, user: { id, email, role, status } } | null
```

### Login Server Action

```typescript
// apps/web/src/app/actions/login.ts
// Calls POST /api/auth/login, sets cookie, redirects
```

### Auth Guard (Middleware)

- `apps/web/src/middleware.ts` protects `/dashboard/*` routes
- Unauthenticated users are redirected to `/login`

## Onboarding Flow

After registration, users must complete onboarding:

1. `onboardingStep` tracked on `User` model (0 = not started)
2. `Profile.onboardingStep` tracks progress within steps
3. `OnboardingGuard` component checks and redirects unfinished users

```
Register → /onboarding → Dashboard
```

## User Status

- `PENDING` — Registered but not verified by admin
- `VERIFIED` — Active and can use the platform
- `BANNED` — Blocked

> **Note**: TALENT users need `status === VERIFIED` to appear in the marketplace and apply to missions.
