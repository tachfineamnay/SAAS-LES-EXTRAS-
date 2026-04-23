"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Trash2, UserRound } from "lucide-react";
import {
  type AdminMissionDetail,
  type AdminMissionLinkedDeskRequest,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "@/components/ui/status-pill";

type MissionDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: AdminMissionDetail | null;
  isLoading: boolean;
  isPending: boolean;
  onDelete: (missionId: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function getMissionStatus(status: AdminMissionDetail["status"]): "active" | "published" | "draft" {
  if (status === "ASSIGNED") return "active";
  if (status === "OPEN") return "published";
  return "draft";
}

function getDeskStatusMeta(
  status: AdminMissionLinkedDeskRequest["status"],
): { label: string; variant: "default" | "secondary" | "outline" } {
  if (status === "OPEN") return { label: "Ouverte", variant: "default" };
  if (status === "IN_PROGRESS") return { label: "En cours", variant: "secondary" };
  if (status === "ANSWERED") return { label: "Répondue", variant: "outline" };
  return { label: "Clôturée", variant: "outline" };
}

function getPriorityMeta(
  priority: AdminMissionLinkedDeskRequest["priority"],
): { label: string; variant: "quiet" | "default" | "amber" | "coral" } {
  if (priority === "LOW") return { label: "Basse", variant: "quiet" };
  if (priority === "HIGH") return { label: "Haute", variant: "amber" };
  if (priority === "URGENT") return { label: "Urgente", variant: "coral" };
  return { label: "Normale", variant: "default" };
}

export function MissionDetailSheet({
  open,
  onOpenChange,
  mission,
  isLoading,
  isPending,
  onDelete,
}: MissionDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg glass-surface">
        <SheetHeader>
          <SheetTitle>Détail mission Renfort</SheetTitle>
          <SheetDescription>Lecture rapide du contenu avant modération.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Chargement de la mission…</p>
        ) : mission ? (
          <div className="mt-6 space-y-5 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Titre</p>
              <p className="text-base font-medium text-foreground">{mission.title}</p>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span>
                {mission.establishmentName} ({mission.establishmentEmail})
              </span>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4" aria-hidden="true" />
              <span>{mission.address}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-md border border-border/50 bg-muted/50 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {dateFormatter.format(new Date(mission.dateStart))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Créneau</p>
                <p className="font-medium text-foreground">
                  {timeFormatter.format(new Date(mission.dateStart))} –{" "}
                  {timeFormatter.format(new Date(mission.dateEnd))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tarif horaire</p>
                <p className="font-medium text-foreground">{moneyFormatter.format(mission.hourlyRate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Candidats</p>
                <p className="font-medium text-foreground">{mission.candidatesCount}</p>
              </div>
            </div>

            <div className="rounded-md border border-border/50 bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Statut</p>
              <StatusPill
                status={getMissionStatus(mission.status)}
                label={mission.status}
                className="mt-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger-soft"
                disabled={isPending}
                onClick={() => onDelete(mission.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Supprimer la mission
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/demandes">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Voir les demandes liées
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Demandes info liées
                </p>
                <p className="text-xs text-muted-foreground">
                  {mission.linkedDeskRequests.length} demande(s) liée(s) à cette mission.
                </p>
              </div>

              {mission.linkedDeskRequests.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Aucune demande d’information liée.
                </div>
              ) : (
                <div className="space-y-3">
                  {mission.linkedDeskRequests.map((request) => {
                    const status = getDeskStatusMeta(request.status);
                    const priority = getPriorityMeta(request.priority);

                    return (
                      <div
                        key={request.id}
                        className="rounded-md border border-border/60 bg-muted/30 p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(request.createdAt))}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-foreground">{request.messageExcerpt}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Aucune mission sélectionnée.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
