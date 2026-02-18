import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { getSession } from "@/lib/session";

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
  relatedBookingId?: string;
  invoiceUrl?: string;
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

type ActionBookingInput = {
  bookingId: string;
};



export async function getBookingsPageData(token?: string): Promise<BookingsPageData> {
  let activeToken = token;
  if (!activeToken) {
    const session = await getSession();
    if (!session) throw new Error("Non connecté");
    activeToken = session.token;
  }

  return apiRequest<BookingsPageData>("/bookings", {
    method: "GET",
    token: activeToken,
  });
}

export async function cancelBookingLine(
  input: CancelBookingInput,
): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest<{ ok: true }>("/bookings/cancel", {
    method: "POST",
    token: session.token,
    body: input,
  });

  revalidatePath("/bookings");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function getBookingLineDetails(
  input: BookingDetailsInput,
): Promise<BookingDetails> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  return apiRequest<BookingDetails>(
    `/bookings/${input.lineType}/${input.lineId}/details`,
    {
      method: "GET",
      token: session.token,
    },
  );
}

export async function confirmBookingLine(
  input: ActionBookingInput,
): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest<{ ok: true }>("/bookings/confirm", {
    method: "POST",
    token: session.token,
    body: input,
  });

  revalidatePath("/bookings");
  return { ok: true };
}

export async function completeBookingLine(
  input: ActionBookingInput,
): Promise<{ ok: true }> {
  const session = await getSession();
  if (!session) throw new Error("Non connecté");

  await apiRequest<{ ok: true }>("/bookings/complete", {
    method: "POST",
    token: session.token,
    body: input,
  });

  revalidatePath("/bookings");
  return { ok: true };
}
