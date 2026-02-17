import { AdminStats } from "@/components/admin/AdminStats";
import { RequiredActions } from "@/components/admin/RequiredActions";
import { adminDeskMockData } from "@/lib/admin/desk-mocks";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Tableau de bord</h2>
        <p className="text-sm text-muted-foreground">
          Pilotage opérationnel global des missions, utilisateurs et performances.
        </p>
      </header>

      <AdminStats data={adminDeskMockData.stats} />

      <RequiredActions
        pendingUsers={adminDeskMockData.pendingUsers}
        blockedBookings={adminDeskMockData.blockedBookings}
      />
    </section>
  );
}
