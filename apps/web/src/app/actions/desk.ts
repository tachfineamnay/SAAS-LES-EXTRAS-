"use server";

import { getSession } from "@/lib/session";
import { apiRequest, safeApiRequest, type SafeApiResult } from "@/lib/api";

export type MyDeskRequestStatus = "OPEN" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";

export type MyDeskRequest = {
  id: string;
  type: "MISSION_INFO_REQUEST";
  status: MyDeskRequestStatus;
  message: string;
  response: string | null;
  answeredAt: string | null;
  createdAt: string;
  mission: { id: string; title: string };
  answeredBy: {
    id: string;
    email: string;
    profile: { firstName: string; lastName: string } | null;
  } | null;
};

export async function getMyDeskRequests(token?: string): Promise<MyDeskRequest[]> {
  try {
    let activeToken = token;
    if (!activeToken) {
      const session = await getSession();
      if (!session) return [];
      activeToken = session.token;
    }

    return await apiRequest<MyDeskRequest[]>("/desk-requests/mine", {
      method: "GET",
      token: activeToken,
    });
  } catch {
    return [];
  }
}

export async function getMyDeskRequestsSafe(
  token?: string,
): Promise<SafeApiResult<MyDeskRequest[]>> {
  let activeToken = token;
  if (!activeToken) {
    const session = await getSession();
    if (!session) return { ok: true, data: [] };
    activeToken = session.token;
  }

  return safeApiRequest<MyDeskRequest[]>(
    "/desk-requests/mine",
    {
      method: "GET",
      token: activeToken,
      label: "desk.mine",
    },
    "Impossible de charger vos demandes pour le moment.",
  );
}
