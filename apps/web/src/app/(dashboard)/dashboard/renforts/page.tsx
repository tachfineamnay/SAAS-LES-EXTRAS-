import { getEstablishmentMissions } from "@/app/actions/missions";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/dashboard/establishment/CandidateCard";
import { PublishRenfortButton } from "@/components/dashboard/establishment/PublishRenfortButton";
import { RenfortsEmptyState } from "@/components/dashboard/establishment/RenfortsEmptyState";
import { Calendar, Clock, MapPin, Sun, Moon, Siren } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMetierLabel } from "@/lib/sos-config";

export const dynamic = "force-dynamic";

export default async function SosDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ESTABLISHMENT") {
    redirect("/login");
  }

  const missions = await getEstablishmentMissions();

  const openMissions = missions.filter(
    (m) => m.status === "OPEN" || m.status === "ASSIGNED",
  );

  // Sort: missions with most candidates first
  openMissions.sort((a, b) => b.bookings.length - a.bookings.length);

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Établissement</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-heading-xl tracking-tight">Board de matching</h1>
            <p className="text-body-md text-muted-foreground">
              Gérez vos missions de renfort et validez les candidatures des freelances.
            </p>
          </div>
          <PublishRenfortButton label="Nouveau renfort" size="sm" />
        </div>
      </header>

      <div className="grid gap-6">
        {openMissions.length === 0 ? (
          <RenfortsEmptyState />
        ) : (
          openMissions.map((mission: any) => {
            const activeCandidacies = mission.bookings.filter(
              (b: any) => b.status !== "CANCELLED",
            );
            return (
              <GlassCard key={mission.id} className="overflow-hidden">
                <GlassCardHeader className="border-b border-border/40">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-heading-sm font-display">
                          {mission.metier
                            ? getMetierLabel(mission.metier)
                            : mission.title}
                        </h2>
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
                </GlassCardHeader>

                <GlassCardContent className="pt-6">
                  <h3 className="text-heading-xs font-semibold mb-4 flex items-center gap-2">
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
                          freelance={booking.freelance}
                          status={booking.status}
                          motivation={booking.message}
                          proposedRate={booking.proposedRate}
                        />
                      ))}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
