"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SerializedQuote {
    id: string;
    amount: number;
    description: string;
    startDate: string;
    endDate: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    freelance: {
        profile?: {
            firstName: string;
            lastName: string;
        };
    };
}

export async function getQuotes(token: string): Promise<SerializedQuote[]> {
    const res = await fetch(`${API_URL}/quotes`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        next: { tags: ["quotes"] },
    });

    if (!res.ok) {
        throw new Error(`Quotes API responded with ${res.status}`);
    }

    return (await res.json()) as SerializedQuote[];
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
