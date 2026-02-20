"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getQuotes(token: string) {
    try {
        const res = await fetch(`${API_URL}/quotes`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: { tags: ["quotes"] },
        });

        if (!res.ok) {
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error("Fetch quotes error:", error);
        return [];
    }
}

export async function acceptQuote(quoteId: string) {
    const session = await getSession();
    if (!session) return { error: "Non autorisé" };

    try {
        const res = await fetch(`${API_URL}/quotes/${quoteId}/accept`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${session.token}`,
            },
        });

        if (!res.ok) {
            const err = await res.json();
            return { error: err.message || "Erreur lors de l'acceptation" };
        }

        return { success: true };
    } catch (error) {
        return { error: "Erreur serveur" };
    }
}
