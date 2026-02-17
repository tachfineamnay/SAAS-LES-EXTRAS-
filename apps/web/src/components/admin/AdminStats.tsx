import { Banknote, CircleGauge, Percent, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Volume d'Affaires (GMV)
          </CardTitle>
          <Banknote className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">
            {currencyFormatter.format(data.gmv)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Missions en cours</CardTitle>
          <CircleGauge className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{data.activeMissionsToday}</p>
          <p className="text-xs text-muted-foreground">Interventions actives aujourd'hui</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Nouveaux Users</CardTitle>
          <UserPlus className="h-4 w-4 text-violet-600" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold text-slate-900">{data.newUsersLast7Days}</p>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            {data.newUsersTrendLabel}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Taux de Conversion
          </CardTitle>
          <Percent className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">{data.sosConversionRate}%</p>
          <p className="text-xs text-muted-foreground">Missions SOS pourvues</p>
        </CardContent>
      </Card>
    </div>
  );
}
