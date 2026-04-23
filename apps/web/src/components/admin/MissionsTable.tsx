"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteMission,
  getAdminMissionDetail,
  getAdminMissions,
  type AdminMissionDetail,
  type AdminMissionRow,
} from "@/app/actions/admin";
import { DataTableShell } from "@/components/data/DataTableShell";
import { MissionDetailSheet } from "@/components/admin/MissionDetailSheet";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { TableCell, TableRow } from "@/components/ui/table";

type MissionsTableProps = {
  missions: AdminMissionRow[];
};

function getMissionStatus(status: AdminMissionRow["status"]): "active" | "published" | "draft" {
  if (status === "ASSIGNED") return "active";
  if (status === "OPEN") return "published";
  return "draft";
}

export function MissionsTable({ missions }: MissionsTableProps) {
  const [rows, setRows] = useState<AdminMissionRow[]>(missions);
  const [selectedMission, setSelectedMission] = useState<AdminMissionDetail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshRows = async () => {
    const nextRows = await getAdminMissions();
    setRows(nextRows);
  };

  const handleOpenDetails = (missionId: string) => {
    setIsSheetOpen(true);
    setIsDetailsLoading(true);
    setSelectedMission(null);

    void getAdminMissionDetail(missionId)
      .then((nextMission) => {
        setSelectedMission(nextMission);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Impossible de charger la mission.");
      })
      .finally(() => {
        setIsDetailsLoading(false);
      });
  };

  const handleDelete = (missionId: string) => {
    startTransition(() => {
      void (async () => {
        try {
          await deleteMission(missionId);
          await refreshRows();

          if (selectedMission?.id === missionId) {
            setIsSheetOpen(false);
            setSelectedMission(null);
          }

          toast.success("Mission supprimée.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Impossible de supprimer la mission.");
        }
      })();
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
            onClick={() => handleOpenDetails(mission.id)}
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

      <MissionDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mission={selectedMission}
        isLoading={isDetailsLoading}
        isPending={isPending}
        onDelete={handleDelete}
      />
    </>
  );
}
