"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { apiRequest, safeApiRequest, toUserFacingApiError } from "@/lib/api";
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

export type CreditsSummary = {
    availableCredits: number | null;
    purchaseHistory: CreditPurchaseHistoryItem[];
    creditsError: string | null;
    historyError: string | null;
};

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
            error: toUserFacingApiError(
                error,
                "Impossible d'ajouter ce pack pour le moment.",
            ),
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

export async function getCreditsSummarySafe(token?: string): Promise<CreditsSummary> {
    const activeToken = token || (await getSession())?.token;
    if (!activeToken) {
        return {
            availableCredits: null,
            purchaseHistory: [],
            creditsError: "Non connecté",
            historyError: "Non connecté",
        };
    }

    const [creditsResult, historyResult] = await Promise.all([
        safeApiRequest<CreditsResponse>(
            "/users/me/credits",
            {
                method: "GET",
                token: activeToken,
                label: "credits.balance",
            },
            "Impossible de charger le solde de crédits pour le moment.",
        ),
        safeApiRequest<CreditPurchaseHistoryItem[]>(
            "/users/me/credits/history",
            {
                method: "GET",
                token: activeToken,
                label: "credits.history",
            },
            "Impossible de charger l'historique des crédits pour le moment.",
        ),
    ]);

    const availableCredits =
        creditsResult.ok && typeof creditsResult.data.availableCredits === "number"
            ? creditsResult.data.availableCredits
            : null;

    return {
        availableCredits,
        purchaseHistory: historyResult.ok ? historyResult.data : [],
        creditsError: creditsResult.ok ? null : creditsResult.error,
        historyError: historyResult.ok ? null : historyResult.error,
    };
}
