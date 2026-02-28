import { AlertCircle, ShieldAlert, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">Utilisateurs en attente de validation</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingUsers.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/50"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">Bookings bloqués / litige</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          {blockedBookings.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border/50 px-3 py-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Aucun booking bloqué ou en litige.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/50"
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
        </CardContent>
      </Card>
    </>
  );
}
