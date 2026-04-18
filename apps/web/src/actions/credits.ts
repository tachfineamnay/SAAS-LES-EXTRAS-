"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

export type PackType = "STARTER" | "PRO" | "ENTERPRISE";

type CreditsResponse = {
    availableCredits: number;
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
        return 0;
    }

    try {
        const response = await apiRequest<CreditsResponse>("/users/me/credits", {
            method: "GET",
            token: activeToken,
        });

        return response.availableCredits ?? 0;
    } catch (error) {
        throw error instanceof Error
            ? error
            : new Error("Impossible de charger le solde de crédits.");
    }
}
