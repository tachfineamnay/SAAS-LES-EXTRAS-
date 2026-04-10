import Link from "next/link";
import type { EstablishmentMission } from "@/app/actions/missions";
import type { SerializedQuote } from "@/actions/quotes";
import type { SerializedInvoice } from "@/actions/finance";
import type { BookingLine } from "@/app/actions/bookings";
import type { ReviewItem } from "./FreelanceDashboard";
import { BentoSection } from "@/components/layout/BentoSection";
import { EstablishmentKpiGrid } from "@/components/dashboard/EstablishmentKpiGrid";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { PaymentValidationWidget } from "@/components/dashboard/PaymentValidationWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/establishment/MissionsToValidateWidget";
import { EstablishmentInvoicesWidget } from "@/components/dashboard/establishment/EstablishmentInvoicesWidget";
import { RenfortsWidget } from "@/components/dashboard/establishment/RenfortsWidget";
import { PublishRenfortButton } from "@/components/dashboard/establishment/PublishRenfortButton";
import { EstablishmentChecklistWidget } from "@/components/dashboard/establishment/EstablishmentChecklistWidget";
import { NextMissionCard } from "@/components/dashboard/NextMissionCard";
import { RecentReviewsWidget } from "@/components/dashboard/RecentReviewsWidget";
import { DashboardWidget } from "./DashboardWidget";
import {
    DollarSign,
    Users,
    Briefcase,
    Calendar,
    FileText,
    ShieldCheck,
    Siren,
    Star,
    Sparkles,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getMissionPlanning, isMissionPlanningLineMultiDay } from "@/lib/mission-planning";

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
    confirmedBookings: BookingLine[];
    completedBookings: BookingLine[];
    bookingsError: string | null;
    nextMission: EstablishmentMission | null;
    recentReviews: ReviewItem[];
    recentReviewsError: string | null;
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
    confirmedBookings,
    completedBookings,
    bookingsError,
    nextMission,
    recentReviews,
    recentReviewsError,
}: EstablishmentDashboardProps) {
    // Build NextMissionCard data from the closest upcoming mission
    const nextMissionPlanning = nextMission ? getMissionPlanning(nextMission) : null;
    const nextMissionSlot = nextMissionPlanning?.nextSlot ?? nextMissionPlanning?.firstSlot ?? null;
    const nextMissionDate = nextMissionSlot?.start ?? null;
    const nextMissionDateDisplay =
        nextMissionDate && isValid(nextMissionDate)
            ? format(nextMissionDate, "EEEE d MMMM", { locale: fr })
            : "Date à confirmer";
    const nextMissionTimeRange = nextMissionSlot
        ? `${nextMissionSlot.heureDebut} – ${
            isMissionPlanningLineMultiDay(nextMissionSlot)
                ? `${format(nextMissionSlot.end, "d MMM", { locale: fr })} ${nextMissionSlot.heureFin}`
                : nextMissionSlot.heureFin
        }`
        : undefined;
    const nextMissionFreelance =
        nextMission?.bookings?.find((b) => b.status === "CONFIRMED" || b.status === "ASSIGNED")
            ? "Freelance assigné"
            : `${nextMission?.bookings?.filter((b) => b.status === "PENDING").length ?? 0} candidature(s)`;

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
                <div className="flex items-center gap-3">
                    <Link href="/marketplace">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--teal))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Explorer les ateliers
                        </span>
                    </Link>
                    <PublishRenfortButton label="Publier un renfort" />
                </div>
            </header>

            {/* Next mission (elevated card) */}
            {nextMission && (
                <NextMissionCard
                    detailsHref="/dashboard/renforts"
                    title={nextMission.metierLabel ?? nextMission.title}
                    establishment={nextMissionFreelance}
                    city={nextMission.city ?? nextMission.address ?? ""}
                    scheduledAt={nextMissionDate?.toISOString() ?? nextMission.dateStart}
                    dateDisplay={nextMissionDateDisplay}
                    timeRange={nextMissionTimeRange}
                />
            )}

            {/* Alert zone */}
            <MissionsToValidateWidget bookings={awaitingPaymentBookings} />

            {/* KPI row */}
            <EstablishmentKpiGrid
                activeMissions={activeMissions.length}
                ongoingBookings={pendingCandidatures}
                availableCredits={availableCredits}
                averageRating={null}
                completedThisMonth={completedBookings.length}
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

                {/* Profil & Complétude */}
                <DashboardWidget
                    icon={ShieldCheck}
                    iconColor="emerald"
                    title="Profil & Complétude"
                >
                    <EstablishmentChecklistWidget />
                </DashboardWidget>

                {/* Agenda — confirmed bookings */}
                <DashboardWidget
                    icon={Calendar}
                    iconColor="teal"
                    title="Agenda"
                    subtitle="Missions confirmées à venir"
                    viewAllHref="/bookings"
                    wide
                >
                    <BookingListWidget
                        bookings={confirmedBookings}
                        emptyMessage="Aucune mission confirmée à venir."
                        viewAllLink="/bookings"
                        error={bookingsError}
                    />
                </DashboardWidget>

                {/* Recent reviews */}
                <DashboardWidget
                    icon={Star}
                    iconColor="amber"
                    title="Avis des freelances"
                >
                    <RecentReviewsWidget
                        reviews={recentReviews}
                        error={recentReviewsError}
                    />
                </DashboardWidget>

                {/* Credits */}
                <DashboardWidget
                    icon={DollarSign}
                    iconColor="emerald"
                    title="Mes Crédits"
                    subtitle="Solde de recrutement"
                    viewAllHref="/dashboard/packs"
                >
                    <CreditsWidget credits={availableCredits} />
                </DashboardWidget>

                {/* Payment validation */}
                {awaitingPaymentBookings.length > 0 && (
                    <DashboardWidget
                        icon={DollarSign}
                        iconColor="amber"
                        title="Paiements à valider"
                        subtitle="Heures à confirmer"
                        wide
                    >
                        <PaymentValidationWidget bookings={awaitingPaymentBookings} />
                    </DashboardWidget>
                )}

                {/* Invoices */}
                <DashboardWidget
                    icon={FileText}
                    iconColor="gray"
                    title="Mes Factures"
                    subtitle="Historique de facturation"
                    viewAllHref="/finance"
                    wide
                >
                    <EstablishmentInvoicesWidget invoices={invoices} error={invoicesError} />
                </DashboardWidget>

                {/* Quotes */}
                <DashboardWidget
                    icon={FileText}
                    iconColor="teal"
                    title="Propositions"
                    subtitle="Devis en attente"
                >
                    <QuoteListWidget quotes={pendingQuotes} error={quotesError} />
                </DashboardWidget>

                {/* Candidatures */}
                <DashboardWidget
                    icon={Users}
                    iconColor="coral"
                    title="Candidatures"
                    subtitle="En attente de décision"
                    viewAllHref="/dashboard/renforts"
                >
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
                    subtitle="Missions terminées"
                    viewAllHref="/bookings"
                    wide
                >
                    <BookingListWidget
                        bookings={completedBookings}
                        emptyMessage="Aucune mission archivée."
                        viewAllLink="/bookings"
                        error={bookingsError}
                    />
                </DashboardWidget>
            </BentoSection>
        </div>
    );
}
