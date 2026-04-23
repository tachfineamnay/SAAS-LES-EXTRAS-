"use server";

import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/app/actions/_shared/admin-session";
import { apiRequest } from "@/lib/api";

export type AdminUserRole = "ESTABLISHMENT" | "FREELANCE" | "ADMIN";
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
  establishmentName: string;
  establishmentEmail: string;
  candidatesCount: number;
};

export type AdminMissionLinkedDeskRequest = {
  id: string;
  status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  messageExcerpt: string;
};

export type AdminMissionDetail = {
  id: string;
  title: string;
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  establishmentName: string;
  establishmentEmail: string;
  address: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  candidatesCount: number;
  linkedDeskRequests: AdminMissionLinkedDeskRequest[];
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
  freelanceName: string;
  freelanceEmail: string;
};

export type AdminServiceDetail = {
  id: string;
  title: string;
  type: "WORKSHOP" | "TRAINING";
  price: number;
  freelanceName: string;
  freelanceEmail: string;
  isFeatured: boolean;
  isHidden: boolean;
  description: string | null;
  createdAt: string;
};

export type AdminOverviewData = {
  pendingUsersCount: number;
  openDeskRequestsCount: number;
  urgentOpenMissionsCount: number;
  featuredServicesCount: number;
  hiddenServicesCount: number;
  awaitingPaymentCount: number;
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

export async function getAdminOverview(): Promise<AdminOverviewData> {
  const token = await getAdminToken();
  return apiRequest<AdminOverviewData>("/admin/overview", {
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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

export async function getAdminMissionDetail(missionId: string): Promise<AdminMissionDetail> {
  if (!missionId) {
    throw new Error("Mission introuvable.");
  }

  const token = await getAdminToken();
  return apiRequest<AdminMissionDetail>(`/admin/missions/${missionId}`, {
    method: "GET",
    token,
  });
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
  revalidatePath("/admin");
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

export async function getAdminServiceDetail(serviceId: string): Promise<AdminServiceDetail> {
  if (!serviceId) {
    throw new Error("Service introuvable.");
  }

  const token = await getAdminToken();
  return apiRequest<AdminServiceDetail>(`/admin/services/${serviceId}`, {
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
  revalidatePath("/marketplace");
  return { ok: true };
}

// ─────────────────────────────────────────────
// DESK — Demandes d'informations
// ─────────────────────────────────────────────

export type DeskRequestStatus = "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
export type DeskRequestType = "MISSION_INFO_REQUEST";
export type DeskRequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type ContactBypassBlockedReason =
  | "EMAIL"
  | "PHONE"
  | "WHATSAPP"
  | "TELEGRAM"
  | "EXTERNAL_URL";

type DeskAdminSummary = {
  id: string;
  email: string;
  profile: { firstName: string; lastName: string } | null;
};

export type DeskRequestRow = {
  id: string;
  type: DeskRequestType;
  priority: DeskRequestPriority;
  status: DeskRequestStatus;
  assignedToAdminId: string | null;
  message: string;
  response: string | null;
  answeredAt: string | null;
  createdAt: string;
  mission: { id: string; title: string };
  requester: {
    id: string;
    email: string;
    profile: { firstName: string; lastName: string } | null;
  };
  assignedToAdmin: DeskAdminSummary | null;
  answeredBy: DeskAdminSummary | null;
};

export type ContactBypassEventRow = {
  id: string;
  conversationId: string | null;
  blockedReason: ContactBypassBlockedReason;
  rawExcerpt: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    name: string;
  };
};

export async function getDeskRequests(): Promise<DeskRequestRow[]> {
  try {
    const token = await getAdminToken();
    return await apiRequest<DeskRequestRow[]>("/admin/desk-requests", {
      method: "GET",
      token,
    });
  } catch {
    return [];
  }
}

export async function getContactBypassEvents(): Promise<ContactBypassEventRow[]> {
  try {
    const token = await getAdminToken();
    return await apiRequest<ContactBypassEventRow[]>("/admin/contact-bypass-events", {
      method: "GET",
      token,
    });
  } catch {
    return [];
  }
}

export async function updateDeskRequestStatus(
  id: string,
  status: DeskRequestStatus,
): Promise<{ ok: true }> {
  const token = await getAdminToken();
  await apiRequest<unknown>(`/admin/desk-requests/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function assignDeskRequest(
  id: string,
  adminId: string | null,
): Promise<{ ok: true }> {
  const token = await getAdminToken();
  await apiRequest<unknown>(`/admin/desk-requests/${id}/assign`, {
    method: "PATCH",
    token,
    body: { adminId },
  });
  revalidatePath("/admin/demandes");
  return { ok: true };
}

export async function respondToDeskRequest(
  id: string,
  response: string,
): Promise<{ ok: true }> {
  const token = await getAdminToken();
  await apiRequest<unknown>(`/admin/desk-requests/${id}/respond`, {
    method: "PATCH",
    token,
    body: { response },
  });
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  return { ok: true };
}
