"use client";

import { useState, useTransition } from "react";
import { MapPin, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { deleteMission, getAdminMissions, type AdminMissionRow } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTableShell } from "@/components/data/DataTableShell";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MissionsTableProps = {
  missions: AdminMissionRow[];
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

function getMissionStatus(status: AdminMissionRow["status"]): "active" | "published" | "draft" {
  if (status === "ASSIGNED") return "active";
  if (status === "OPEN") return "published";
  return "draft";
}

export function MissionsTable({ missions }: MissionsTableProps) {
  const [rows, setRows] = useState<AdminMissionRow[]>(missions);
  const [selectedMission, setSelectedMission] = useState<AdminMissionRow | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenDetails = (mission: AdminMissionRow) => {
    setSelectedMission(mission);
    setIsSheetOpen(true);
  };

  const handleDelete = (missionId: string) => {
    startTransition(async () => {
      try {
        await deleteMission(missionId);
        const nextRows = await getAdminMissions();
        setRows(nextRows);
        if (selectedMission?.id === missionId) {
          setIsSheetOpen(false);
          setSelectedMission(null);
        }
        toast.success("Mission supprimée.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de supprimer la mission.");
      }
    });
  };

  return (
    <>
      <DataTableShell
        columns={["Titre", "Établissement", "Ville", "Statut", "Candidats", "Action"]}
        emptyTitle="Aucune mission à modérer"
        emptyDescription="Toutes les missions sont traitées."
      >
        {rows.map((mission) => (
          <TableRow
            key={mission.id}
            className="cursor-pointer"
            onClick={() => handleOpenDetails(mission)}
          >
            <TableCell className="font-medium text-foreground">{mission.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{mission.establishmentName}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{mission.city}</TableCell>
            <TableCell>
              <StatusPill status={getMissionStatus(mission.status)} label={mission.status} />
            </TableCell>
            <TableCell className="text-sm text-foreground">{mission.candidatesCount}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="danger-soft"
                size="sm"
                disabled={isPending}
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDelete(mission.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg glass-surface">
          <SheetHeader>
            <SheetTitle>Détail mission Renfort</SheetTitle>
            <SheetDescription>Lecture rapide du contenu avant modération.</SheetDescription>
          </SheetHeader>

          {selectedMission ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Titre</p>
                <p className="text-base font-medium text-foreground">{selectedMission.title}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span>
                  {selectedMission.establishmentName} ({selectedMission.establishmentEmail})
                </span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4" aria-hidden="true" />
                <span>{selectedMission.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-md border border-border/50 bg-muted/50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {dateFormatter.format(new Date(selectedMission.dateStart))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Créneau</p>
                  <p className="font-medium text-foreground">
                    {timeFormatter.format(new Date(selectedMission.dateStart))} –{" "}
                    {timeFormatter.format(new Date(selectedMission.dateEnd))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarif horaire</p>
                  <p className="font-medium text-foreground">{moneyFormatter.format(selectedMission.hourlyRate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Candidats</p>
                  <p className="font-medium text-foreground">{selectedMission.candidatesCount}</p>
                </div>
              </div>

              <div className="rounded-md border border-border/50 bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Statut</p>
                <StatusPill
                  status={getMissionStatus(selectedMission.status)}
                  label={selectedMission.status}
                  className="mt-1"
                />
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
