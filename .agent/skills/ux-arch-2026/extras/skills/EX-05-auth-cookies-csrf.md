---
name: EX-05-auth-cookies-csrf
description: "P1 — Sécurité cookies + CSRF + séparation Desk/Admin : attributs httpOnly/Secure/SameSite, cookie admin distinct, isolation des runtimes."
---

# EX-05 — Sécurité Cookies + CSRF + Séparation Desk/Admin

## Intent

Ce skill définit les attributs obligatoires des cookies JWT (httpOnly, Secure, SameSite), la séparation entre le cookie utilisateur (talent/client) et le cookie admin (desk), et les tests de vérification d'accès pour garantir qu'une session Front ne peut pas donner accès aux routes Admin.

## Pourquoi

Un cookie JWT sans `httpOnly` est lisible par JavaScript (XSS → vol de session). Sans `Secure`, il transite en clair sur HTTP. Sans `SameSite=Strict`, il est envoyé dans les requêtes CSRF cross-site. Dans ce projet, le cookie admin `lesextras_admin_token` doit être strictement séparé du cookie utilisateur pour éviter qu'une session talent n'accède aux routes `/admin/*`.

## Règles

### Cookies JWT

- **httpOnly** : obligatoire en production (inaccessible depuis JavaScript)
- **Secure** : obligatoire en production (HTTPS uniquement)
- **SameSite=Strict** : empêche l'envoi cross-site (protection CSRF)
- **Path** : limiter le path si possible (ex. `/api` pour le cookie API)
- **MaxAge/Expires** : aligner sur `JWT_EXPIRES_IN` (actuellement `7d`)

### Séparation des cookies

- Cookie utilisateur (talent/client) : `lesextras_token` (ou équivalent)
- Cookie admin (desk) : `lesextras_admin_token` (déjà défini dans `middleware.ts`)
- Les deux cookies sont **indépendants** : un `lesextras_admin_token` valide ne donne pas accès aux routes utilisateur, et vice versa

### Isolation des runtimes

- **Runtime `front`** : les routes `/admin/*` sont bloquées (redirect vers `/marketplace`)
- **Runtime `desk`** : les routes utilisateur non-admin sont bloquées (redirect vers `/admin`)
- Cette isolation est assurée par le middleware (skill EX-01) + les attributs des cookies

### CSRF

- Pour les server actions Next.js : Next.js 14 génère automatiquement un token CSRF pour les actions via `cookies()` — pas besoin d'implémentation manuelle
- Pour les appels API directs : utiliser `SameSite=Strict` comme protection primaire
- Pas de formulaires HTML classiques → pas de token CSRF traditionnel requis

## Acceptance Criteria

- [ ] Cookie JWT set par le backend avec `httpOnly=true`, `secure=true` (en production), `sameSite=Strict`
- [ ] Cookie admin (`lesextras_admin_token`) distinct du cookie utilisateur
- [ ] `GET /admin` avec cookie utilisateur (non-admin) → `302` vers `/admin/login`
- [ ] `GET /admin` sans cookie → `302` vers `/admin/login`
- [ ] `GET /api/users/me` sans cookie JWT → `401`
- [ ] Test : session desk n'est pas réutilisable comme session front

## Snippets

```typescript
// apps/api/src/auth/auth.controller.ts — set cookie sécurisé
import { Response } from "express";
import { Res } from "@nestjs/common";

@Post("login")
async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
  const { token, user } = await this.authService.login(dto);
  
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("lesextras_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
    path: "/",
  });
  
  return { user };
}
```

```typescript
// apps/web/src/lib/session.ts — lire le cookie httpOnly côté server
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lesextras_token")?.value;
  if (!token) return null;
  // ... décoder le JWT
}
```

```typescript
// Test d'isolation admin (pseudo, avec supertest ou fetch)
// Test 1 : accès /admin sans session admin → 302
const response = await fetch("http://localhost:3000/admin", {
  redirect: "manual",
  headers: { Cookie: "lesextras_token=valid_user_token" },
});
assert.strictEqual(response.status, 302);
assert.ok(response.headers.get("location")?.includes("/admin/login"));

// Test 2 : accès /admin avec session admin → 200
const adminResponse = await fetch("http://localhost:3000/admin", {
  redirect: "manual",
  headers: { Cookie: "lesextras_admin_token=valid_admin_token" },
});
// (Sur runtime desk uniquement)
```

## Tests

### Unit

- Tester que `hasValidAdminSession()` dans `middleware.ts` retourne `false` pour un token utilisateur non-admin
- Tester le décodage JWT : payload sans `role: "ADMIN"` retourne `false`

### Integration

```bash
# Test 403 sur routes admin depuis runtime front
APP_RUNTIME=front curl -v http://localhost:3000/admin
# Attendu : 302 Location: /marketplace

# Test 401 sur API sans token
curl -v http://localhost:3001/api/users/me
# Attendu : 401 Unauthorized
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Cookies JWT sans httpOnly en prod | 0 |
| Routes admin accessibles depuis runtime Front | 0 |
| Vulnerabilités XSS liées aux cookies | 0 (audit OWASP) |

## Rollout Plan

1. **Audit** : vérifier les attributs des cookies JWT actuellement setés dans `auth.controller.ts`
2. **Mise à jour** : ajouter `httpOnly`, `secure`, `sameSite` sur tous les `res.cookie()`
3. **Test** : vérifier en dev (HTTP) que le cookie est accessible ; en staging (HTTPS) qu'il est `Secure`
4. **Middleware** : confirmer que `hasValidAdminSession()` valide bien `role === "ADMIN"`
5. **E2E** : tester les scénarios d'isolation dans un environnement staging avec les deux runtimes déployés

> **Référence** : [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
