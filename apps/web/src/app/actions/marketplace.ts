"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";

export type MissionStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

// Define ServiceType to match Prisma schema
export type ServiceType = "WORKSHOP" | "TRAINING";

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

type SerializedMission = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  address: string;
  hourlyRate: number;
  status: MissionStatus;
  isRenfort: boolean;
  // Enhanced fields
  isUrgent?: boolean;
  isNetworkMatch?: boolean;
  establishmentName?: string;
  requiredDiploma?: string[];
};

// ...

export async function getMarketplaceData(token?: string): Promise<MarketplaceData> {
  let activeToken = token;
  if (!activeToken) {
    const session = await getSession();
    if (!session) throw new Error("Non connecté");
    activeToken = session.token;
  }

  try {
    const [missions, services] = await Promise.all([
      apiRequest<SerializedMission[]>("/missions", {
        method: "GET",
        token: activeToken,
      }),
      apiRequest<SerializedService[]>("/services", {
        method: "GET",
        token: activeToken,
      }),
    ]);
    // ... (rest of the function stays same)

    // Enhance missions with urgency logic and mock signals
    const enhancedMissions = missions.map((m) => ({
      ...m,
      isUrgent: checkUrgency(m.dateStart),
      isNetworkMatch: Math.random() > 0.7, // Mock: 30% chance of being a network match
      establishmentName: "EHPAD Les Mimosas", // Mock name
      requiredDiploma: ["Infirmier DE", "Permis B"], // Mock diplomas
    })).sort((a, b) => {
      // Sort by isRenfort (true first), then urgency, then date
      if (a.isRenfort && !b.isRenfort) return -1;
      if (!a.isRenfort && b.isRenfort) return 1;
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
        "Données temporairement indisponibles. Vérifiez la connexion API.",
    };
  }
}

export async function createMissionFromSOS(input: CreateMissionInput): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest("/missions", {
    method: "POST",
    token: session.token,
    body: input,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}

export async function createServiceFromPublish(input: CreateServiceInput): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest("/services", {
    method: "POST",
    token: session.token,
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

  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest(`/missions/${missionId}/apply`, {
    method: "POST",
    token: session.token,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}

export async function bookService(serviceId: string): Promise<{ ok: true }> {
  if (!serviceId) {
    throw new Error("Service manquant.");
  }

  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest(`/services/${serviceId}/book`, {
    method: "POST",
    token: session.token,
  });

  revalidatePath("/marketplace");
  revalidatePath("/bookings");
  return { ok: true };
}
