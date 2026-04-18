"use client";

import { Briefcase, Calendar, DollarSign, Star } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface EstablishmentKpiGridProps {
    activeMissions: number;
    ongoingBookings: number;
    availableCredits: number | null;
    averageRating: number | null;
    completedThisMonth?: number;
}

export function EstablishmentKpiGrid({
    activeMissions,
    ongoingBookings,
    availableCredits,
    averageRating,
    completedThisMonth,
}: EstablishmentKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile
                label="Missions actives"
                value={activeMissions}
                icon={Briefcase}
                iconColor="teal"
                index={0}
            />
            <KpiTile
                label="Demandes en attente"
                value={ongoingBookings}
                icon={Calendar}
                iconColor="coral"
                trend={ongoingBookings > 0 ? "up" : undefined}
                trendLabel={ongoingBookings > 0 ? `${ongoingBookings} nouvelle${ongoingBookings > 1 ? "s" : ""}` : undefined}
                index={1}
            />
            <KpiTile
                label="Crédits disponibles"
                value={availableCredits ?? "—"}
                icon={DollarSign}
                iconColor="emerald"
                index={2}
            />
            <KpiTile
                label="Note moyenne"
                value={averageRating != null ? `${averageRating.toFixed(1)}/5` : "–"}
                icon={Star}
                iconColor="amber"
                index={3}
            />
        </div>
    );
}
