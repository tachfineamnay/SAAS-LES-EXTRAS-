import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getInvoices } from "@/actions/finance";
import { RevenueOverviewWidget } from "@/components/finance/RevenueOverviewWidget";
import { InvoiceListWidget } from "@/components/finance/InvoiceListWidget";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
    const session = await getSession();

    if (!session || session.user.role !== "TALENT") {
        redirect("/dashboard");
    }

    const invoices = await getInvoices();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Mon Espace Finance</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter (CSV)
                    </Button>
                </div>
            </div>

            <RevenueOverviewWidget invoices={invoices} />

            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Historique des Factures</h2>
                <InvoiceListWidget invoices={invoices} />
            </div>
        </div>
    );
}
