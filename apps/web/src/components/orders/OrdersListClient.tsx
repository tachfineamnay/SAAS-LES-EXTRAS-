"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, ChevronRight } from "lucide-react";
import type { BookingLine } from "@/app/actions/bookings";

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "quiet" }> = {
  PENDING: { label: "En attente", variant: "warning" },
  QUOTE_SENT: { label: "Devis envoyé", variant: "info" },
  QUOTE_ACCEPTED: { label: "Devis accepté", variant: "info" },
  CONFIRMED: { label: "Confirmé", variant: "success" },
  IN_PROGRESS: { label: "En cours", variant: "info" },
  COMPLETED: { label: "Terminé", variant: "quiet" },
  AWAITING_PAYMENT: { label: "Attente paiement", variant: "warning" },
  PAID: { label: "Payé", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
  ASSIGNED: { label: "Assigné", variant: "success" },
};

type OrdersListClientProps = {
  lines: BookingLine[];
};

export function OrdersListClient({ lines }: OrdersListClientProps) {
  // Only show lines that have a relatedBookingId (i.e. can link to an order page)
  const orderable = lines.filter((l) => l.relatedBookingId);

  if (orderable.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <EmptyState
          icon={Package}
          title="Aucune commande"
          description="Vos commandes apparaîtront ici une fois qu'une réservation sera créée."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mes Commandes</h1>
      <div className="space-y-2">
        {orderable.map((line) => {
          const statusConfig = STATUS_MAP[line.status] ?? { label: line.status, variant: "quiet" as const };
          return (
            <Link
              key={line.lineId}
              href={`/orders/${line.relatedBookingId}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{line.typeLabel} — {line.interlocutor}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(line.date), "dd MMM yyyy", { locale: fr })} · {line.address}
                </p>
              </div>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
