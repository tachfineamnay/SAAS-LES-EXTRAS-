import { getBookingsPageData } from "@/app/actions/bookings";
import { BookingsPageClient } from "@/components/bookings/BookingsPageClient";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const initialData = await getBookingsPageData("CLIENT");

  return <BookingsPageClient initialData={initialData} />;
}
