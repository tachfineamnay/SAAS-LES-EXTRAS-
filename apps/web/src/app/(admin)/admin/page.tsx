import { Banknote, CircleGauge, Percent, UserPlus } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { RequiredActions } from "@/components/admin/RequiredActions";
import { adminDeskMockData } from "@/lib/admin/desk-mocks";
import { BentoSection } from "@/components/layout/BentoSection";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Tableau de bord
        </h2>
        <p className="text-sm text-muted-foreground">
          Pilotage opérationnel global des missions, utilisateurs et performances.
        </p>
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
