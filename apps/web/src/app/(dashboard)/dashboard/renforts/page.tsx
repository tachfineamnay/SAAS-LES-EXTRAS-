import { getEstablishmentMissions } from "@/app/actions/missions";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/dashboard/client/CandidateCard";
import { Calendar, Clock, MapPin, Sun, Moon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMetierLabel } from "@/lib/sos-config";

export const dynamic = "force-dynamic";

export default async function SosDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  const missions = await getEstablishmentMissions();

  const openMissions = (missions as any[]).filter(
    (m: any) => m.status === "OPEN" || m.status === "ASSIGNED",
  );

  // Sort: missions with most candidates first
  openMissions.sort((a: any, b: any) => b.bookings.length - a.bookings.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Renforts</h1>
        <p className="text-muted-foreground">
          Gérez vos missions de renfort et validez les candidatures des freelances.
        </p>
      </div>

      <div className="grid gap-6">
        {openMissions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucune mission en cours</CardTitle>
              <CardDescription>
                Vous n'avez pas de demande de renfort active.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          openMissions.map((mission: any) => {
            const activeCandidacies = mission.bookings.filter(
              (b: any) => b.status !== "CANCELLED",
            );
            return (
              <Card key={mission.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">
                          {mission.metier
                            ? getMetierLabel(mission.metier)
                            : mission.title}
                        </CardTitle>
                        <Badge
                          variant={
                            mission.status === "ASSIGNED" ? "default" : "secondary"
                          }
                        >
                          {mission.status === "ASSIGNED" ? "Attribuée" : "Ouverte"}
                        </Badge>
                        {mission.shift && (
                          <Badge
                            variant="outline"
                            className={
                              mission.shift === "NUIT"
                                ? "border-indigo-400 text-indigo-600"
                                : "border-amber-400 text-amber-600"
                            }
                          >
                            {mission.shift === "NUIT" ? (
                              <Moon className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <Sun className="h-3 w-3 mr-1 inline" />
                            )}
                            {mission.shift === "NUIT" ? "Nuit" : "Jour"}
                          </Badge>
                        )}
                      </div>
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(mission.dateStart), "dd MMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(mission.dateStart), "HH:mm")} –{" "}
                            {format(new Date(mission.dateEnd), "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">
                            {mission.city
                              ? `${mission.city}${mission.zipCode ? ` (${mission.zipCode})` : ""}`
                              : mission.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold">{mission.hourlyRate}€ /h</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    Candidatures
                    <Badge variant="outline" className="ml-1">
                      {activeCandidacies.length}
                    </Badge>
                  </h3>

                  {activeCandidacies.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Aucune candidature pour le moment.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeCandidacies.map((booking: any) => (
                        <CandidateCard
                          key={booking.id}
                          bookingId={booking.id}
                          talent={booking.talent}
                          status={booking.status}
                          motivation={booking.motivation}
                          proposedRate={booking.proposedRate}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
