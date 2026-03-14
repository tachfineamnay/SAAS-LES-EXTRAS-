"use client";

import { Briefcase, DollarSign, FileText, TrendingUp } from "lucide-react";
import { KpiTile } from "./KpiTile";

interface EstablishmentKpiGridProps {
    confirmedCount: number;
    awaitingPaymentCount: number;
    availableCredits: number;
    pendingQuotesCount: number;
}

export function EstablishmentKpiGrid({
    confirmedCount,
    awaitingPaymentCount,
    availableCredits,
    pendingQuotesCount,
}: EstablishmentKpiGridProps) {
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiTile label="Renforts actifs" value={confirmedCount} icon={Briefcase} iconColor="gray" />
            <KpiTile label="En attente paiement" value={awaitingPaymentCount} icon={DollarSign} iconColor="amber" />
            <KpiTile label="Crédits disponibles" value={availableCredits} icon={TrendingUp} iconColor="emerald" />
            <KpiTile label="Propositions reçues" value={pendingQuotesCount} icon={FileText} iconColor="teal" />
        </div>
    );
}
