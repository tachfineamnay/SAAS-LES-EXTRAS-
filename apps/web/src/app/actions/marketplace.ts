"use server";

import { revalidatePath } from "next/cache";
import { getDemoAuth } from "@/app/actions/_shared/demo-auth";
import { apiRequest } from "@/lib/api";

export type MissionStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
export type ServiceType = "WORKSHOP" | "TRAINING";

type SerializedMission = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  address: string;
  hourlyRate: number;
  status: MissionStatus;
  // Enhanced fields
  isUrgent?: boolean;
  isNetworkMatch?: boolean;
  establishmentName?: string;
  requiredDiploma?: string[];
};

type SerializedService = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: ServiceType;
  capacity: number;
};

export type MarketplaceData = {
  missions: SerializedMission[];
  services: SerializedService[];
  isDegraded: boolean;
  degradedReason?: string;
};

type CreateMissionInput = {
  title: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  address: string;
};

type CreateServiceInput = {
  title: string;
  description?: string;
  price: number;
  type: ServiceType;
  capacity: number;
};

// Helper to determine urgency (start within 24h)
function checkUrgency(dateString: string): boolean {
  try {
    const start = new Date(dateString);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 24;
  } catch {
    return false;
  }
}

export async function getMarketplaceData(): Promise<MarketplaceData> {
  try {
    const [clientAuth, talentAuth] = await Promise.all([
      getDemoAuth("CLIENT"),
      getDemoAuth("TALENT"),
    ]);

    const [missions, services] = await Promise.all([
      apiRequest<SerializedMission[]>("/missions", {
        method: "GET",
        token: talentAuth.token,
      }),
      apiRequest<SerializedService[]>("/services", {
        method: "GET",
        token: clientAuth.token,
      }),
    ]);

    // Enhance missions with urgency logic and mock signals
    const enhancedMissions = missions.map((m) => ({
      ...m,
      isUrgent: checkUrgency(m.dateStart),
      isNetworkMatch: Math.random() > 0.7, // Mock: 30% chance of being a network match
      establishmentName: "EHPAD Les Mimosas", // Mock name
      requiredDiploma: ["Infirmier DE", "Permis B"], // Mock diplomas
    })).sort((a, b) => {
      // Sort by urgency first, then date
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
    });

    return {
      missions: enhancedMissions,
      services,
      isDegraded: false,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue lors du chargement de la marketplace.";

    console.error("[marketplace] degraded mode enabled:", message);

    return {
      missions: [],
      services: [],
      isDegraded: true,
      degradedReason:
        "Données temporairement indisponibles. Vérifiez la connexion API et les comptes démo.",
    };
  }
}

export async function createMissionFromSOS(input: CreateMissionInput): Promise<{ ok: true }> {
  const clientAuth = await getDemoAuth("CLIENT");

  await apiRequest("/missions", {
    method: "POST",
    token: clientAuth.token,
    body: input,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}

export async function createServiceFromPublish(input: CreateServiceInput): Promise<{ ok: true }> {
  const talentAuth = await getDemoAuth("TALENT");

  await apiRequest("/services", {
    method: "POST",
    token: talentAuth.token,
    body: input,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}

export async function applyToMission(missionId: string): Promise<{ ok: true }> {
  if (!missionId) {
    throw new Error("Mission manquante.");
  }

  const talentAuth = await getDemoAuth("TALENT");

  await apiRequest(`/missions/${missionId}/apply`, {
    method: "POST",
    token: talentAuth.token,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}

export async function bookService(serviceId: string): Promise<{ ok: true }> {
  if (!serviceId) {
    throw new Error("Service manquant.");
  }

  const clientAuth = await getDemoAuth("CLIENT");

  await apiRequest(`/services/${serviceId}/book`, {
    method: "POST",
    token: clientAuth.token,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}
