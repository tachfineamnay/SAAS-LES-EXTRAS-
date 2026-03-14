import { getAvailableMissions, getMarketplaceCatalogue } from "@/app/actions/marketplace";
import { FreelanceJobBoard } from "@/components/marketplace/FreelanceJobBoard";
import { ClientCatalogue } from "@/components/marketplace/ClientCatalogue";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.user.role === "FREELANCE") {
    const missions = await getAvailableMissions(session.token);
    return <FreelanceJobBoard missions={missions} />;
  }

  if (session.user.role === "ESTABLISHMENT") {
    let services: Awaited<ReturnType<typeof getMarketplaceCatalogue>>["services"] = [];
    let talents: Awaited<ReturnType<typeof getMarketplaceCatalogue>>["talents"] = [];
    try {
      const data = await getMarketplaceCatalogue(session.token);
      services = data.services;
      talents = data.talents;
    } catch (err) {
      console.error("MarketplacePage catalogue error", err);
    }
    return <ClientCatalogue services={services} talents={talents} />;
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>Accès non autorisé ou rôle inconnu.</p>
    </div>
  );
}
