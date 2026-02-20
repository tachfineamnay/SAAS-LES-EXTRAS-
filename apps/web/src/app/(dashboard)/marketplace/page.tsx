import { getAvailableMissions, getMarketplaceCatalogue } from "@/app/actions/marketplace";
import { FreelanceJobBoard } from "@/components/marketplace/FreelanceJobBoard";
import { ClientCatalogue } from "@/components/marketplace/ClientCatalogue";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.user.role === "TALENT") {
    const missions = await getAvailableMissions(session.token);
    return <FreelanceJobBoard missions={missions} />;
  }

  if (session.user.role === "CLIENT") {
    const { services, talents } = await getMarketplaceCatalogue(session.token);
    return <ClientCatalogue services={services} talents={talents} />;
  }

  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>Accès non autorisé ou rôle inconnu.</p>
    </div>
  );
}
