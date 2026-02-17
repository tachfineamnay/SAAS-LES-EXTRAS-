"use server";

import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/app/actions/_shared/admin-session";
import { apiRequest } from "@/lib/api";

export type AdminUserRole = "CLIENT" | "TALENT" | "ADMIN";
export type AdminUserStatus = "PENDING" | "VERIFIED" | "BANNED";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
};

export type AdminUserProfileDetails = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  jobTitle: string | null;
  bio: string | null;
  avatar: string | null;
};

export type AdminMissionRow = {
  id: string;
  title: string;
  address: string;
  city: string;
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  clientName: string;
  clientEmail: string;
  candidatesCount: number;
};

export type AdminServiceRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: "WORKSHOP" | "TRAINING";
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  talentName: string;
  talentEmail: string;
};

type GetAdminUsersInput = {
  search?: string;
  role?: AdminUserRole | "ALL";
};

async function getAdminToken(): Promise<string> {
  return getAdminSessionToken();
}

function buildUsersQuery(input?: GetAdminUsersInput): string {
  const params = new URLSearchParams();

  if (input?.search?.trim()) {
    params.set("search", input.search.trim());
  }

  if (input?.role && input.role !== "ALL") {
    params.set("role", input.role);
  }

  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export async function getAdminUsers(input?: GetAdminUsersInput): Promise<AdminUserRow[]> {
  const token = await getAdminToken();
  return apiRequest<AdminUserRow[]>(buildUsersQuery(input), {
    method: "GET",
    token,
  });
}

export async function getAdminUserProfile(userId: string): Promise<AdminUserProfileDetails> {
  if (!userId) {
    throw new Error("Utilisateur introuvable.");
  }

  const token = await getAdminToken();
  return apiRequest<AdminUserProfileDetails>(`/admin/users/${userId}`, {
    method: "GET",
    token,
  });
}

export async function verifyUser(userId: string): Promise<{ ok: true }> {
  if (!userId) {
    throw new Error("Utilisateur introuvable.");
  }

  const token = await getAdminToken();
  await apiRequest<{ ok: true }>(`/admin/users/${userId}/verify`, {
    method: "POST",
    token,
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function banUser(userId: string): Promise<{ ok: true }> {
  if (!userId) {
    throw new Error("Utilisateur introuvable.");
  }

  const token = await getAdminToken();
  await apiRequest<{ ok: true }>(`/admin/users/${userId}/ban`, {
    method: "POST",
    token,
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

function getCityFromAddress(address: string): string {
  const city = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1);

  return city ?? address;
}

export async function getAdminMissions(): Promise<AdminMissionRow[]> {
  const token = await getAdminToken();
  const missions = await apiRequest<Omit<AdminMissionRow, "city">[]>("/admin/missions", {
    method: "GET",
    token,
  });

  return missions.map((mission) => ({
    ...mission,
    city: getCityFromAddress(mission.address),
  }));
}

export async function deleteMission(missionId: string): Promise<{ ok: true }> {
  if (!missionId) {
    throw new Error("Mission introuvable.");
  }

  const token = await getAdminToken();
  await apiRequest<{ ok: true }>(`/admin/missions/${missionId}/delete`, {
    method: "POST",
    token,
  });

  revalidatePath("/admin/missions");
  revalidatePath("/bookings");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function getAdminServices(): Promise<AdminServiceRow[]> {
  const token = await getAdminToken();
  return apiRequest<AdminServiceRow[]>("/admin/services", {
    method: "GET",
    token,
  });
}

export async function featureService(serviceId: string): Promise<{ ok: true }> {
  if (!serviceId) {
    throw new Error("Service introuvable.");
  }

  const token = await getAdminToken();
  await apiRequest<{ ok: true }>(`/admin/services/${serviceId}/feature`, {
    method: "POST",
    token,
  });

  revalidatePath("/admin/services");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function hideService(serviceId: string): Promise<{ ok: true }> {
  if (!serviceId) {
    throw new Error("Service introuvable.");
  }

  const token = await getAdminToken();
  await apiRequest<{ ok: true }>(`/admin/services/${serviceId}/hide`, {
    method: "POST",
    token,
  });

  revalidatePath("/admin/services");
  revalidatePath("/marketplace");
  return { ok: true };
}
