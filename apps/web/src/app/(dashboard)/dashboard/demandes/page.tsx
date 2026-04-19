import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, Inbox, MessageSquare } from "lucide-react";
import { getSession, deleteSession } from "@/lib/session";
import { getMyDeskRequestsSafe, type MyDeskRequest, type MyDeskRequestStatus } from "@/app/actions/desk";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<MyDeskRequestStatus, string> = {
  OPEN: "En attente",
  IN_PROGRESS: "En cours de traitement",
  ANSWERED: "Répondue",
  CLOSED: "Clôturée",
};

const STATUS_VARIANTS: Record<MyDeskRequestStatus, "default" | "outline" | "secondary"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  ANSWERED: "outline",
  CLOSED: "outline",
};

function StatusIcon({ status }: { status: MyDeskRequestStatus }) {
  if (status === "ANSWERED") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden="true" />;
  }

  return <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />;
}

function DeskRequestCard({ req }: { req: MyDeskRequest }) {
  return (
    <article className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <p className="font-semibold text-sm">{req.mission.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(req.createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={req.status} />
          <Badge variant={STATUS_VARIANTS[req.status]}>
            {STATUS_LABELS[req.status]}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3" />
          Votre question
        </p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{req.message}</p>
      </div>

      {req.response && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Réponse de l&apos;équipe
          </p>
          <p className="text-sm whitespace-pre-wrap">{req.response}</p>
          {req.answeredAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(req.answeredAt), "d MMMM yyyy", { locale: fr })}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default async function MesDemandesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "FREELANCE") redirect("/dashboard");

  const result = await getMyDeskRequestsSafe(session.token);
  if (!result.ok && result.unauthorized) {
    await deleteSession();
    redirect("/login");
  }

  const requests = result.ok ? result.data : [];
  const loadError = result.ok ? null : result.error;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mes demandes</h1>
        <p className="text-sm text-muted-foreground">
          Retrouvez vos demandes d&apos;informations sur les missions et les réponses de l&apos;équipe.
        </p>
      </header>

      {loadError && (
        <div className="rounded-xl border border-[hsl(var(--color-amber-300))] bg-[hsl(var(--color-amber-50))] p-4 text-sm text-[hsl(var(--color-amber-800))]">
          {loadError}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 flex flex-col items-center gap-3 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {loadError ? "Nous ne pouvons pas afficher vos demandes pour le moment." : "Aucune demande pour le moment."}
          </p>
          <p className="text-xs text-muted-foreground">
            Vous pouvez en soumettre depuis la fiche d&apos;une mission via &laquo; Demander plus d&apos;informations &raquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <DeskRequestCard key={req.id} req={req} />
          ))}
        </div>
      )}
    </div>
  );
}
