"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MessageSquareReply, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  assignDeskRequest,
  type AdminUserRow,
  type DeskRequestPriority,
  type DeskRequestRow,
  type DeskRequestStatus,
  updateDeskRequestStatus,
  respondToDeskRequest,
} from "@/app/actions/admin";
import {
  DESK_REQUEST_TYPE_LABELS,
  getDeskContextLabel,
  getDeskRequestTypeLabel,
} from "@/lib/desk-labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FilterBar, type FilterDefinition } from "@/components/data/FilterBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const STATUS_LABELS: Record<DeskRequestStatus, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  ANSWERED: "Répondue",
  CLOSED: "Clôturée",
};

const STATUS_VARIANTS: Record<DeskRequestStatus, "default" | "outline" | "secondary"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  ANSWERED: "outline",
  CLOSED: "outline",
};

const PRIORITY_LABELS: Record<DeskRequestPriority, string> = {
  LOW: "Basse",
  NORMAL: "Normale",
  HIGH: "Haute",
  URGENT: "Urgente",
};

const PRIORITY_VARIANTS: Record<DeskRequestPriority, "quiet" | "default" | "amber" | "coral"> = {
  LOW: "quiet",
  NORMAL: "default",
  HIGH: "amber",
  URGENT: "coral",
};

const FILTERS: FilterDefinition[] = [
  {
    key: "type",
    label: "Tous les types",
    options: (Object.keys(DESK_REQUEST_TYPE_LABELS) as DeskRequestRow["type"][]).map((key) => ({
      label: getDeskRequestTypeLabel(key),
      value: key,
    })),
  },
  {
    key: "priority",
    label: "Toutes priorités",
    options: [
      { label: PRIORITY_LABELS.LOW, value: "LOW" },
      { label: PRIORITY_LABELS.NORMAL, value: "NORMAL" },
      { label: PRIORITY_LABELS.HIGH, value: "HIGH" },
      { label: PRIORITY_LABELS.URGENT, value: "URGENT" },
    ],
  },
  {
    key: "assigned",
    label: "Assignation",
    options: [
      { label: "Assignées", value: "ASSIGNED" },
      { label: "Non assignées", value: "UNASSIGNED" },
    ],
  },
];

function getRequesterName(requester: DeskRequestRow["requester"]): string {
  if (requester.profile) {
    return `${requester.profile.firstName} ${requester.profile.lastName}`.trim();
  }
  return requester.email;
}

function getAdminName(admin: NonNullable<DeskRequestRow["assignedToAdmin"]> | AdminUserRow): string {
  if ("name" in admin) return admin.name;
  if (admin.profile) {
    return `${admin.profile.firstName} ${admin.profile.lastName}`.trim();
  }
  return admin.email;
}

type DeskRequestsTableProps = {
  requests: DeskRequestRow[];
  admins: AdminUserRow[];
};

