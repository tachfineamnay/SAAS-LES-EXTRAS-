import { getMarketplaceData } from "@/app/actions/marketplace";
import { MarketList } from "@/components/marketplace/MarketList";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const { missions, services } = await getMarketplaceData();
  return <MarketList missions={missions} services={services} />;
}
