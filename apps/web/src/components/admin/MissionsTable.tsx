"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Clock3, MapPin, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { deleteMission, getAdminMissions, type AdminMissionRow } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function getStatusBadgeClass(status: AdminMissionRow["status"]): string {
  if (status === "ASSIGNED") {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (status === "OPEN") {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  }

  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
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
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Candidats</TableHead>
              <TableHead className="w-[110px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  Aucune mission à modérer.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((mission) => (
                <TableRow
                  key={mission.id}
                  className="cursor-pointer"
                  onClick={() => handleOpenDetails(mission)}
                >
                  <TableCell className="font-medium text-slate-900">{mission.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{mission.clientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{mission.city}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(mission.status)}>{mission.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{mission.candidatesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Détail mission SOS</SheetTitle>
            <SheetDescription>Lecture rapide du contenu avant modération.</SheetDescription>
          </SheetHeader>

          {selectedMission ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Titre</p>
                <p className="text-base font-medium text-slate-900">{selectedMission.title}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="h-4 w-4" />
                <span>
                  {selectedMission.clientName} ({selectedMission.clientEmail})
                </span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>{selectedMission.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-md border bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {dateFormatter.format(new Date(selectedMission.dateStart))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Créneau</p>
                  <p className="font-medium">
                    {timeFormatter.format(new Date(selectedMission.dateStart))} -{" "}
                    {timeFormatter.format(new Date(selectedMission.dateEnd))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarif horaire</p>
                  <p className="font-medium">{moneyFormatter.format(selectedMission.hourlyRate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Candidats</p>
                  <p className="font-medium">{selectedMission.candidatesCount}</p>
                </div>
              </div>

              <div className="rounded-md border bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground">Statut</p>
                <Badge className={getStatusBadgeClass(selectedMission.status)}>
                  {selectedMission.status}
                </Badge>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
