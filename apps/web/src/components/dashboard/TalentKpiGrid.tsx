"use client";

import { Briefcase, Calendar, CheckCircle, DollarSign } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface TalentKpiGridProps {
    confirmedCount: number;
    completedCount: number;
    pendingCount: number;
}

export function TalentKpiGrid({
    confirmedCount,
    completedCount,
    pendingCount,
}: TalentKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile label="Missions à venir" value={confirmedCount} icon={Calendar} iconColor="gray" />
            <KpiTile
                label="Gains cumulés"
                value="850 €"
                icon={DollarSign}
                iconColor="emerald"
                trend="up"
                trendLabel="+12% ce mois"
            />
            <KpiTile label="Missions réalisées" value={completedCount} icon={CheckCircle} iconColor="teal" />
            <KpiTile label="Candidatures" value={pendingCount} icon={Briefcase} iconColor="amber" />
        </div>
    );
}
