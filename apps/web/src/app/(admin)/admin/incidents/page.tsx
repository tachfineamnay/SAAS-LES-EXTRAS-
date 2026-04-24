import { getDeskRequests, getAdminUsers } from "@/app/actions/admin";
import { FinanceIncidentsTable } from "@/components/admin/FinanceIncidentsTable";

export const dynamic = "force-dynamic";

const FINANCE_TYPES = new Set([
  "PAYMENT_ISSUE",
  "BOOKING_FAILURE",
  "PACK_PURCHASE_FAILURE",
  "MISSION_PUBLISH_FAILURE",
]);

export default async function AdminIncidentsPage() {
  const [allRequests, admins] = await Promise.all([
    getDeskRequests(),
    getAdminUsers({ role: "ADMIN" }),
  ]);

  const incidents = allRequests.filter((r) => FINANCE_TYPES.has(r.type));

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="font-display text-heading-xl tracking-tight">
          Incidents Finance / Commerce
        </h2>
        <p className="text-sm text-muted-foreground">
          Incidents signalés par les utilisateurs ou créés manuellement par Le Desk&nbsp;:
          paiements bloqués, réservations échouées, achats de packs et publications de missions.
          Commission plateforme&nbsp;: <strong>3&nbsp;%</strong> — tous les montants sont&nbsp;TTC.
        </p>
      </header>

      <FinanceIncidentsTable requests={incidents} admins={admins} />
    </section>
  );
}
