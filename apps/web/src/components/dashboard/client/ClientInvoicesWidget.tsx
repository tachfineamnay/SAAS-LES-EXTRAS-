"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";

interface ClientInvoicesWidgetProps {
    invoices: any[]; // We will type this loosely or import the type if available
}

export function ClientInvoicesWidget({ invoices }: ClientInvoicesWidgetProps) {
    const handleExportCsv = () => {
        // Simple client-side CSV export
        const headers = ["Numero", "Date", "Freelance", "Montant", "Statut"];
        const rows = invoices.map(inv => [
            inv.invoiceNumber,
            new Date(inv.createdAt).toLocaleDateString(),
            inv.booking?.talent?.profile?.lastName || "Inconnu",
            inv.amount + " €",
            inv.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mes_factures.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (invoices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-50" />
                <p>Aucune facture disponible.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter CSV
                </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">N°</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Freelance</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium text-xs">{invoice.invoiceNumber}</TableCell>
                                <TableCell className="text-xs">
                                    {new Date(invoice.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                </TableCell>
                                <TableCell className="text-xs">
                                    {invoice.booking?.talent?.profile?.firstName} {invoice.booking?.talent?.profile?.lastName?.charAt(0)}.
                                </TableCell>
                                <TableCell className="text-right text-xs font-medium">
                                    {invoice.amount.toFixed(2)} €
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                        <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    );
}
