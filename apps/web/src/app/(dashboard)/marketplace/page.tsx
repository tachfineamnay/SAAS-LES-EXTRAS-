import {
  getAvailableMissionsStrict,
  getFreelancesStrict,
  getServicesCatalogue,
} from "@/app/actions/marketplace";
import { FreelanceMarketplace } from "@/components/marketplace/FreelanceMarketplace";
import { EstablishmentCatalogue } from "@/components/marketplace/EstablishmentCatalogue";
import { UnauthorizedError } from "@/lib/api";
import { deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function isRejectedUnauthorized(result: PromiseSettledResult<unknown>) {
  return result.status === "rejected" && result.reason instanceof UnauthorizedError;
}

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.user.role === "FREELANCE") {
    const [missionsResult, servicesResult] = await Promise.allSettled([
      getAvailableMissionsStrict(session.token),
      getServicesCatalogue(session.token),
    ]);

    if (isRejectedUnauthorized(missionsResult) || isRejectedUnauthorized(servicesResult)) {
      await deleteSession();
      redirect("/login");
    }

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
    const [servicesResult, freelancesResult] = await Promise.allSettled([
      getServicesCatalogue(session.token, "marketplace.establishment.services"),
      getFreelancesStrict(session.token, "marketplace.establishment.freelances"),
    ]);

    if (isRejectedUnauthorized(servicesResult) || isRejectedUnauthorized(freelancesResult)) {
      await deleteSession();
      redirect("/login");
    }

    return (
      <EstablishmentCatalogue
        services={servicesResult.status === "fulfilled" ? servicesResult.value : []}
        freelances={freelancesResult.status === "fulfilled" ? freelancesResult.value : []}
        servicesError={
          servicesResult.status === "rejected"
            ? "Impossible de charger les ateliers et formations pour le moment."
            : null
        }
        freelancesError={
          freelancesResult.status === "rejected"
            ? "Impossible de charger les profils Extras vérifiés pour le moment."
            : null
        }
      />
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>Accès non autorisé ou rôle inconnu.</p>
    </div>
  );
}
