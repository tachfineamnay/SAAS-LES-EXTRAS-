"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Clock, MessageSquareReply, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  type DeskRequestRow,
  type DeskRequestStatus,
  updateDeskRequestStatus,
  respondToDeskRequest,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

function getRequesterName(requester: DeskRequestRow["requester"]): string {
  if (requester.profile) {
    return `${requester.profile.firstName} ${requester.profile.lastName}`.trim();
  }
  return requester.email;
}

type DeskRequestsTableProps = {
  requests: DeskRequestRow[];
};

export function DeskRequestsTable({ requests }: DeskRequestsTableProps) {
  const [selected, setSelected] = useState<DeskRequestRow | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const openSheet = (req: DeskRequestRow) => {
    setSelected(req);
    setReplyText(req.response ?? "");
  };

  const closeSheet = () => {
    setSelected(null);
    setReplyText("");
  };

  const handleStatusChange = (id: string, status: DeskRequestStatus) => {
    startTransition(async () => {
      try {
        await updateDeskRequestStatus(id, status);
        toast.success("Statut mis à jour");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  const handleRespond = () => {
    if (!selected || replyText.trim().length < 5) return;
    startTransition(async () => {
      try {
        await respondToDeskRequest(selected.id, replyText.trim());
        toast.success("Réponse envoyée — le candidat a été notifié");
        closeSheet();
      } catch {
        toast.error("Erreur lors de l'envoi de la réponse");
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        Aucune demande d&apos;informations pour le moment.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mission</TableHead>
              <TableHead>Candidat</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium max-w-[160px] truncate">
                  {req.mission.title}
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
                  <Badge variant={STATUS_VARIANTS[req.status]}>
                    {STATUS_LABELS[req.status]}
                  </Badge>
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
                <SheetTitle>Demande d&apos;information</SheetTitle>
                <SheetDescription>
                  Mission : {selected.mission.title} — {getRequesterName(selected.requester)}
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

                {/* Message candidat */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Message du candidat
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
                    {selected.response ? "Modifier la réponse" : "Répondre au candidat"}
                  </p>
                  <Textarea
                    rows={5}
                    className="resize-none"
                    placeholder="Rédigez votre réponse… Elle sera visible par le candidat dans son espace."
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
                  <p className="font-medium">{getRequesterName(selected.requester)}</p>
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
