import { AlertCircle, ShieldAlert, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card";
import { StatusPill } from "@/components/ui/status-pill";
import type { BlockedBookingItem, PendingValidationUser } from "@/lib/admin/desk-mocks";

type RequiredActionsProps = {
  pendingUsers: PendingValidationUser[];
  blockedBookings: BlockedBookingItem[];
};

function getBlockedStatus(status: BlockedBookingItem["status"]): "pending" | "error" {
  return status === "DISPUTE" ? "pending" : "error";
}

export function RequiredActions({ pendingUsers, blockedBookings }: RequiredActionsProps) {
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
                  <p className="text-xs text-muted-foreground">{user.submittedAt}</p>
                </div>
                <StatusPill status="pending" label={user.status} showDot={false} />
              </div>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader className="flex flex-row items-start justify-between space-y-0">
          <h4 className="text-base font-semibold leading-none tracking-tight">Bookings bloqués / litige</h4>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </GlassCardHeader>
        <GlassCardContent>
          {blockedBookings.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/50 px-3 py-3 text-sm text-muted-foreground bg-muted/20">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Aucun booking bloqué ou en litige.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/40 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{booking.label}</p>
                    <p className="text-xs text-muted-foreground">{booking.reason}</p>
                  </div>
                  <StatusPill status={getBlockedStatus(booking.status)} label={booking.status} />
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </>
  );
}
