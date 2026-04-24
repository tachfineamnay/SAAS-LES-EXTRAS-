"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MessageSquareReply, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  assignDeskRequest,
  createFinanceIncident,
  respondToDeskRequest,
  updateDeskRequestStatus,
  type AdminUserRow,
  type DeskRequestPriority,
  type DeskRequestRow,
  type DeskRequestStatus,
  type FinanceIncidentType,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { FilterBar, type FilterDefinition } from "@/components/data/FilterBar";

// ─── Types ───────────────────────────────────────────────────────────────────

type FinanceIncidentsTableProps = {
  requests: DeskRequestRow[];
  admins: AdminUserRow[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

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

const TYPE_LABELS: Record<FinanceIncidentType, string> = {
  PAYMENT_ISSUE: "Problème paiement",
  BOOKING_FAILURE: "Réservation échouée",
  PACK_PURCHASE_FAILURE: "Achat pack échoué",
  MISSION_PUBLISH_FAILURE: "Publication mission échouée",
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

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  QUOTE_SENT: "Devis envoyé",
  QUOTE_ACCEPTED: "Devis accepté",
  CONFIRMED: "Confirmée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  AWAITING_PAYMENT: "À encaisser",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

const FILTERS: FilterDefinition[] = [
  {
    key: "type",
    label: "Tous les types",
    options: (Object.keys(TYPE_LABELS) as FinanceIncidentType[]).map((key) => ({
      label: TYPE_LABELS[key],
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
    key: "status",
    label: "Tous les statuts",
    options: [
      { label: STATUS_LABELS.OPEN, value: "OPEN" },
      { label: STATUS_LABELS.IN_PROGRESS, value: "IN_PROGRESS" },
      { label: STATUS_LABELS.ANSWERED, value: "ANSWERED" },
      { label: STATUS_LABELS.CLOSED, value: "CLOSED" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getBookingContext(booking: DeskRequestRow["booking"]): string | null {
  if (!booking) return null;
  const title = booking.reliefMission?.title ?? booking.service?.title ?? null;
  const statusLabel = BOOKING_STATUS_LABELS[booking.status] ?? booking.status;
  return title ? `${title} — ${statusLabel}` : `Booking ${statusLabel}`;
}

// ─── Create Incident Sheet ────────────────────────────────────────────────────

type CreateSheetProps = {
  open: boolean;
  onClose: () => void;
  admins: AdminUserRow[];
};

function CreateIncidentSheet({ open, onClose }: CreateSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<FinanceIncidentType>("PAYMENT_ISSUE");
  const [priority, setPriority] = useState<DeskRequestPriority>("NORMAL");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setType("PAYMENT_ISSUE");
    setPriority("NORMAL");
    setRequesterEmail("");
    setBookingId("");
    setMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit =
    !isPending &&
    requesterEmail.trim().includes("@") &&
    message.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      try {
        await createFinanceIncident({
          type,
          priority,
          message: message.trim(),
          requesterEmail: requesterEmail.trim(),
          bookingId: bookingId.trim() || undefined,
        });
        toast.success("Incident créé");
        handleClose();
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur lors de la création";
        toast.error(msg);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Créer un incident finance</SheetTitle>
          <SheetDescription>
            Saisissez les informations de l&apos;incident. L&apos;utilisateur concerné recevra
            une notification à la réponse.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Type d&apos;incident
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as FinanceIncidentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as FinanceIncidentType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Priorité
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as DeskRequestPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_LABELS) as DeskRequestPriority[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {PRIORITY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="requesterEmail"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Email de l&apos;utilisateur concerné
            </Label>
            <Input
              id="requesterEmail"
              type="email"
              placeholder="utilisateur@domaine.fr"
              value={requesterEmail}
              onChange={(e) => setRequesterEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="bookingId"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              ID Réservation (optionnel)
            </Label>
            <Input
              id="bookingId"
              placeholder="cm… (depuis la page Finance)"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Description de l&apos;incident
            </Label>
            <Textarea
              id="message"
              rows={5}
              className="resize-none"
              placeholder="Décrivez le problème rencontré par l'utilisateur…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button className="w-full gap-2" disabled={!canSubmit} onClick={handleSubmit}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Création…" : "Créer l'incident"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

type DetailSheetProps = {
  selected: DeskRequestRow | null;
  admins: AdminUserRow[];
  onClose: () => void;
};

function IncidentDetailSheet({ selected, admins, onClose }: DetailSheetProps) {
  const router = useRouter();
  const [replyText, setReplyText] = useState(selected?.response ?? "");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: DeskRequestStatus) => {
    startTransition(async () => {
      try {
        await updateDeskRequestStatus(id, status);
        toast.success("Statut mis à jour");
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
        toast.success(adminId ? "Incident assigné" : "Assignation retirée");
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
        onClose();
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'envoi de la réponse");
      }
    });
  };

  if (!selected) return null;

  const bookingContext = getBookingContext(selected.booking);
  const typeLabel = TYPE_LABELS[selected.type as FinanceIncidentType] ?? selected.type;

  return (
    <Sheet open={!!selected} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{typeLabel}</SheetTitle>
          <SheetDescription>{getRequesterName(selected.requester)}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Contexte booking */}
          {bookingContext && (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Réservation liée
              </p>
              <p className="text-sm">{bookingContext}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ID : {selected.booking?.id}</p>
            </div>
          )}

          {/* Statut */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Statut
            </p>
            <div className="flex flex-wrap gap-2">
              {(["OPEN", "IN_PROGRESS", "ANSWERED", "CLOSED"] as DeskRequestStatus[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={selected.status === s ? "default" : "outline"}
                  disabled={isPending}
                  onClick={() => handleStatusChange(selected.id, s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>

          {/* Assignation */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Assignation
            </p>
            <Select
              value={selected.assignedToAdminId ?? "UNASSIGNED"}
              disabled={isPending}
              onValueChange={(value) =>
                handleAssign(selected.id, value === "UNASSIGNED" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Assigner à un admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNASSIGNED">Non assigné</SelectItem>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description de l&apos;incident
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

          {/* Infos utilisateur */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-1 text-sm">
            <p className="font-medium flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {getRequesterName(selected.requester)}
            </p>
            <p className="text-muted-foreground">{selected.requester.email}</p>
            <p className="text-xs text-muted-foreground">
              Incident créé le {dateFormatter.format(new Date(selected.createdAt))}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function FinanceIncidentsTable({ requests, admins }: FinanceIncidentsTableProps) {
  const [selected, setSelected] = useState<DeskRequestRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (typeFilter !== "ALL" && req.type !== typeFilter) return false;
      if (priorityFilter !== "ALL" && req.priority !== priorityFilter) return false;
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      return true;
    });
  }, [requests, typeFilter, priorityFilter, statusFilter]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") setTypeFilter(value);
    if (key === "priority") setPriorityFilter(value);
    if (key === "status") setStatusFilter(value);
  };

  const handleResetFilters = () => {
    setTypeFilter("ALL");
    setPriorityFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b border-border/50 p-4 flex items-center justify-between gap-3">
          <FilterBar
            filters={FILTERS}
            activeFilters={{
              type: typeFilter,
              priority: priorityFilter,
              status: statusFilter,
            }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Créer
          </Button>
        </div>

        {requests.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Aucun incident finance / commerce pour le moment.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contexte</TableHead>
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
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Aucun incident ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const bookingContext = getBookingContext(req.booking);
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {TYPE_LABELS[req.type as FinanceIncidentType] ?? req.type}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {getRequesterName(req.requester)}
                        <span className="block text-xs text-muted-foreground truncate">
                          {req.requester.email}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                        {bookingContext ?? "—"}
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
                      <TableCell className="max-w-[120px] truncate text-sm text-muted-foreground">
                        {req.assignedToAdmin ? getAdminName(req.assignedToAdmin) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {dateFormatter.format(new Date(req.createdAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setSelected(req)}
                        >
                          <MessageSquareReply className="h-3.5 w-3.5" aria-hidden="true" />
                          Traiter
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateIncidentSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        admins={admins}
      />

      <IncidentDetailSheet
        selected={selected}
        admins={admins}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
