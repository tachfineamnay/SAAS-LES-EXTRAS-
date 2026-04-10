import { getAvailableMissions, getMarketplaceCatalogue } from "@/app/actions/marketplace";
import { FreelanceMarketplace } from "@/components/marketplace/FreelanceMarketplace";
import { EstablishmentCatalogue } from "@/components/marketplace/EstablishmentCatalogue";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.user.role === "FREELANCE") {
    const [missions, { services }] = await Promise.all([
      getAvailableMissions(session.token),
      getMarketplaceCatalogue(session.token),
    ]);
    return <FreelanceMarketplace missions={missions} services={services} />;
  }

  if (session.user.role === "ESTABLISHMENT") {
    let services: Awaited<ReturnType<typeof getMarketplaceCatalogue>>["services"] = [];
    let freelances: Awaited<ReturnType<typeof getMarketplaceCatalogue>>["freelances"] = [];
    let catalogueError: string | null = null;
    try {
      const data = await getMarketplaceCatalogue(session.token);
      services = data.services;
      freelances = data.freelances;
    } catch (err) {
      console.error("MarketplacePage catalogue error", err);
      catalogueError = "Impossible de charger certaines données du catalogue.";
    }
    return (
      <EstablishmentCatalogue
        services={services}
        freelances={freelances}
        catalogueError={catalogueError}
      />
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>Accès non autorisé ou rôle inconnu.</p>
    </div>
  );
}
