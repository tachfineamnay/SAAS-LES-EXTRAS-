"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";
import { atelierInvalidationPaths } from "@/lib/atelier-query-keys";
import type { ServiceSlot } from "@/lib/atelier-config";
import type {
  MissionPlanningLine,
  RenfortPublicationMode,
} from "@/lib/mission-planning";
import { getMissionPlanning } from "@/lib/mission-planning";

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
  imageUrl?: string | null;
  scheduleInfo?: string | null;
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
  isRenfort?: boolean;
  metier?: string;
  shift?: "JOUR" | "NUIT";
  city?: string;
  zipCode?: string;
  planning?: MissionPlanningLine[];
  publicationMode?: RenfortPublicationMode;
  slots?: MissionPlanningLine[];
  // SOS Renfort v2
  description?: string;
  establishmentType?: string;
  targetPublic?: string[];
  unitSize?: string;
  requiredSkills?: string[];
  diplomaRequired?: boolean;
  hasTransmissions?: boolean;
  transmissionTime?: string;
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
  imageUrl?: string;
  scheduleInfo?: string;
  status?: "DRAFT" | "ACTIVE";
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
  planning?: MissionPlanningLine[] | null;
  slots?: MissionPlanningLine[] | null;
  // SOS Renfort v2
  description?: string | null;
  establishmentType?: string | null;
  targetPublic?: string[] | null;
  unitSize?: string | null;
  requiredSkills?: string[] | null;
  diplomaRequired?: boolean | null;
  hasTransmissions?: boolean | null;
  transmissionTime?: string | null;
  perks?: string[] | null;
  exactAddress?: string | null;
  accessInstructions?: string | null;
  isUrgent?: boolean;
  isNetworkMatch?: boolean;
  establishmentName?: string;
  requiredDiploma?: string[];
  establishment?: {
    profile?: {
      companyName: string | null;
      city: string | null;
      avatar: string | null;
    } | null;
  };
};

export type SerializedFreelance = {
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

export type SerializedReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar: string | null;
      companyName: string | null;
    } | null;
  };
};

export type SerializedFreelanceDetail = {
  id: string;
  email: string;
  isAvailable: boolean;
  profile?: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    jobTitle: string | null;
    bio: string | null;
    city: string | null;
    skills: string[];
    siret: string | null;
    availableDays?: string[];
  } | null;
  reviewsReceived: SerializedReview[];
  ownerServices: SerializedService[];
};

export async function getAvailableMissions(token?: string): Promise<SerializedMission[]> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return [];

  try {
    const missions = await apiRequest<SerializedMission[]>("/missions", {
      method: "GET",
      token: activeToken,
    });
    return missions.sort((a, b) => {
      const left = getMissionPlanning(a);
      const right = getMissionPlanning(b);
      const leftDate = left.nextSlot?.start ?? left.firstSlot?.start ?? new Date(a.dateStart);
      const rightDate = right.nextSlot?.start ?? right.firstSlot?.start ?? new Date(b.dateStart);
      return leftDate.getTime() - rightDate.getTime();
    });
  } catch (error) {
    console.error("getAvailableMissions error", error);
    return [];
  }
}

export async function getAvailableMission(id: string, token?: string): Promise<SerializedMission | null> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return null;

  try {
    return await apiRequest<SerializedMission>(`/missions/${id}`, {
      method: "GET",
      token: activeToken,
    });
  } catch (error) {
    console.error("getAvailableMission error", error);
    return null;
  }
}

export async function getFreelances(token?: string): Promise<SerializedFreelance[]> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return [];

  try {
    return await apiRequest<SerializedFreelance[]>("/users/freelances", {
      method: "GET",
      token: activeToken,
    });
  } catch (error) {
    console.error("getFreelances error", error);
    return [];
  }
}

export async function getMarketplaceCatalogue(token?: string) {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return { services: [], freelances: [] };

  const [services, freelances] = await Promise.all([
    apiRequest<SerializedService[]>("/services", { method: "GET", token: activeToken }).catch((err) => {
      console.error("getMarketplaceCatalogue /services error", err);
      return [] as SerializedService[];
    }),
    getFreelances(activeToken),
  ]);

  return { services, freelances };
}

export type MesAtelierBooking = {
  id: string;
  status: string;
  scheduledAt: string | null;
  nbParticipants: number | null;
  establishment: {
    id: string;
    profile: { firstName: string | null; lastName: string | null; companyName: string | null } | null;
  };
};

export type MesAtelierItem = SerializedService & {
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  bookings?: MesAtelierBooking[];
};

export async function getMyAteliers(token?: string): Promise<MesAtelierItem[]> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return [];

  try {
    const services = await apiRequest<(SerializedService & { status?: string })[]>("/services/my", {
      method: "GET",
      token: activeToken,
    });

    return services
      .map((service) => ({
        ...service,
        status: (service.status as MesAtelierItem["status"]) || "ACTIVE",
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "fr"));
  } catch (error) {
    console.error("getMyAteliers error", error);
    throw error instanceof Error
      ? error
      : new Error("Impossible de charger vos ateliers.");
  }
}

export async function updateServiceAction(
  id: string,
  data: Record<string, unknown>,
  token?: string,
): Promise<SerializedService | null> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return null;

  try {
    return await apiRequest<SerializedService>(`/services/${id}`, {
      method: "PATCH",
      body: data,
      token: activeToken,
    });
  } catch (error) {
    console.error("updateService error", error);
    return null;
  }
}

export async function deleteServiceAction(
  id: string,
  token?: string,
): Promise<boolean> {
  const activeToken = token || (await getSession())?.token;
  if (!activeToken) return false;

  try {
    await apiRequest(`/services/${id}`, {
      method: "DELETE",
      token: activeToken,
    });
    return true;
  } catch (error) {
    console.error("deleteService error", error);
    return false;
  }
}

/** @deprecated Stub returning empty data — use getAvailableMissions() or getMarketplaceCatalogue() instead. */
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

export async function getFreelanceById(id: string, token?: string): Promise<SerializedFreelanceDetail | null> {
  let activeToken = token;
  if (!activeToken) {
    const session = await getSession();
    if (!session) return null;
    activeToken = session.token;
  }

  try {
    return await apiRequest<SerializedFreelanceDetail>(`/users/freelances/${id}`, {
      method: "GET",
      token: activeToken,
    });
  } catch (error) {
    console.error("getFreelanceById error:", error);
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
    revalidatePath("/dashboard");
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

  revalidatePath(atelierInvalidationPaths.catalogue);
  revalidatePath(atelierInvalidationPaths.bookings);
  revalidatePath(atelierInvalidationPaths.dashboard);
  revalidatePath(atelierInvalidationPaths.mesAteliers);
  return { ok: true };
}

function getServiceBookingErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Erreur lors de la réservation";
  }

  const message = error.message.trim();
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("déjà")) {
    return "Vous avez déjà une demande active pour cet atelier.";
  }

  if (normalized.includes("service not found")) {
    return "Atelier ou formation introuvable.";
  }

  return message || "Erreur lors de la réservation";
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

    revalidatePath(atelierInvalidationPaths.catalogue);
    revalidatePath(atelierInvalidationPaths.bookings);
    revalidatePath(atelierInvalidationPaths.dashboard);
    revalidatePath(atelierInvalidationPaths.mesAteliers);
    return { ok: true };
  } catch (error) {
    return { error: getServiceBookingErrorMessage(error) };
  }
}
