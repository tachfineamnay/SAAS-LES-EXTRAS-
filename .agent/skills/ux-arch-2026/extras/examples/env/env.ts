/**
 * examples/env/env.ts
 * 
 * Exemple de schéma Zod pour valider les variables d'environnement
 * du runtime Next.js (apps/web).
 * 
 * Ce fichier est un EXEMPLE de référence — la version réelle doit être créée
 * dans apps/web/src/lib/env.ts (voir skill EX-04).
 * 
 * Usage :
 *   import { env } from "@/lib/env";
 *   const apiUrl = env.API_BASE_URL; // server-side seulement
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schéma
// ---------------------------------------------------------------------------

const envSchema = z.object({
  /**
   * Détermine quel runtime est actif dans le container.
   * - "front" : interface utilisateurs (Talent / Établissement)
   * - "desk"  : backoffice admin
   *
   * Injecté par Coolify via variable d'environnement sur chaque service.
   * Valeur par défaut : "front" (le moins privilégié).
   */
  APP_RUNTIME: z.enum(["front", "desk"]).default("front"),

  /**
   * URL de l'API NestJS pour les appels server-side (SSR, server actions,
   * route handlers). N'est PAS exposée au browser.
   *
   * Exemple : http://api:3001/api  (depuis le container Docker)
   * Exemple :  http://localhost:3001/api (dev local)
   */
  API_BASE_URL: z.string().url({
    message:
      "API_BASE_URL must be a valid URL. Example: http://localhost:3001/api",
  }),

  /**
   * URL de l'API pour les appels client-side (composants React, hooks).
   * Inlinée dans le bundle JavaScript au moment du build — JAMAIS un secret.
   *
   * Exemple : https://api.mondomaine.com/api  (production)
   * Exemple : http://localhost:3001/api        (dev local)
   */
  NEXT_PUBLIC_API_URL: z.string().url({
    message:
      "NEXT_PUBLIC_API_URL must be a valid URL. Example: http://localhost:3001/api",
  }),
});

// ---------------------------------------------------------------------------
// Export type
// ---------------------------------------------------------------------------

export type Env = z.infer<typeof envSchema>;

// ---------------------------------------------------------------------------
// Validation fail-fast
// ---------------------------------------------------------------------------

/**
 * Valide les variables d'environnement au démarrage.
 * Si la validation échoue, affiche les erreurs et appelle process.exit(1).
 *
 * À appeler dans :
 * - apps/web/src/app/layout.tsx (top-level, une seule fois)
 * - ou apps/web/instrumentation.ts (Next.js 14 instrumentation hook)
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables. Aborting startup.");
    console.error(
      JSON.stringify(result.error.flatten().fieldErrors, null, 2)
    );
    process.exit(1);
  }

  return result.data;
}

/**
 * Objet env validé — importer cet objet dans le code applicatif.
 * Ne jamais utiliser process.env directement.
 */
export const env: Env = validateEnv();
