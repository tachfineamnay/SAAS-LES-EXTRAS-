"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { ServiceSlot } from "@/lib/atelier-config";

export type MissionStatus = "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
export type ServiceType = "WORKSHOP" | "TRAINING";
export type PricingType = "SESSION" | "PER_PARTICIPANT" | "QUOTE";

export type SerializedService = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: ServiceType;
  capacity: number;
  // Extended atelier fields
  pricingType: PricingType;
  pricePerParticipant: number | null;
  durationMinutes: number;
  category: string | null;
  publicCible: string[] | null;
  materials: string | null;
  objectives: string | null;
  methodology: string | null;
  evaluation: string | null;
  slots: ServiceSlot[] | null;
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

type MissionSlot = {
  date: string;
  heureDebut: string;
  heureFin: string;
};

type CreateMissionInput = {
  title: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  address: string;
  isRenfort?: boolean;
  metier?: string;
  shift?: "JOUR" | "NUIT";
  city?: string;
  zipCode?: string;
  slots?: MissionSlot[];
  // SOS Renfort v2
  description?: string;
  establishmentType?: string;
  targetPublic?: string[];
  unitSize?: string;
  requiredSkills?: string[];
  diplomaRequired?: boolean;
  hasTransmissions?: boolean;
  perks?: string[];
  exactAddress?: string;
  accessInstructions?: string;
};

type CreateServiceInput = {
  title: string;
  description?: string;
  price: number;
  type: ServiceType;
  capacity: number;
  pricingType?: PricingType;
  pricePerParticipant?: number;
  durationMinutes?: number;
  category?: string;
  publicCible?: string[];
  materials?: string;
  objectives?: string;
  methodology?: string;
  evaluation?: string;
  slots?: ServiceSlot[];
};

export type SerializedMission = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
  address: string;
  hourlyRate: number;
  status: MissionStatus;
  isRenfort: boolean;
  metier?: string | null;
  shift?: string | null;
  city?: string | null;
  zipCode?: string | null;
  slots?: MissionSlot[] | null;
  // SOS Renfort v2
  description?: string | null;
  establishmentType?: string | null;
  targetPublic?: string[] | null;
  unitSize?: string | null;
  requiredSkills?: string[] | null;
  diplomaRequired?: boolean | null;
  hasTransmissions?: boolean | null;
  perks?: string[] | null;
  exactAddress?: string | null;
  accessInstructions?: string | null;
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

export type SerializedTalent = {
  id: string;
  email: string;
  profile?: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    jobTitle: string | null;
    city: string | null;
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
    apiRequest<SerializedService[]>("/services", { method: "GET", token: activeToken }).catch((err) => {
      console.error("getMarketplaceCatalogue /services error", err);
      return [] as SerializedService[];
    }),
    getTalents(activeToken),
  ]);

  return { services, talents };
}

export async function getMarketplaceData(token?: string): Promise<MarketplaceData> {
  return { missions: [], services: [], isDegraded: false };
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

export async function createMissionFromRenfort(input: CreateMissionInput): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest("/missions", {
    method: "POST",
    token: session.token,
    body: input,
  });

  try {
    revalidatePath("/marketplace");
    revalidatePath("/bookings");
    revalidatePath("/dashboard/renforts");
  } catch {
    // Revalidation errors should not fail the action
  }
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
  if (!missionId) throw new Error("Mission manquante.");

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
  message?: string,
  nbParticipants?: number,
): Promise<{ ok: true } | { error: string }> {
  if (!serviceId) return { error: "Service manquant." };

  const session = await getSession();
  if (!session) return { error: "Non connecté" };

  try {
    await apiRequest(`/services/${serviceId}/book`, {
      method: "POST",
      token: session.token,
      body: {
        date: date.toISOString(),
        message,
        nbParticipants,
      },
    });

    revalidatePath("/marketplace");
    revalidatePath("/bookings");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Erreur lors de la réservation",
    };
  }
}
