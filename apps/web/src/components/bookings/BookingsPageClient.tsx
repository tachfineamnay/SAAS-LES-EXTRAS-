"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarClock,
  Check,
  CheckCheck,
  CreditCard,
  CircleUserRound,
  Eye,
  MapPin,
  XCircle,
  CalendarDays,
  Building2,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react";
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
import { authorizePayment } from "@/actions/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingLineLot6Panel } from "@/components/bookings/BookingLineLot6Panel";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
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

function getStatusBadge(status: BookingLineStatus) {
  switch (status) {
    case "PENDING":
      return <Badge variant="amber" size="sm">En attente</Badge>;
    case "ASSIGNED":
      return <Badge variant="info" size="sm">Assigné</Badge>;
    case "CONFIRMED":
      return <Badge variant="teal" size="sm">Confirmé</Badge>;
    case "PAID":
      return <Badge variant="emerald" size="sm">Payé</Badge>;
    case "COMPLETED":
      return <Badge variant="outline" size="sm">Terminé</Badge>;
    case "COMPLETED_AWAITING_PAYMENT":
      return <Badge variant="amber" size="sm">Paiement en attente</Badge>;
    case "CANCELLED":
      return <Badge variant="red" size="sm">Annulé</Badge>;
    default:
      return <Badge variant="outline" size="sm">{status}</Badge>;
  }
}

function canCancel(status: BookingLineStatus): boolean {
  return status !== "CANCELLED" && status !== "COMPLETED";
}

