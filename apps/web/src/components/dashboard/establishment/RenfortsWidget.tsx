"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Users, MapPin, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { EstablishmentMission } from "@/app/actions/missions";
import { getMissionPlanning } from "@/lib/mission-planning";

interface RenfortsWidgetProps {
    missions: EstablishmentMission[];
    error?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
    OPEN: "Ouverte",
    ASSIGNED: "Attribuée",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    OPEN: "secondary",
    ASSIGNED: "default",
    COMPLETED: "outline",
    CANCELLED: "destructive",
};

export function RenfortsWidget({ missions, error }: RenfortsWidgetProps) {
    if (error) {
        return (
            <EmptyState
                icon={Users}
                title="Renforts indisponibles"
                description={error}
                className="py-8"
            />
        );
    }

    if (missions.length === 0) {
        return (
            <EmptyState
                icon={Users}
                title="Aucun renfort actif"
                description="Publiez votre premier renfort pour recevoir des candidatures."
                className="py-8"
            />
        );
    }

    return (
        <div className="space-y-3">
            {missions.slice(0, 5).map((mission) => {
                const candidatureCount = mission.bookings?.length ?? 0;
                const pendingCount = mission.bookings?.filter(
                    (b) => b.status === "PENDING"
                ).length ?? 0;
                const planning = getMissionPlanning(mission);

                return (
                    <Link
                        key={mission.id}
                        href="/dashboard/renforts"
                        className="block rounded-xl border border-border/60 p-4 hover:border-border hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-sm truncate">
                                        {mission.metierLabel ?? mission.title}
                                    </span>
                                    <Badge variant={STATUS_VARIANT[mission.status] ?? "secondary"}>
                                        {STATUS_LABEL[mission.status] ?? mission.status}
                                    </Badge>
                                    {mission.shift && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "gap-1 text-xs",
                                                mission.shift === "NUIT"
                                                    ? "border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))]"
                                                    : "border-[hsl(var(--amber)/0.5)] text-[hsl(var(--amber))]"
                                            )}
                                        >
                                            {mission.shift === "NUIT" ? (
                                                <Moon className="h-3 w-3" />
                                            ) : (
                                                <Sun className="h-3 w-3" />
                                            )}
                                            {mission.shift === "NUIT" ? "Nuit" : "Jour"}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    {planning.visibleSlots.map((slot) => (
                                        <span key={slot.key} className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(slot.start, "dd MMM", { locale: fr })} · {slot.heureDebut} – {slot.heureFin}
                                        </span>
                                    ))}
                                    {planning.extraCount > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            +{planning.extraCount} créneau(x)
                                        </span>
                                    )}
                                    {mission.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {mission.city}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 text-right space-y-1">
                                <p className="font-bold text-sm">{mission.hourlyRate} €/h</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                    <Users className="h-3 w-3" />
                                    <span>
                                        {pendingCount > 0 ? (
                                            <span className="text-[hsl(var(--coral))] font-semibold">
                                                {pendingCount} en attente
                                            </span>
                                        ) : (
                                            `${candidatureCount} candidature${candidatureCount !== 1 ? "s" : ""}`
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
            {missions.length > 5 && (
                <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/dashboard/renforts">
                        Voir tous les renforts ({missions.length})
                    </Link>
                </Button>
            )}
        </div>
    );
}
