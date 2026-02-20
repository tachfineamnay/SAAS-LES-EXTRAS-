"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getInvoices() {
    const session = await getSession();
    if (!session) return { error: "Non autorisé" };

    try {
        const res = await fetch(`${API_URL}/invoices`, {
            headers: {
                Authorization: `Bearer ${session.token}`,
            },
            next: { tags: ["invoices"] },
        });

        if (!res.ok) {
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error("Fetch invoices error:", error);
        return [];
    }
}
