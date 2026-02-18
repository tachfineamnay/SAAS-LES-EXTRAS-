import { getMarketplaceData } from "@/app/actions/marketplace";
import { MarketList } from "@/components/marketplace/MarketList";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { missions, services, isDegraded, degradedReason } =
    await getMarketplaceData(session.token);

  return (
    <MarketList
      missions={missions}
      services={services}
      isDegraded={isDegraded}
      degradedReason={degradedReason}
    />
  );
}
