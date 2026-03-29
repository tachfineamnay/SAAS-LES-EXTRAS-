import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import { OrdersListClient } from "@/components/orders/OrdersListClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getBookingsPageData(session.token);

  return <OrdersListClient lines={data.lines} />;
}
