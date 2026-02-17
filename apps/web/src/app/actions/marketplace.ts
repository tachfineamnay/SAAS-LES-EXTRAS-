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

export async function getMarketplaceData(): Promise<MarketplaceData> {
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

  return {
    missions,
    services,
  };
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
