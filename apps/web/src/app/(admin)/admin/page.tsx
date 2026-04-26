import { getAdminOverview, getAdminUsers, getDeskRequests } from "@/app/actions/admin";
import { AdminStats } from "@/components/admin/AdminStats";
import { RequiredActions } from "@/components/admin/RequiredActions";
import { BentoSection } from "@/components/layout/BentoSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchAdminSafe } from "@/lib/admin-safe-fetch";

export const dynamic = "force-dynamic";
const OPEN_DESK_REQUEST_STATUSES = new Set(["OPEN", "IN_PROGRESS"]);
const OVERVIEW_FALLBACK = {
  pendingUsersCount: 0,
  openDeskRequestsCount: 0,
  urgentOpenMissionsCount: 0,
  featuredServicesCount: 0,
  hiddenServicesCount: 0,
  awaitingPaymentCount: 0,
};

export default async function AdminOverviewPage() {
  const [overviewResult, usersResult, deskRequestsResult] = await Promise.all([
    fetchAdminSafe(getAdminOverview, OVERVIEW_FALLBACK, "Synthèse Desk"),
    fetchAdminSafe(() => getAdminUsers(), [], "Utilisateurs Desk"),
    fetchAdminSafe(getDeskRequests, [], "Demandes Desk"),
  ]);
  const overview = overviewResult.data;
  const users = usersResult.data;
  const deskRequests = deskRequestsResult.data;
  const widgetErrors = [
    overviewResult.error,
    usersResult.error,
    deskRequestsResult.error,
  ].filter((error): error is string => Boolean(error));

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

      {widgetErrors.length > 0 && (
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertTitle>Données Desk partiellement indisponibles</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {widgetErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

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
