"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { SerializedMission } from "@/app/actions/marketplace";

/**
 * A managed mission as returned by /missions/managed — extends SerializedMission
 * with the embedded bookings array used by the renforts board.
 */
export type EstablishmentMission = SerializedMission & {
    bookings: Array<{ id: string; status: string; freelanceId?: string }>;
    metierLabel?: string;
};

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
            body: { lineType: "BOOKING", lineId: bookingId },
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

    const missions = await apiRequest("/missions/managed", {
        method: "GET",
        token: session.token,
    });
    return Array.isArray(missions) ? (missions as EstablishmentMission[]) : [];
}

export async function getAvailableMissions(token: string): Promise<SerializedMission[]> {
    const missions = await apiRequest("/missions", {
        method: "GET",
        token,
    });
    return Array.isArray(missions) ? (missions as SerializedMission[]) : [];
}
