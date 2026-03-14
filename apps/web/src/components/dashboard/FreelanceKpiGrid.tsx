"use client";

import { CheckCircle, DollarSign, Star, UserCheck } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface FreelanceKpiGridProps {
    completedThisMonth: number;
    revenueThisMonth: string;
    averageRating: number | null;
    profileCompletion: number;
}

export function FreelanceKpiGrid({
    completedThisMonth,
    revenueThisMonth,
    averageRating,
    profileCompletion,
}: FreelanceKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile label="Missions ce mois" value={completedThisMonth} icon={CheckCircle} iconColor="teal" />
            <KpiTile
                label="CA ce mois"
                value={revenueThisMonth}
                icon={DollarSign}
                iconColor="emerald"
                trend="up"
                trendLabel="+12%"
            />
            <KpiTile
                label="Note moyenne"
                value={averageRating != null ? `${averageRating.toFixed(1)}/5` : "–"}
                icon={Star}
                iconColor="amber"
            />
            <KpiTile
                label="Profil complété"
                value={`${profileCompletion}%`}
                icon={UserCheck}
                iconColor="coral"
            />
        </div>
    );
}
