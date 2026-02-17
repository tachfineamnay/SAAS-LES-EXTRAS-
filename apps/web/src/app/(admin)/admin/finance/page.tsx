import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFinancePage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Finance</h2>
      <Card>
        <CardHeader>
          <CardTitle>Suivi des commissions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Les tableaux de revenus, commissions et réconciliations financières apparaîtront ici.
        </CardContent>
      </Card>
    </section>
  );
}
