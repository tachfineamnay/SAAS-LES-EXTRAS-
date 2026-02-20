"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function authorizePayment(bookingId: string) {
    const session = await getSession();
    if (!session) return { error: "Non autorisé" };

    try {
        const res = await fetch(`${API_URL}/bookings/authorize-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.token}`,
            },
            body: JSON.stringify({ bookingId }),
        });

        if (!res.ok) {
            const err = await res.json();
            return { error: err.message || "Erreur lors de la validation du paiement" };
        }

        return { success: true };
    } catch (error) {
        return { error: "Erreur serveur" };
    }
}
