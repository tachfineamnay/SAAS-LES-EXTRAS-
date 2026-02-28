/**
 * examples/health/route.ts
 *
 * Handler GET /health pour Next.js App Router — version enrichie.
 *
 * Ce fichier est un EXEMPLE de référence isolé dans le pack.
 * Le fichier réel est : apps/web/src/app/health/route.ts
 *
 * Caractéristiques :
 * - Répond HTTP 200 sans authentification
 * - Pas de requête DB, pas d'appel réseau (< 200 ms garanti)
 * - Retourne JSON { status, service } pour les healthchecks structurés
 * - Compatible avec Docker HEALTHCHECK et Coolify
 *
 * Voir skill EX-02 pour les règles complètes.
 */

import { NextResponse } from "next/server";

/**
 * GET /health
 *
 * Endpoint de santé du container Next.js.
 * Utilisé par :
 * - Docker HEALTHCHECK (CMD curl -f http://localhost:3000/health)
 * - Coolify health path
 * - Monitoring externe
 *
 * ⚠️ Ne pas ajouter de logique métier ici.
 * ⚠️ Le middleware doit laisser passer cette route (NextResponse.next()).
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        {
            status: "ok",
            service: "lesextras-web",
            runtime: process.env.APP_RUNTIME ?? "front",
            timestamp: new Date().toISOString(),
        },
        {
            status: 200,
            headers: {
                // Cache-Control: pas de mise en cache pour les healthchecks
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        }
    );
}
