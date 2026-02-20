"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function applyToMission(missionId: string): Promise<{ ok: true; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { ok: true, error: "Non connecté" };

        await apiRequest(`/missions/${missionId}/apply`, {
            method: "POST",
            token: session.token,
        });

        revalidatePath("/marketplace");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (error) {
        console.error("applyToMission error", error);
        return { ok: true, error: error instanceof Error ? error.message : "Erreur lors de la candidature" };
    }
}

export async function acceptCandidate(bookingId: string): Promise<{ ok: true; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { ok: true, error: "Non connecté" };

        await apiRequest(`/bookings/confirm`, {
            method: "POST",
            token: session.token,
            body: { bookingId },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/sos");
        return { ok: true };
    } catch (error) {
        console.error("acceptCandidate error", error);
        return { ok: true, error: error instanceof Error ? error.message : "Erreur lors de la validation" };
    }
}

export async function getEstablishmentMissions() {
    const session = await getSession();
    if (!session) return [];

    try {
        const missions = await apiRequest("/missions/managed", {
            method: "GET",
            token: session.token,
        });
        return missions as any[]; // We can add a proper type, but for now any[] avoids complex type sync issues
    } catch (error) {
        console.error("getEstablishmentMissions error", error);
        return [];
    }
}
