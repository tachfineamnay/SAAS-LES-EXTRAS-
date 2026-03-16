"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";

type ApplyInput = {
    motivation?: string;
    proposedRate?: number;
};

export async function applyToMission(
    missionId: string,
    input?: ApplyInput,
): Promise<{ ok: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { ok: false, error: "Non connecté" };

        await apiRequest(`/missions/${missionId}/apply`, {
            method: "POST",
            token: session.token,
            body: input ?? {},
        });

        revalidatePath("/marketplace");
        revalidatePath("/dashboard");
        return { ok: true };
    } catch (error) {
        console.error("applyToMission error", error);
        if (error instanceof Error && error.message.toLowerCase().includes("already applied")) {
            return { ok: false, error: "Vous avez déjà postulé à cette mission." };
        }
        return { ok: false, error: error instanceof Error ? error.message : "Erreur lors de la candidature" };
    }
}

export async function acceptCandidate(bookingId: string): Promise<{ ok: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { ok: false, error: "Non connecté" };

        await apiRequest(`/bookings/confirm`, {
            method: "POST",
            token: session.token,
            body: { bookingId },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/renforts");
        return { ok: true };
    } catch (error) {
        console.error("acceptCandidate error", error);
        return { ok: false, error: error instanceof Error ? error.message : "Erreur lors de la validation" };
    }
}

export async function declineCandidate(bookingId: string): Promise<{ ok: boolean; error?: string }> {
    try {
        const session = await getSession();
        if (!session) return { ok: false, error: "Non connecté" };

        await apiRequest(`/bookings/cancel`, {
            method: "POST",
            token: session.token,
            body: { lineType: "MISSION", lineId: bookingId },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/renforts");
        return { ok: true };
    } catch (error) {
        console.error("declineCandidate error", error);
        return { ok: false, error: error instanceof Error ? error.message : "Erreur lors du refus" };
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
