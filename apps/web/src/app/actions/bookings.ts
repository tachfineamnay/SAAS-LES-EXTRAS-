"use server";

import { revalidatePath } from "next/cache";
import { getDemoAuth } from "@/app/actions/_shared/demo-auth";
import { apiRequest } from "@/lib/api";

export type DashboardRole = "CLIENT" | "TALENT";
export type BookingLineType = "MISSION" | "SERVICE_BOOKING";
export type BookingLineStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED"
  | "ASSIGNED"
  | "COMPLETED";

export type BookingLine = {
  lineId: string;
  lineType: BookingLineType;
  date: string;
  typeLabel: "Mission SOS" | "Atelier";
  interlocutor: string;
  status: BookingLineStatus;
  address: string;
  contactEmail: string;
};

export type BookingsPageData = {
  lines: BookingLine[];
  nextStep: BookingLine | null;
};

export type BookingDetails = {
  address: string;
  contactEmail: string;
};

type CancelBookingInput = {
  lineType: BookingLineType;
  lineId: string;
};

type BookingDetailsInput = {
  lineType: BookingLineType;
  lineId: string;
};

async function getRoleToken(role: DashboardRole): Promise<string> {
  const auth = await getDemoAuth(role);
  return auth.token;
}

export async function getBookingsPageData(role: DashboardRole): Promise<BookingsPageData> {
  const token = await getRoleToken(role);
  return apiRequest<BookingsPageData>("/bookings", {
    method: "GET",
    token,
  });
}

export async function cancelBookingLine(
  input: CancelBookingInput,
  role: DashboardRole,
): Promise<{ ok: true }> {
  const token = await getRoleToken(role);

  await apiRequest<{ ok: true }>("/bookings/cancel", {
    method: "POST",
    token,
    body: input,
  });

  revalidatePath("/bookings");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function getBookingLineDetails(
  input: BookingDetailsInput,
  role: DashboardRole,
): Promise<BookingDetails> {
  const token = await getRoleToken(role);

  return apiRequest<BookingDetails>(
    `/bookings/${input.lineType}/${input.lineId}/details`,
    {
      method: "GET",
      token,
    },
  );
}
