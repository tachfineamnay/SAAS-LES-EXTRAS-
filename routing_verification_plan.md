# Verification Plan - Routing & Wiring

## Goal

Systematically verify that all routes in the application are correctly wired, accessible to the appropriate user roles, and free of dead links or redirection loops.

## Scope

### 1. Public Routes

- `/` (Home): Landing page.
- `/login`: User login.
- `/register`: User registration (Role selection).
- `/privacy`, `/terms`: Static pages.

### 2. Protected Routes (Client & Talent)

- `/dashboard`: Main dashboard (Role-based content).
- `/dashboard/inbox`: Chat/Messages.
- `/settings`: User settings.
- `/onboarding`: Post-registration setup.

### 3. Client-Specific Routes

- `/marketplace`: Search for talents/services.
- `/dashboard/renforts`: Manage relief missions.
- `/dashboard/packs`: Buy credits (New).
- `/marketplace/services/[id]`: Service details.

### 4. Talent-Specific Routes

- `/marketplace`: Search for missions.
- `/bookings`: Manage schedule/missions.

### 5. Admin Routes (Separate Runtime)

- `/admin`: Admin dashboard.

## Verification Steps

### A. Static Analysis (Code Review)

1. **Middleware**: Confirm `middleware.ts` correctly handles `ADMIN` vs `FRONT` logic and doesn't block legitimate users.
2. **Sidebar**: Verify `CLIENT_LINKS` and `TALENT_LINKS` in `Sidebar.tsx` match the directory structure.
3. **Layouts**: Check `app/(dashboard)/layout.tsx` for auth guards.

### B. Manual Navigation Test (User Perspective)

1. **Unauthenticated**:
   - Visit `/` -> Should load Home.
   - Visit `/dashboard` -> Should redirect to `/login`.
2. **Client Flow**:
   - Login as Client.
   - Click "Marketplace" -> Should go to `/marketplace` (Client View).
   - Click "Mes Renforts" -> Should go to `/dashboard/renforts`.
   - Click "Acheter des crédits" -> Should go to `/dashboard/packs`.
3. **Talent Flow**:
   - Login as Talent.
   - Click "Offres de Renforts" -> Should go to `/marketplace` (Talent View).
   - Click "Mon Agenda" -> Should go to `/bookings`.

## Current Observations

- `middleware.ts`: Seems to have a `getAppRuntime` logic. Needs to ensure `process.env.APP_RUNTIME` is set correctly in development/production.
- `Sidebar.tsx`: Links appear correct (`/dashboard/packs` was just added).
