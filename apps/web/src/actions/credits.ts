"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import type { CreditPackId } from "@/lib/credit-packs";

export type PackType = CreditPackId;

type CreditsResponse = {
    availableCredits: number;
};

export type CreditPurchaseHistoryItem = {
    id: string;
    amount: number;
    creditsAdded: number;
    createdAt: string;
};

type BuyPackResult =
    | { ok: true; availableCredits: number }
    | { error: string };

export async function buyPack(packType: PackType): Promise<BuyPackResult> {
    const session = await getSession();
    if (!session) {
        return { error: "Non connecté" };
    }

    try {
        const response = await apiRequest<CreditsResponse>("/users/me/credits/buy", {
            method: "POST",
            token: session.token,
            body: {
                packType,
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/packs");
        revalidatePath("/account");
        revalidatePath("/account/establishment");

        return { ok: true, availableCredits: response.availableCredits };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'achat du pack.",
        };
    }
}

export async function getCredits(token?: string): Promise<number> {
    const activeToken = token || (await getSession())?.token;
    if (!activeToken) {
        throw new Error("Non connecté");
    }

    try {
        const response = await apiRequest<CreditsResponse>("/users/me/credits", {
            method: "GET",
            token: activeToken,
        });

        if (typeof response.availableCredits !== "number") {
            throw new Error("Réponse crédits invalide.");
        }

        return response.availableCredits;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Impossible de charger le solde de crédits.");
    }
}

export async function getCreditPurchaseHistory(
    token?: string,
): Promise<CreditPurchaseHistoryItem[]> {
    const activeToken = token || (await getSession())?.token;
    if (!activeToken) {
        throw new Error("Non connecté");
    }

    try {
        return await apiRequest<CreditPurchaseHistoryItem[]>("/users/me/credits/history", {
            method: "GET",
            token: activeToken,
        });
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Impossible de charger l'historique des achats.");
    }
}
