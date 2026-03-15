import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFinancePage() {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-heading-xl tracking-tight">Finance</h2>
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
