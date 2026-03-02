import { Banknote, CircleGauge, Percent, UserPlus } from "lucide-react";
import { KpiTile } from "@/components/dashboard/KpiTile";
import type { AdminStatsData } from "@/lib/admin/desk-mocks";

type AdminStatsProps = {
  data: AdminStatsData;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function AdminStats({ data }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiTile
        label="Volume d'Affaires (GMV)"
        value={currencyFormatter.format(data.gmv)}
        icon={Banknote}
        iconColor="emerald"
      />
      <KpiTile
        label="Missions en cours"
        value={data.activeMissionsToday}
        icon={CircleGauge}
        iconColor="gray"
      />
      <KpiTile
        label="Nouveaux Users (7j)"
        value={data.newUsersLast7Days}
        icon={UserPlus}
        iconColor="teal"
        trend="up"
        trendLabel={data.newUsersTrendLabel}
      />
      <KpiTile
        label="Taux de Conversion"
        value={`${data.sosConversionRate}%`}
        icon={Percent}
        iconColor="amber"
      />
    </div>
  );
}
