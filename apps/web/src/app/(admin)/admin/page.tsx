import { getAdminOverview, getAdminUsers, getDeskRequests } from "@/app/actions/admin";
import { AdminStats } from "@/components/admin/AdminStats";
import { RequiredActions } from "@/components/admin/RequiredActions";
import { BentoSection } from "@/components/layout/BentoSection";

export const dynamic = "force-dynamic";
const OPEN_DESK_REQUEST_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);

export default async function AdminOverviewPage() {
  const [overview, users, deskRequests] = await Promise.all([
    getAdminOverview(),
    getAdminUsers(),
    getDeskRequests(),
  ]);
  const pendingUsers = users.filter((user) => user.status === "PENDING");
  const openDeskRequests = deskRequests.filter((request) =>
    OPEN_DESK_REQUEST_STATUSES.has(request.status),
  );

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

      <AdminStats data={overview} />

      <BentoSection
        cols={2}
        gap="md"
        heading="Actions Requises"
        description="Points de contrôle prioritaires du Desk."
      >
        <RequiredActions
          pendingUsers={pendingUsers}
          openDeskRequests={openDeskRequests}
        />
      </BentoSection>
    </section>
  );
}
