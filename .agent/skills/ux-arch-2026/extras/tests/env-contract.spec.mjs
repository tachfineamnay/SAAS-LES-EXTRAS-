/**
 * tests/env-contract.spec.mjs
 *
 * Valide le schéma Zod du contrat env (EX-04) en isolation,
 * sans dépendance sur le code Next.js.
 *
 * Usage : node --test .agent/skills/ux-arch-2026/extras/tests/env-contract.spec.mjs
 *
 * Ce test utilise une re-implémentation inline du schéma Zod
 * pour éviter les imports de modules applicatifs (qui nécessiteraient
 * un build Next.js). Le but est de valider la LOGIQUE du schéma.
 *
 * Prérequis : zod installé dans le workspace
 *   npm install zod -w @lesextras/web
 *   ou : npm install zod (workspace root)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Schéma inline (copie de examples/env/env.ts pour les tests)
// ---------------------------------------------------------------------------

/**
 * Implémentation minimale du schéma de validation env sans dépendance Zod.
 * Permet de valider la logique sans installer Zod dans les devDependencies racine.
 *
 * En production (apps/web/src/lib/env.ts), utiliser Zod.
 */
function validateEnvSchema(input) {
    const errors = [];

    // APP_RUNTIME
    const validRuntimes = ["front", "desk"];
    const runtime = input.APP_RUNTIME ?? "front"; // default
    if (!validRuntimes.includes(runtime)) {
        errors.push(
            `APP_RUNTIME must be "front" or "desk", got: "${input.APP_RUNTIME}"`
        );
    }

    // API_BASE_URL — must be a valid http/https URL
    if (!input.API_BASE_URL) {
        errors.push("API_BASE_URL is required");
    } else {
        try {
            const parsed = new URL(input.API_BASE_URL);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                errors.push(
                    `API_BASE_URL must use http or https protocol, got: "${input.API_BASE_URL}"`
                );
            }
        } catch {
            errors.push(
                `API_BASE_URL must be a valid URL, got: "${input.API_BASE_URL}"`
            );
        }
    }

    // NEXT_PUBLIC_API_URL — must be a valid http/https URL
    if (!input.NEXT_PUBLIC_API_URL) {
        errors.push("NEXT_PUBLIC_API_URL is required");
    } else {
        try {
            const parsed = new URL(input.NEXT_PUBLIC_API_URL);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                errors.push(
                    `NEXT_PUBLIC_API_URL must use http or https protocol, got: "${input.NEXT_PUBLIC_API_URL}"`
                );
            }
        } catch {
            errors.push(
                `NEXT_PUBLIC_API_URL must be a valid URL, got: "${input.NEXT_PUBLIC_API_URL}"`
            );
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            APP_RUNTIME: runtime,
            API_BASE_URL: input.API_BASE_URL,
            NEXT_PUBLIC_API_URL: input.NEXT_PUBLIC_API_URL,
        },
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("env-contract — schema validation (EX-04)", () => {
    // -------------------------------------------------------------------------
    // Cas valides
    // -------------------------------------------------------------------------

    it("should accept a valid minimal config (localhost)", () => {
        const result = validateEnvSchema({
            API_BASE_URL: "http://localhost:3001/api",
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        });

        assert.ok(result.success, `Unexpected errors: ${result.errors?.join(", ")}`);
        assert.strictEqual(result.data.APP_RUNTIME, "front"); // default
        assert.strictEqual(result.data.API_BASE_URL, "http://localhost:3001/api");
    });

    it("should accept APP_RUNTIME=desk", () => {
        const result = validateEnvSchema({
            APP_RUNTIME: "desk",
            API_BASE_URL: "http://localhost:3001/api",
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        });

        assert.ok(result.success);
        assert.strictEqual(result.data.APP_RUNTIME, "desk");
    });

    it("should default APP_RUNTIME to 'front' when absent", () => {
        const result = validateEnvSchema({
            API_BASE_URL: "https://api.example.com/api",
            NEXT_PUBLIC_API_URL: "https://api.example.com/api",
        });

        assert.ok(result.success);
        assert.strictEqual(result.data.APP_RUNTIME, "front");
    });

    it("should accept HTTPS production URLs", () => {
        const result = validateEnvSchema({
            APP_RUNTIME: "front",
            API_BASE_URL: "https://api.lesextras.com/api",
            NEXT_PUBLIC_API_URL: "https://api.lesextras.com/api",
        });

        assert.ok(result.success);
    });

    // -------------------------------------------------------------------------
    // Cas invalides
    // -------------------------------------------------------------------------

    it("should reject missing API_BASE_URL", () => {
        const result = validateEnvSchema({
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        });

        assert.ok(!result.success, "Should have failed validation");
        assert.ok(
            result.errors.some((e) => e.includes("API_BASE_URL")),
            `Expected error about API_BASE_URL, got: ${result.errors.join(", ")}`
        );
    });

    it("should reject invalid API_BASE_URL (not a URL)", () => {
        const result = validateEnvSchema({
            API_BASE_URL: "not-a-url",
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        });

        assert.ok(!result.success);
        assert.ok(result.errors.some((e) => e.includes("API_BASE_URL")));
    });

    it("should reject missing NEXT_PUBLIC_API_URL", () => {
        const result = validateEnvSchema({
            API_BASE_URL: "http://localhost:3001/api",
        });

        assert.ok(!result.success);
        assert.ok(result.errors.some((e) => e.includes("NEXT_PUBLIC_API_URL")));
    });

    it("should reject invalid NEXT_PUBLIC_API_URL (plain string)", () => {
        const result = validateEnvSchema({
            API_BASE_URL: "http://localhost:3001/api",
            NEXT_PUBLIC_API_URL: "localhost:3001", // missing protocol
        });

        assert.ok(!result.success);
        assert.ok(result.errors.some((e) => e.includes("NEXT_PUBLIC_API_URL")));
    });

    it("should reject invalid APP_RUNTIME", () => {
        const result = validateEnvSchema({
            APP_RUNTIME: "invalid-runtime",
            API_BASE_URL: "http://localhost:3001/api",
            NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        });

        assert.ok(!result.success);
        assert.ok(result.errors.some((e) => e.includes("APP_RUNTIME")));
    });

    // -------------------------------------------------------------------------
    // Sécurité : aucun secret dans NEXT_PUBLIC_
    // -------------------------------------------------------------------------

    it("should not expose secrets via NEXT_PUBLIC_ prefix (documentation check)", () => {
        // Ce test vérifie la convention de nommage — pas la valeur
        // Les variables suivantes ne doivent JAMAIS exister dans l'env :
        const forbiddenPublicVars = [
            "NEXT_PUBLIC_JWT_SECRET",
            "NEXT_PUBLIC_DATABASE_URL",
            "NEXT_PUBLIC_STRIPE_SECRET_KEY",
        ];

        for (const varName of forbiddenPublicVars) {
            assert.ok(
                !(varName in process.env),
                `Secret variable "${varName}" should NOT be prefixed with NEXT_PUBLIC_`
            );
        }
    });
});
