import { AlertCircle, ShieldAlert, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlockedBookingItem, PendingValidationUser } from "@/lib/admin/desk-mocks";

type RequiredActionsProps = {
  pendingUsers: PendingValidationUser[];
  blockedBookings: BlockedBookingItem[];
};

function getBlockedBadgeClass(status: BlockedBookingItem["status"]): string {
  if (status === "DISPUTE") {
    return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  }

  return "bg-red-100 text-red-700 hover:bg-red-100";
}

export function RequiredActions({ pendingUsers, blockedBookings }: RequiredActionsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Actions Requises</h3>
        <p className="text-sm text-muted-foreground">Points de contrôle prioritaires du Desk.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-base">Utilisateurs en attente de validation</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.submittedAt}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {user.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-base">Bookings bloqués / litige</CardTitle>
            <ShieldAlert className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {blockedBookings.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-3 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Aucun booking bloqué ou en litige.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{booking.label}</p>
                      <p className="text-xs text-muted-foreground">{booking.reason}</p>
                    </div>
                    <Badge className={getBlockedBadgeClass(booking.status)}>{booking.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
