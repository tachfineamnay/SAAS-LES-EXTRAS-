import { getBookingsPageData } from "@/app/actions/bookings";
import type { BookingsPageData } from "@/app/actions/bookings";
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient";
import { UnauthorizedError } from "@/lib/api";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let initialData: BookingsPageData = { lines: [], nextStep: null };
  let initialError: string | null = null;

  try {
    initialData = await getBookingsPageData(session.token);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    console.error("[bookings] initial load error", error);
    initialError = "Impossible de charger votre agenda pour le moment.";
  }

  return <BookingsPageClient initialData={initialData} initialError={initialError} />;
}
