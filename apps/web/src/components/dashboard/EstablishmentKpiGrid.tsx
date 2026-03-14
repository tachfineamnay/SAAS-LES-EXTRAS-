"use client";

import { Briefcase, Calendar, DollarSign, Star } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface EstablishmentKpiGridProps {
    activeMissions: number;
    ongoingBookings: number;
    availableCredits: number;
    averageRating: number | null;
}

export function EstablishmentKpiGrid({
    activeMissions,
    ongoingBookings,
    availableCredits,
    averageRating,
}: EstablishmentKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile label="Missions actives" value={activeMissions} icon={Briefcase} iconColor="teal" />
            <KpiTile label="Réservations en cours" value={ongoingBookings} icon={Calendar} iconColor="coral" />
            <KpiTile label="Crédits disponibles" value={availableCredits} icon={DollarSign} iconColor="emerald" />
            <KpiTile
                label="Note moyenne"
                value={averageRating != null ? `${averageRating.toFixed(1)}/5` : "–"}
                icon={Star}
                iconColor="amber"
            />
        </div>
    );
}
