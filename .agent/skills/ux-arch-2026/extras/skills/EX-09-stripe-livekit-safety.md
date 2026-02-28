---
name: EX-09-stripe-livekit-safety
description: "P2 — Stripe/LiveKit safety : webhook signature avec raw body, tokens LiveKit TTL court. Skill 'ready when needed'."
---

# EX-09 — Stripe/LiveKit Safety

## Intent

Ce skill est un **"ready when needed"** : il documente les règles de sécurité obligatoires pour l'intégration Stripe (webhooks) et LiveKit (tokens de session), à implémenter dès que ces services sont activés dans le projet. Il ne modifie rien tant que les modules Stripe/LiveKit n'existent pas dans `apps/api/src/`.

## Pourquoi

Stripe exige que le body du webhook soit lu en **raw Buffer** avant tout parsing JSON — si Express a déjà parsé le body en JSON, la signature ne peut plus être vérifiée et le webhook est rejeté ou falsifiable. Un token LiveKit sans TTL court reste valide indéfiniment : si volé, il donne accès à la room LiveKit sans possibilité de révocation.

## Règles

### Stripe Webhooks

- **Raw body** : l'endpoint webhook doit recevoir le body en `Buffer` brut, avant JSON parsing
- **Signature** : vérifier systématiquement avec `stripe.webhooks.constructEvent(body, sig, endpointSecret)`
- **Endpoint secret** : stocker dans `STRIPE_WEBHOOK_SECRET` (env, jamais hardcodé)
- **Clé secrète** : `STRIPE_SECRET_KEY` dans `.env` uniquement (jamais `NEXT_PUBLIC_*`)
- **Idempotence** : chaque événement Stripe a un `id` — stocker les événements traités pour éviter le double-traitement

### LiveKit Tokens

- **TTL court** : `exp` maximal = maintenant + 2 heures (`Math.floor(Date.now() / 1000) + 7200`)
- **Scope minimal** : le token ne doit autoriser que les opérations nécessaires pour la room cible
- **Pas de token global** : générer un token par session/room/utilisateur
- **Clés** : `LIVEKIT_API_KEY` et `LIVEKIT_API_SECRET` dans `.env` côté API uniquement

## Acceptance Criteria

- [ ] *(Si Stripe activé)* Endpoint webhook lit le body en Buffer (`express.raw()` middleware sur cette route)
- [ ] *(Si Stripe activé)* `stripe.webhooks.constructEvent()` est appelé avant tout traitement
- [ ] *(Si Stripe activé)* `STRIPE_SECRET_KEY` absent de tous les fichiers `NEXT_PUBLIC_*`
- [ ] *(Si LiveKit activé)* TTL des tokens ≤ 7200 secondes (2h)
- [ ] *(Si LiveKit activé)* Un token est généré par room + utilisateur, pas un token global
- [ ] Clés Stripe et LiveKit présentes uniquement dans `apps/api/.env.example` (pas dans `apps/web`)

## Snippets

```typescript
// apps/api/src/stripe/stripe.controller.ts — raw body pour webhook
import { Controller, Post, Req, Headers, RawBody } from "@nestjs/common";
import Stripe from "stripe";

@Controller("stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post("webhook")
  async handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers("stripe-signature") sig: string
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let event: Stripe.Event;
    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }
    
    return this.stripeService.processEvent(event);
  }
}
```

```typescript
// apps/api/src/main.ts — raw body pour Stripe
import express from "express";

// IMPORTANT: express.raw AVANT express.json pour la route webhook
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);
// Puis le middleware JSON global de NestJS
```

```typescript
// apps/api/src/livekit/livekit.service.ts — token TTL court
import { AccessToken } from "livekit-server-sdk";

generateRoomToken(userId: string, roomName: string): string {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: userId,
      ttl: 7200, // 2 heures maximum
    }
  );
  
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });
  
  return token.toJwt();
}
```

```env
# apps/api/.env.example — variables Stripe/LiveKit (côté API uniquement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_HOST=wss://your-livekit-instance.com
```

## Tests

### Unit (Stripe)

```typescript
// Test : signature invalide → throw
import Stripe from "stripe";

const stripe = new Stripe("sk_test_invalid");
expect(() => {
  stripe.webhooks.constructEvent(
    Buffer.from('{"type":"test"}'),
    "invalid_signature",
    "whsec_test"
  );
}).toThrow("No signatures found matching the expected signature");
```

### Unit (LiveKit)

```typescript
// Test : TTL du token ≤ 2h
import { AccessToken } from "livekit-server-sdk";
import jwt from "jsonwebtoken";

const token = generateRoomToken("user123", "room456");
const decoded = jwt.decode(token) as { exp: number; iat: number };
const ttl = decoded.exp - decoded.iat;

assert.ok(ttl <= 7200, `TTL ${ttl}s exceeds 2 hours`);
```

## Métriques

| Métrique | Cible |
|----------|-------|
| Webhooks Stripe traités sans vérification de signature | 0 |
| TTL moyen des tokens LiveKit | < 2h |
| Clés secrètes dans NEXT_PUBLIC_ vars | 0 |

## Rollout Plan

> Ce skill s'active uniquement lors de l'implémentation de Stripe ou LiveKit.

1. **Stripe** : créer `apps/api/src/stripe/stripe.module.ts` + configurer `express.raw()` avant json global
2. **LiveKit** : créer `apps/api/src/livekit/livekit.service.ts` avec TTL 2h
3. **Env** : ajouter les variables dans `.env.example` et Coolify
4. **Tests** : valider signature Stripe en staging avec l'outil CLI Stripe (`stripe listen --forward-to`)
5. **Monitoring** : alerter si un webhook retourne `400` (signature invalide)
