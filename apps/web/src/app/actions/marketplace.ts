"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";

export type MissionStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";

// Define ServiceType to match Prisma schema
export type ServiceType = "WORKSHOP" | "TRAINING";

export type SerializedService = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: ServiceType;
  capacity: number;
  owner?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar: string | null;
      jobTitle: string | null;
      bio: string | null;
    } | null;
  };
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
  owner?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar: string | null;
      jobTitle: string | null;
      bio: string | null;
    } | null;
  };
};

// ... 

export type SerializedMission = {
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
  client?: {
    profile?: {
      companyName: string | null;
      city: string | null;
      avatar: string | null;
    } | null;
  };
};

// ...

// ... types ...

export type SerializedTalent = {
  id: string;
  email: string;
  profile?: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    jobTitle: string | null;
    city: string | null;
    // Add other fields as needed
  } | null;
};

export async function getAvailableMissions(token?: string): Promise<SerializedMission[]> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return [];

  try {
    const missions = await apiRequest<SerializedMission[]>("/missions", {
      method: "GET",
      token: activeToken,
    });

    // Sort logic (can be moved here or kept in component)
    return missions.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
  } catch (error) {
    console.error("getAvailableMissions error", error);
    return [];
  }
}

export async function getTalents(token?: string): Promise<SerializedTalent[]> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return [];

  try {
    return await apiRequest<SerializedTalent[]>("/users/talents", {
      method: "GET",
      token: activeToken,
    });
  } catch (error) {
    console.error("getTalents error", error);
    return [];
  }
}

export async function getMarketplaceCatalogue(token?: string) {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return { services: [], talents: [] };

  const [services, talents] = await Promise.all([
    apiRequest<SerializedService[]>("/services", { method: "GET", token: activeToken }),
    getTalents(activeToken)
  ]);

  return { services, talents };
}

// Keep legacy for now or refactor page to use new ones
export async function getMarketplaceData(token?: string): Promise<MarketplaceData> {
  // ... existing implementation or redirect to new logic ...
  // For safety, let's leave it as is for now, but the page will use specific functions.
  return {
    missions: [],
    services: [],
    isDegraded: false
  }
}

export async function getService(id: string, token?: string): Promise<SerializedService | null> {
  let activeToken = token;
  if (!activeToken) {
    const session = await getSession();
    if (!session) return null;
    activeToken = session.token;
  }

  try {
    return await apiRequest<SerializedService>(`/services/${id}`, {
      method: "GET",
      token: activeToken,
    });
  } catch (error) {
    console.error("GetService error:", error);
    return null;
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

export async function bookService(
  serviceId: string,
  date: Date,
  message?: string
): Promise<{ ok: true } | { error: string }> {
  if (!serviceId) {
    return { error: "Service manquant." };
  }

  const session = await getSession();
  if (!session) return { error: "Non connecté" };

  try {
    await apiRequest(`/services/${serviceId}/book`, {
      method: "POST",
      token: session.token,
      body: {
        date: date.toISOString(),
        message,
      },
    });

    revalidatePath("/marketplace");
    revalidatePath("/bookings");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Erreur lors de la réservation"
    };
  }
}