export function BookingsPageClient({ initialData }: BookingsPageClientProps) {
  const userRole = useUIStore((state) => state.userRole);
  const searchParams = useSearchParams();
  const hasAutoOpenedDetailsRef = useRef(false);
  const [data, setData] = useState<BookingsPageData>(initialData);
  const [loadedRole, setLoadedRole] = useState<DashboardRole>("ESTABLISHMENT");
  const [isRoleLoading, startRoleLoading] = useTransition();
  const [isActionLoading, startActionLoading] = useTransition();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BookingLine | null>(null);
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const refreshBookings = async () => {
    setData(await getBookingsPageData());
  };

  useEffect(() => {
    if (userRole === loadedRole) return;

    let cancelled = false;
    startRoleLoading(async () => {
      try {
        const nextData = await getBookingsPageData();
        if (cancelled) return;
        setData(nextData);
        if (userRole) setLoadedRole(userRole);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de charger les réservations.");
      }
    });
    return () => { cancelled = true; };
  }, [loadedRole, userRole]);

  const handleCancel = (line: BookingLine) => {
    startActionLoading(async () => {
      try {
        await cancelBookingLine({ lineType: line.lineType, lineId: line.lineId });
        await refreshBookings();
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
        await refreshBookings();
        toast.success("Réservation confirmée.");
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
        await refreshBookings();
        toast.success("Mission terminée. Facture générée.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de terminer.");
      }
    });
  };

  const handleAuthorizePayment = (line: BookingLine) => {
    if (!line.relatedBookingId) {
      toast.error("Impossible de valider ce règlement (ID manquant).");
      return;
    }

    startActionLoading(async () => {
      const result = await authorizePayment(line.relatedBookingId!);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      await refreshBookings();
      toast.success("Règlement validé.");
    });
  };

  const handleOpenDetails = useCallback((line: BookingLine) => {
    setSelectedLine(line);
    setDetails(null);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    void getBookingLineDetails({ lineType: line.lineType, lineId: line.lineId })
      .then((response) => setDetails(response))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Impossible de récupérer les détails."))
      .finally(() => setIsDetailsLoading(false));
  }, []);

  useEffect(() => {
    if (hasAutoOpenedDetailsRef.current) return;

    const lineType = searchParams.get("lineType");
    const lineId = searchParams.get("lineId");
    if (!lineType || !lineId) return;
    if (lineType !== "MISSION" && lineType !== "SERVICE_BOOKING") return;

    const matchingLine = data.lines.find(
      (line) => line.lineType === lineType && line.lineId === lineId,
    );
    if (!matchingLine) return;

    hasAutoOpenedDetailsRef.current = true;
    handleOpenDetails(matchingLine);
  }, [data.lines, handleOpenDetails, searchParams]);

  return (
    <section className="space-y-6">
      {/* ── Header ── */}
      <header className="space-y-0.5">
        <p className="text-overline text-[hsl(var(--teal))] uppercase tracking-widest text-xs font-semibold">
          Espace Planning
        </p>
        <h1 className="text-heading-xl">Mes Réservations</h1>
        <p className="text-body-sm text-[hsl(var(--text-secondary))]">
          Vue planning de vos interventions et réservations selon votre rôle.
        </p>
      </header>

      {/* ── Next step highlight ── */}
      <GlassCard variant="teal" className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[hsl(var(--teal)/0.15)] shrink-0">
            <CalendarDays className="h-5 w-5 text-[hsl(var(--teal))]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[hsl(var(--teal))] uppercase tracking-wide mb-1">
              Prochaine intervention
            </p>
            {data.nextStep ? (
              <div className="space-y-1">
                <p className="text-body-sm font-medium text-[hsl(var(--text-primary))]">
                  {data.nextStep.typeLabel} — {data.nextStep.interlocutor}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-body-sm text-[hsl(var(--text-secondary))]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {dateFormatter.format(new Date(data.nextStep.date))}
                  </span>
                  {getStatusBadge(data.nextStep.status)}
                </div>
              </div>
            ) : (
              <p className="text-body-sm text-[hsl(var(--text-secondary))]">
                Aucune intervention future planifiée pour le moment.
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ── Planning table ── */}
      <GlassCard variant="solid">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-heading-sm">
            Planning{isRoleLoading ? " (mise à jour...)" : ""}
          </h2>
          <span className="text-body-sm text-[hsl(var(--text-secondary))]">
            {data.lines.length} ligne{data.lines.length > 1 ? "s" : ""}
          </span>
        </div>
        <GlassCardContent className="p-0">
          {data.lines.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CalendarClock}
                title="Aucune réservation"
                description="Vous n'avez pas encore de missions ou réservations planifiées."
                tips="Les nouvelles réservations apparaissent ici automatiquement."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Desktop header */}
              <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_1.2fr_auto_auto] md:gap-4 px-5 py-2.5 bg-[hsl(var(--surface-2))] text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--text-secondary))]">
                <span>Date</span>
                <span>Type</span>
                <span>Interlocuteur</span>
                <span>Statut</span>
                <span>Actions</span>
              </div>

              {data.lines.map((line) => (
                <div
                  key={`${line.lineType}-${line.lineId}`}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1fr_1.2fr_auto_auto] md:items-center hover:bg-[hsl(var(--surface-2))] transition-colors"
                >
                  {/* Date */}
                  <div className="flex items-center gap-2 text-body-sm">
                    <CalendarClock className="h-4 w-4 text-[hsl(var(--text-secondary))] shrink-0" />
                    <span>{dateFormatter.format(new Date(line.date))}</span>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-1.5 text-body-sm font-medium">
                    {line.lineType === "SERVICE_BOOKING" ? (
                      <Building2 className="h-4 w-4 text-[hsl(var(--violet))]" />
                    ) : (
                      <CalendarDays className="h-4 w-4 text-[hsl(var(--teal))]" />
                    )}
                    {line.typeLabel}
                  </div>

                  {/* Interlocutor */}
                  <div className="flex items-center gap-2 text-body-sm text-[hsl(var(--text-secondary))]">
                    <CircleUserRound className="h-4 w-4 shrink-0" />
                    <span>{line.interlocutor}</span>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    {getStatusBadge(line.status)}
                    <BookingLineLot6Panel
                      line={line}
                      userRole={userRole ?? loadedRole}
                      onBookingUpdated={refreshBookings}
                      disabled={isActionLoading}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(line)}
                      disabled={isActionLoading}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Détails
                    </Button>

                    {canCancel(line.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(line)}
                        disabled={isActionLoading}
                        className="text-[hsl(var(--color-red-600))] hover:text-[hsl(var(--color-red-600))] hover:bg-[hsl(var(--color-red-50))]"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Annuler
                      </Button>
                    )}

                    {userRole === "ESTABLISHMENT" && line.status === "PENDING" && (
                      <Button
                        variant="teal"
                        size="sm"
                        onClick={() => handleConfirm(line)}
                        disabled={isActionLoading}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Recruter
                      </Button>
                    )}

                    {userRole === "ESTABLISHMENT" && line.status === "CONFIRMED" && (
                      <Button
                        variant="coral"
                        size="sm"
                        onClick={() => handleComplete(line)}
                        disabled={isActionLoading}
                      >
                        <CheckCheck className="mr-1 h-3.5 w-3.5" />
                        Terminer
                      </Button>
                    )}

                    {userRole === "ESTABLISHMENT" && line.status === "COMPLETED_AWAITING_PAYMENT" && (
                      <Button
                        variant="teal"
                        size="sm"
                        onClick={() => handleAuthorizePayment(line)}
                        disabled={isActionLoading}
                      >
                        <CreditCard className="mr-1 h-3.5 w-3.5" />
                        Valider règlement
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* ── Details dialog ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>
              Informations de lieu et de contact pour préparer l'intervention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--surface-2))]">
              <MapPin className="mt-0.5 h-4 w-4 text-[hsl(var(--teal))] shrink-0" />
              <div>
                <p className="font-medium mb-0.5">Adresse</p>
                <p className="text-[hsl(var(--text-secondary))]">
                  {isDetailsLoading ? "Chargement..." : (details?.address ?? selectedLine?.address ?? "N/A")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--surface-2))]">
              <FileText className="mt-0.5 h-4 w-4 text-[hsl(var(--teal))] shrink-0" />
              <div>
                <p className="font-medium mb-0.5">Contact</p>
                <p className="text-[hsl(var(--text-secondary))]">
                  {isDetailsLoading ? "Chargement..." : (details?.contactEmail ?? selectedLine?.contactEmail ?? "N/A")}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

