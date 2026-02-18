"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Check, CheckCheck, CircleUserRound, Eye, MapPin, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  cancelBookingLine,
  completeBookingLine,
  confirmBookingLine,
  getBookingLineDetails,
  getBookingsPageData,
  type BookingDetails,
  type BookingLine,
  type BookingLineStatus,
  type BookingsPageData,
  type DashboardRole,
} from "@/app/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/lib/stores/useUIStore";

type BookingsPageClientProps = {
  initialData: BookingsPageData;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getStatusBadgeClass(status: BookingLineStatus): string {
  if (status === "ASSIGNED") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (status === "CONFIRMED") {
    return "bg-cyan-100 text-cyan-800 border-cyan-200";
  }

  if (status === "PAID") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (status === "CANCELLED") {
    return "bg-red-100 text-red-800 border-red-200";
  }

  if (status === "COMPLETED") {
    return "bg-slate-200 text-slate-800 border-slate-300";
  }

  return "bg-amber-100 text-amber-800 border-amber-200";
}

function canCancel(status: BookingLineStatus): boolean {
  return status !== "CANCELLED" && status !== "COMPLETED";
}

export function BookingsPageClient({ initialData }: BookingsPageClientProps) {
  const userRole = useUIStore((state) => state.userRole);
  const [data, setData] = useState<BookingsPageData>(initialData);
  const [loadedRole, setLoadedRole] = useState<DashboardRole>("CLIENT");
  const [isRoleLoading, startRoleLoading] = useTransition();
  const [isActionLoading, startActionLoading] = useTransition();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BookingLine | null>(null);
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (userRole === loadedRole) {
      return;
    }

    let cancelled = false;
    startRoleLoading(async () => {
      try {
        const nextData = await getBookingsPageData();
        if (cancelled) {
          return;
        }
        setData(nextData);
        setLoadedRole(userRole);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de charger les réservations.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadedRole, userRole]);

  const handleCancel = (line: BookingLine) => {
    startActionLoading(async () => {
      try {
        await cancelBookingLine({ lineType: line.lineType, lineId: line.lineId });
        const refreshedData = await getBookingsPageData();
        setData(refreshedData);
        toast.success("Réservation annulée.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible d'annuler cette réservation.");
      }
    });
  };

  const handleConfirm = (line: BookingLine) => {
    if (!line.relatedBookingId) {
      toast.error("Impossible de confirmer cette réservation (ID manquant).");
      return;
    }
    startActionLoading(async () => {
      try {
        await confirmBookingLine({ bookingId: line.relatedBookingId! });
        const refreshedData = await getBookingsPageData();
        setData(refreshedData);
        toast.success("Réservation confirmée (Recruté).");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de confirmer.");
      }
    });
  };

  const handleComplete = (line: BookingLine) => {
    if (!line.relatedBookingId) {
      toast.error("Impossible de terminer cette réservation (ID manquant).");
      return;
    }
    startActionLoading(async () => {
      try {
        await completeBookingLine({ bookingId: line.relatedBookingId! });
        const refreshedData = await getBookingsPageData();
        setData(refreshedData);
        toast.success("Mission terminée. Facture générée.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de terminer.");
      }
    });
  };

  const handleOpenDetails = (line: BookingLine) => {
    setSelectedLine(line);
    setDetails(null);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);

    void getBookingLineDetails({ lineType: line.lineType, lineId: line.lineId })
      .then((response) => {
        setDetails(response);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Impossible de récupérer les détails.");
      })
      .finally(() => {
        setIsDetailsLoading(false);
      });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mes Réservations</h1>
        <p className="text-sm text-muted-foreground">
          Vue planning des interventions et réservations selon votre rôle.
        </p>
      </header>

      <Card className="border-blue-200 bg-blue-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Prochaine Intervention</CardTitle>
        </CardHeader>
        <CardContent>
          {data.nextStep ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{dateFormatter.format(new Date(data.nextStep.date))}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusBadgeClass(data.nextStep.status)}>{data.nextStep.status}</Badge>
                <span className="font-medium">{data.nextStep.typeLabel}</span>
                <span className="text-muted-foreground">avec {data.nextStep.interlocutor}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune intervention future planifiée pour le moment.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Planning {isRoleLoading ? "(mise à jour...)" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune ligne à afficher pour ce rôle.</p>
          ) : (
            <>
              <div className="hidden border-b px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1.3fr_1fr_1fr_auto_auto] md:gap-3">
                <span>Date</span>
                <span>Type</span>
                <span>Interlocuteur</span>
                <span>Statut</span>
                <span>Actions</span>
              </div>
              {data.lines.map((line) => (
                <div
                  key={`${line.lineType}-${line.lineId}`}
                  className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1.3fr_1fr_1fr_auto_auto] md:items-center"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>{dateFormatter.format(new Date(line.date))}</span>
                  </div>

                  <div className="text-sm font-medium">{line.typeLabel}</div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CircleUserRound className="h-4 w-4" />
                    <span>{line.interlocutor}</span>
                  </div>

                  <Badge className={getStatusBadgeClass(line.status)}>{line.status}</Badge>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(line)}
                      disabled={isActionLoading}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(line)}
                      disabled={isActionLoading || !canCancel(line.status)}
                    >
                      Annuler
                    </Button>

                    {userRole === "CLIENT" && line.status === "PENDING" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        onClick={() => handleConfirm(line)}
                        disabled={isActionLoading}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Recruter
                      </Button>
                    )}

                    {userRole === "CLIENT" && line.status === "CONFIRMED" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleComplete(line)}
                        disabled={isActionLoading}
                      >
                        <CheckCheck className="mr-1 h-4 w-4" />
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>
              Informations de lieu et de contact pour préparer l’intervention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-muted-foreground">
                  {isDetailsLoading ? "Chargement..." : (details?.address ?? selectedLine?.address ?? "N/A")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CircleUserRound className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-muted-foreground">
                  {isDetailsLoading
                    ? "Chargement..."
                    : (details?.contactEmail ?? selectedLine?.contactEmail ?? "N/A")}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
