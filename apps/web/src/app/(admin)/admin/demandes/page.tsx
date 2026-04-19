import { getDeskRequests } from "@/app/actions/admin";
import { DeskRequestsTable } from "@/components/admin/DeskRequestsTable";

export const dynamic = "force-dynamic";

export default async function AdminDemandesPage() {
  const requests = await getDeskRequests();

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-display text-heading-xl tracking-tight">Demandes d&apos;informations</h2>
        <p className="text-sm text-muted-foreground">
          Demandes envoyées par les candidats sur les missions Renfort. Traitez, répondez et suivez leur statut.
        </p>
      </header>

      <DeskRequestsTable requests={requests} />
    </section>
  );
}
