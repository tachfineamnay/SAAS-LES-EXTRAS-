import {
  getAvailableMissionsStrict,
  getMarketplaceCatalogue,
  getServicesCatalogue,
} from "@/app/actions/marketplace";
import { FreelanceMarketplace } from "@/components/marketplace/FreelanceMarketplace";
import { EstablishmentCatalogue } from "@/components/marketplace/EstablishmentCatalogue";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.user.role === "FREELANCE") {
    const [missionsResult, servicesResult] = await Promise.allSettled([
      getAvailableMissionsStrict(session.token),
      getServicesCatalogue(session.token),
    ]);

    return (
      <FreelanceMarketplace
        missions={missionsResult.status === "fulfilled" ? missionsResult.value : []}
        services={servicesResult.status === "fulfilled" ? servicesResult.value : []}
        missionsError={
          missionsResult.status === "rejected"
            ? "Impossible de charger les missions de renfort pour le moment."
            : null
        }
        servicesError={
          servicesResult.status === "rejected"
            ? "Impossible de charger les ateliers et formations pour le moment."
            : null
        }
      />
    );
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