export function DeskRequestsTable({ requests, admins }: DeskRequestsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<DeskRequestRow | null>(null);
  const [replyText, setReplyText] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assignedFilter, setAssignedFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (typeFilter !== "ALL" && request.type !== typeFilter) return false;
      if (priorityFilter !== "ALL" && request.priority !== priorityFilter) return false;
      if (assignedFilter === "ASSIGNED" && !request.assignedToAdminId) return false;
      if (assignedFilter === "UNASSIGNED" && request.assignedToAdminId) return false;
      return true;
    });
  }, [assignedFilter, priorityFilter, requests, typeFilter]);

  const openSheet = (req: DeskRequestRow) => {
    setSelected(req);
    setReplyText(req.response ?? "");
  };

  const closeSheet = () => {
    setSelected(null);
    setReplyText("");
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") setTypeFilter(value);
    if (key === "priority") setPriorityFilter(value);
    if (key === "assigned") setAssignedFilter(value);
  };

  const handleResetFilters = () => {
    setTypeFilter("ALL");
    setPriorityFilter("ALL");
    setAssignedFilter("ALL");
  };

  const handleStatusChange = (id: string, status: DeskRequestStatus) => {
    startTransition(async () => {
      try {
        await updateDeskRequestStatus(id, status);
        toast.success("Statut mis à jour");
        setSelected((current) => (current?.id === id ? { ...current, status } : current));
        router.refresh();
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  const handleAssign = (id: string, adminId: string | null) => {
    startTransition(async () => {
      try {
        await assignDeskRequest(id, adminId);
        toast.success(adminId ? "Demande assignée" : "Assignation retirée");
        const assignedAdmin = admins.find((admin) => admin.id === adminId);
        setSelected((current) =>
          current?.id === id
            ? {
                ...current,
                assignedToAdminId: adminId,
                assignedToAdmin: assignedAdmin
                  ? { id: assignedAdmin.id, email: assignedAdmin.email, profile: null }
                  : null,
              }
            : current,
        );
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'assignation");
      }
    });
  };

  const handleRespond = () => {
    if (!selected || replyText.trim().length < 5) return;
    startTransition(async () => {
      try {
        await respondToDeskRequest(selected.id, replyText.trim());
        toast.success("Réponse envoyée — l'utilisateur a été notifié");
        closeSheet();
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'envoi de la réponse");
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        Aucun ticket Desk pour le moment.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b border-border/50 p-4">
          <FilterBar
            filters={FILTERS}
            activeFilters={{
              type: typeFilter,
              priority: priorityFilter,
              assigned: assignedFilter,
            }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Contexte</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Assigné</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                  Aucune demande ne correspond aux filtres.
                </TableCell>
              </TableRow>
            ) : filteredRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium max-w-[150px] truncate">
                  {getDeskRequestTypeLabel(req.type)}
                </TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">
                  {getDeskContextLabel(req)}
                </TableCell>
                <TableCell className="max-w-[140px] truncate">
                  {getRequesterName(req.requester)}
                  <span className="block text-xs text-muted-foreground truncate">
                    {req.requester.email}
                  </span>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_VARIANTS[req.priority]}>
                    {PRIORITY_LABELS[req.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[req.status]}>
                    {STATUS_LABELS[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                  {req.assignedToAdmin ? getAdminName(req.assignedToAdmin) : "Non assignée"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {dateFormatter.format(new Date(req.createdAt))}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => openSheet(req)}
                  >
                    <MessageSquareReply className="h-3.5 w-3.5" aria-hidden="true" />
                    Traiter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{getDeskRequestTypeLabel(selected.type)}</SheetTitle>
                <SheetDescription>
                  {getDeskContextLabel(selected)} —{" "}
                  {getRequesterName(selected.requester)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Statut */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Statut
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["OPEN", "IN_PROGRESS", "ANSWERED", "CLOSED"] as DeskRequestStatus[]).map(
                      (s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={selected.status === s ? "default" : "outline"}
                          disabled={isPending}
                          onClick={() => handleStatusChange(selected.id, s)}
                        >
                          {STATUS_LABELS[s]}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Assignation
                  </p>
                  <Select
                    value={selected.assignedToAdminId ?? "UNASSIGNED"}
                    disabled={isPending}
                    onValueChange={(value) => {
                      handleAssign(selected.id, value === "UNASSIGNED" ? null : value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assigner à un admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Non assignée</SelectItem>
                      {admins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message candidat */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Message utilisateur
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                {/* Réponse existante */}
                {selected.response && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      Réponse envoyée
                    </p>
                    <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/20 p-4 text-sm whitespace-pre-wrap">
                      {selected.response}
                    </div>
                    {selected.answeredAt && (
                      <p className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(selected.answeredAt))}
                        {selected.answeredBy?.profile
                          ? ` — ${selected.answeredBy.profile.firstName} ${selected.answeredBy.profile.lastName}`
                          : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* Zone de réponse */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {selected.response ? "Modifier la réponse" : "Répondre à l'utilisateur"}
                  </p>
                  <Textarea
                    rows={5}
                    className="resize-none"
                    placeholder="Rédigez votre réponse… Elle sera visible par l'utilisateur dans son espace."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button
                    className="w-full gap-2"
                    disabled={isPending || replyText.trim().length < 5}
                    onClick={handleRespond}
                  >
                    <MessageSquareReply className="h-4 w-4" aria-hidden="true" />
                    {isPending ? "Envoi…" : "Envoyer la réponse"}
                  </Button>
                </div>

                {/* Infos candidat */}
                <div className="rounded-lg border bg-muted/20 p-4 space-y-1 text-sm">
                  <p className="font-medium flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {getRequesterName(selected.requester)}
                  </p>
                  <p className="text-muted-foreground">{selected.requester.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Demande reçue le {dateFormatter.format(new Date(selected.createdAt))}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
