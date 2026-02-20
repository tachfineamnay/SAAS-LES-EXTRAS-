"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

type PackType = "STARTER" | "PRO" | "ENTERPRISE";

const PACKS = {
    STARTER: { amount: 150, credits: 1 },
    PRO: { amount: 400, credits: 3 },
    ENTERPRISE: { amount: 600, credits: 5 },
};

export async function buyPack(packType: PackType): Promise<{ ok: true } | { error: string }> {
    const session = await getSession();
    if (!session) {
        return { error: "Non connecté" };
    }

    const pack = PACKS[packType];
    if (!pack) {
        return { error: "Pack invalide" };
    }

    // In a real scenario, this would initiate a Stripe Checkout session.
    // For the MVP, we directly simulate the purchase via a call to the API (or DB transaction).
    // Since we don't have a direct 'buyPack' endpoint in the API yet, we'll assume we can use a generic endpoint
    // or that we should implement the logic here using a direct DB call if we were server-side?
    // But this is a Next.js Server Action in 'apps/web', it cannot access 'apps/api' DB directly ideally (microservices).
    // However, the instructions said: "simule l'achat du pack via une Server Action simple".
    // Let's call the API to update the profile.
    // We need an endpoint to add credits. 
    // If no endpoint exists, we might need to add one to UsersController.
    // Given user instructions "Ne crée pas encore d'intégration Stripe complexe... server action simple",
    // I will add a new endpoint to UsersController to "add credits" for simulation.

    try {
        await apiRequest("/users/me/credits/buy", {
            method: "POST",
            token: session.token,
            body: {
                amount: pack.amount,
                credits: pack.credits,
            },
        });

        revalidatePath("/dashboard");
        return { ok: true };
    } catch (error) {
        console.error("Buy Pack Error:", error);
        return { error: "Erreur lors de l'achat du pack." };
    }
}

export async function getCredits(): Promise<number> {
    const session = await getSession();
    if (!session) return 0;

    try {
        // We fetch the profile to get credits.
        // In a real app we'd likely have a specific endpoint or use Prisma directly if safe.
        // For MVP we use the profile endpoint.
        const profile = await apiRequest<any>("/users/me/profile", {
            method: "GET",
            token: session.token
        });
        return profile?.availableCredits || 0;
    } catch (e) {
        console.error("Failed to fetch credits", e);
        return 0;
    }
}
