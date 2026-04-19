"use client";

import { BookOpen, CheckCircle, Inbox, Star } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface FreelanceKpiGridProps {
    completedMissionsThisMonth: number;
    activeServices: number;
    openDeskRequests: number;
    averageRating: number | null;
}

export function FreelanceKpiGrid({
    completedMissionsThisMonth,
    activeServices,
    openDeskRequests,
    averageRating,
}: FreelanceKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile
                label="Missions ce mois"
                value={completedMissionsThisMonth}
                icon={CheckCircle}
                iconColor="teal"
            />
            <KpiTile
                label="Services actifs"
                value={activeServices}
                icon={BookOpen}
                iconColor="emerald"
            />
            <KpiTile
                label="Demandes ouvertes"
                value={openDeskRequests}
                icon={Inbox}
                iconColor="coral"
            />
            <KpiTile
                label="Note moyenne"
                value={averageRating != null ? `${averageRating.toFixed(1)}/5` : "–"}
                icon={Star}
                iconColor="amber"
            />
        </div>
    );
}
