import Link from "next/link";
import type { EstablishmentMission } from "@/app/actions/missions";
import type { SerializedQuote } from "@/actions/quotes";
import type { SerializedInvoice } from "@/actions/finance";
import type { BookingLine } from "@/app/actions/bookings";
import { BentoSection } from "@/components/layout/BentoSection";
import { EstablishmentKpiGrid } from "@/components/dashboard/EstablishmentKpiGrid";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { PaymentValidationWidget } from "@/components/dashboard/PaymentValidationWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/establishment/MissionsToValidateWidget";
import { EstablishmentInvoicesWidget } from "@/components/dashboard/establishment/EstablishmentInvoicesWidget";
import { EstablishmentArchivesWidget } from "@/components/dashboard/establishment/EstablishmentArchivesWidget";
import { RenfortsWidget } from "@/components/dashboard/establishment/RenfortsWidget";
import { PublishRenfortButton } from "@/components/dashboard/establishment/PublishRenfortButton";
import { DashboardWidget } from "./DashboardWidget";
import {
    DollarSign,
    Users,
    Briefcase,
    FileText,
    Siren,
} from "lucide-react";

export interface EstablishmentDashboardProps {
    activeMissions: EstablishmentMission[];
    missionsError: string | null;
    pendingQuotes: SerializedQuote[];
    quotesError: string | null;
    invoices: SerializedInvoice[];
    invoicesError: string | null;
    availableCredits: number;
    pendingCandidatures: number;
    awaitingPaymentBookings: BookingLine[];
    completedBookings: BookingLine[];
}

export function EstablishmentDashboard({
    activeMissions,
    missionsError,
    pendingQuotes,
    quotesError,
    invoices,
    invoicesError,
    availableCredits,
    pendingCandidatures,
    awaitingPaymentBookings,
    completedBookings,
}: EstablishmentDashboardProps) {
    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">
                        Espace Établissement
                    </p>
                    <h1 className="font-display text-heading-xl tracking-tight">
                        Tableau de bord
                    </h1>
                    <p className="text-body-md text-muted-foreground">
                        Vue d&apos;ensemble de vos renforts et opérations.
                    </p>
                </div>
                <PublishRenfortButton label="Publier un renfort" />
            </header>

            {/* Alert zone */}
            <MissionsToValidateWidget bookings={awaitingPaymentBookings} />

            {/* KPI row */}
            <EstablishmentKpiGrid
                activeMissions={activeMissions.length}
                ongoingBookings={pendingCandidatures}
                availableCredits={availableCredits}
                averageRating={null}
            />

            {/* Main bento */}
            <BentoSection cols={3} gap="md">
                {/* Renforts actifs */}
                <DashboardWidget
                    icon={Siren}
                    iconColor="coral"
                    title="Mes renforts"
                    subtitle="Missions en cours et ouvertes"
                    viewAllHref="/dashboard/renforts"
                    wide
                >
                    <RenfortsWidget missions={activeMissions} error={missionsError} />
                </DashboardWidget>

                {/* Credits */}
                <DashboardWidget icon={DollarSign} iconColor="emerald" title="Mes Crédits">
                    <CreditsWidget credits={availableCredits} />
                </DashboardWidget>

                {/* Payment validation */}
                {awaitingPaymentBookings.length > 0 && (
                    <DashboardWidget
                        icon={DollarSign}
                        iconColor="amber"
                        title="Paiements à valider"
                        wide
                    >
                        <PaymentValidationWidget bookings={awaitingPaymentBookings} />
                    </DashboardWidget>
                )}

                {/* Invoices */}
                <DashboardWidget icon={FileText} iconColor="gray" title="Mes Factures" wide>
                    <EstablishmentInvoicesWidget invoices={invoices} error={invoicesError} />
                </DashboardWidget>

                {/* Quotes */}
                <DashboardWidget icon={FileText} iconColor="teal" title="Propositions">
                    <QuoteListWidget quotes={pendingQuotes} error={quotesError} />
                </DashboardWidget>

                {/* Candidatures */}
                <DashboardWidget icon={Users} iconColor="coral" title="Candidatures">
                    {pendingCandidatures > 0 ? (
                        <div className="space-y-3">
                            <p className="text-3xl font-bold text-[hsl(var(--coral))]">
                                {pendingCandidatures}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                candidature{pendingCandidatures > 1 ? "s" : ""} en attente de
                                votre décision
                            </p>
                            <Link
                                href="/dashboard/renforts"
                                className="block w-full text-center text-xs font-medium text-[hsl(var(--teal))] hover:underline"
                            >
                                Voir le board de matching →
                            </Link>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Aucune candidature en attente.
                        </p>
                    )}
                </DashboardWidget>

                {/* Archives */}
                <DashboardWidget
                    icon={Briefcase}
                    iconColor="gray"
                    title="Historique & Archives"
                    wide
                >
                    <EstablishmentArchivesWidget bookings={completedBookings} />
                </DashboardWidget>
            </BentoSection>
        </div>
    );
}
