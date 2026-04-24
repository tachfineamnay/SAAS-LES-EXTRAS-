import { AlertCircle, Inbox, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { AdminUserRow, DeskRequestRow } from "@/app/actions/admin";

type RequiredActionsProps = {
  pendingUsers: AdminUserRow[];
  openDeskRequests: DeskRequestRow[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function getRequesterName(requester: DeskRequestRow["requester"]): string {
  if (requester.profile) {
    return `${requester.profile.firstName} ${requester.profile.lastName}`.trim();
  }
  return requester.email;
}

export function RequiredActions({ pendingUsers, openDeskRequests }: RequiredActionsProps) {
  return (
    <>
      <GlassCard>
        <GlassCardHeader className="flex flex-row items-start justify-between space-y-0">
          <h4 className="text-base font-semibold leading-none tracking-tight">Utilisateurs en attente de validation</h4>
          <UserCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-2">
            {pendingUsers.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/40 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(user.createdAt))}
                  </p>
                </div>
                <StatusPill status="pending" label={user.status} showDot={false} />
              </div>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader className="flex flex-row items-start justify-between space-y-0">
          <h4 className="text-base font-semibold leading-none tracking-tight">Demandes Desk ouvertes</h4>
          <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </GlassCardHeader>
        <GlassCardContent>
          {openDeskRequests.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/50 px-3 py-3 text-sm text-muted-foreground bg-muted/20">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Aucune demande ouverte.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {openDeskRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/40 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {request.mission?.title ?? "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {getRequesterName(request.requester)}
                    </p>
                  </div>
                  <Badge variant={request.priority === "URGENT" ? "coral" : "quiet"}>
                    {request.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </>
  );
}
