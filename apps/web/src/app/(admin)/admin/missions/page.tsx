import { getAdminMissions } from "@/app/actions/admin";
import { MissionsTable } from "@/components/admin/MissionsTable";

export const dynamic = "force-dynamic";

export default async function AdminMissionsPage() {
  const missions = await getAdminMissions();

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Missions SOS</h2>
        <p className="text-sm text-muted-foreground">
          Vue globale des urgences publiées et modération rapide du contenu.
        </p>
      </header>

      <MissionsTable missions={missions} />
    </section>
  );
}
