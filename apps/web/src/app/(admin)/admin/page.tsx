import { Banknote, CircleGauge, Percent, UserPlus } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { RequiredActions } from "@/components/admin/RequiredActions";
import { adminDeskMockData } from "@/lib/admin/desk-mocks";
import { BentoSection } from "@/components/layout/BentoSection";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Le Desk — Admin</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilotage opérationnel global des missions, utilisateurs et performances.
          </p>
        </div>
      </header>

      <AdminStats data={adminDeskMockData.stats} />

      <BentoSection
        cols={2}
        gap="md"
        heading="Actions Requises"
        description="Points de contrôle prioritaires du Desk."
      >
        <RequiredActions
          pendingUsers={adminDeskMockData.pendingUsers}
          blockedBookings={adminDeskMockData.blockedBookings}
        />
      </BentoSection>
    </section>
  );
}
