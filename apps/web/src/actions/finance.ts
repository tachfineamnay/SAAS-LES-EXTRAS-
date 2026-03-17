"use server";

import { getSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SerializedInvoice {
    id: string;
    invoiceNumber: string;
    createdAt: string;
    amount: number;
    status: string;
    pdfUrl?: string;
    booking?: {
        freelance?: {
            profile?: {
                firstName: string;
                lastName: string;
            };
        };
    };
}

export async function getInvoices(): Promise<SerializedInvoice[]> {
    const session = await getSession();
    if (!session) return [];

    const res = await fetch(`${API_URL}/invoices`, {
        headers: {
            Authorization: `Bearer ${session.token}`,
        },
        next: { tags: ["invoices"] },
    });

    if (!res.ok) {
        throw new Error(`Invoices API responded with ${res.status}`);
    }

    return (await res.json()) as SerializedInvoice[];
}
