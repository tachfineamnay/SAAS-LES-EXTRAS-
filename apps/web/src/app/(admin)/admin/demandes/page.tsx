import { getAdminUsers, getDeskRequests } from "@/app/actions/admin";
import { DeskRequestsTable } from "@/components/admin/DeskRequestsTable";

export const dynamic = "force-dynamic";

export default async function AdminDemandesPage() {
  const [requests, admins] = await Promise.all([
    getDeskRequests(),
    getAdminUsers({ role: "ADMIN" }),
  ]);

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-display text-heading-xl tracking-tight">Inbox Desk</h2>
        <p className="text-sm text-muted-foreground">
          Tickets utilisateurs, demandes mission et signalements non-finance à traiter par la plateforme.
        </p>
      </header>

      <DeskRequestsTable requests={requests} admins={admins} />
    </section>
  );
}
