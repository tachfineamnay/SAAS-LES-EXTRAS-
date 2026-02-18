import { getBookingsPageData } from "@/app/actions/bookings";
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const initialData = await getBookingsPageData(session.token);

  return <BookingsPageClient initialData={initialData} />;
}
