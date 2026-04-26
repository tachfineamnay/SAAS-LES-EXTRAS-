import Link from "next/link";
import type { EstablishmentMission } from "@/app/actions/missions";
import type { SerializedQuote } from "@/actions/quotes";
import type { SerializedInvoice } from "@/actions/finance";
import type { BookingLine } from "@/app/actions/bookings";
import type { MyDeskRequest } from "@/app/actions/desk";
import type { ReviewItem } from "./FreelanceDashboard";
import { BentoItem, BentoSection } from "@/components/layout/BentoSection";
import { EstablishmentKpiGrid } from "@/components/dashboard/EstablishmentKpiGrid";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/establishment/MissionsToValidateWidget";
import { EstablishmentInvoicesWidget } from "@/components/dashboard/establishment/EstablishmentInvoicesWidget";
import { RenfortsWidget } from "@/components/dashboard/establishment/RenfortsWidget";
import { PublishRenfortButton } from "@/components/dashboard/establishment/PublishRenfortButton";
import { EstablishmentChecklistWidget } from "@/components/dashboard/establishment/EstablishmentChecklistWidget";
import { NextMissionCard } from "@/components/dashboard/NextMissionCard";
import { RecentReviewsWidget } from "@/components/dashboard/RecentReviewsWidget";
import { DashboardWidget } from "./DashboardWidget";
import {
    Users,
    Briefcase,
    Calendar,
    FileText,
    ShieldCheck,
    Siren,
    Star,
    Sparkles,
    GraduationCap,
    CreditCard,
    LifeBuoy,
    Inbox,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getMissionPlanning, isMissionPlanningLineMultiDay } from "@/lib/mission-planning";
import { getMissionDisplayTitle } from "@/lib/mission-display";

export interface EstablishmentDashboardProps {
    activeMissions: EstablishmentMission[];
    missionsError: string | null;
    pendingQuotes: SerializedQuote[];
    quotesError: string | null;
    invoices: SerializedInvoice[];
    invoicesError: string | null;
    availableCredits: number | null;
    creditsError: string | null;
    pendingCandidatures: number;
    awaitingPaymentBookings: BookingLine[];
    confirmedBookings: BookingLine[];
    completedBookings: BookingLine[];
    bookingsError: string | null;
    nextMission: EstablishmentMission | null;
    recentReviews: ReviewItem[];
    recentReviewsError: string | null;
    openDeskRequests: MyDeskRequest[];
    deskRequestsError: string | null;
    renfortsToFill: number;
    upcomingInterventions: number;
}

export function EstablishmentDashboard({
    activeMissions,
    missionsError,
    pendingQuotes,
    quotesError,
    invoices,
    invoicesError,
    availableCredits,
    creditsError,
    pendingCandidatures,
    awaitingPaymentBookings,
    confirmedBookings,
    completedBookings,
    bookingsError,
    nextMission,
    recentReviews,
    recentReviewsError,
    openDeskRequests,
    deskRequestsError,
    renfortsToFill,
    upcomingInterventions,
}: EstablishmentDashboardProps) {
    const confirmedMissionBookings = confirmedBookings.filter((b) => b.lineType === "MISSION");
    const confirmedServiceBookings = confirmedBookings.filter((b) => b.lineType === "SERVICE_BOOKING");

    // Compute NextMissionCard display data
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
    const nextMissionHasAssignedFreelance =
        nextMission?.status === "ASSIGNED" ||
        nextMission?.bookings?.some((b) => b.status === "CONFIRMED" || b.status === "ASSIGNED");
    const nextMissionFreelance = nextMissionHasAssignedFreelance
        ? "Freelance assigné"
        : "Intervention assignée";
    const showPendingQuotes = pendingQuotes.length > 0 || Boolean(quotesError);

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="space-y-1.5">
                <p className="text-overline uppercase tracking-widest text-muted-foreground">
                    Espace Établissement
                </p>
                <h1 className="font-display text-heading-xl tracking-tight">
                    Tableau de bord
                </h1>
                <p className="text-body-md text-muted-foreground">
                    Pilotez vos renforts, ateliers, formations et le suivi de votre établissement.
                </p>
            </header>

            {/* ── Zone 1 : Actions immédiates ── */}
            <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Actions immédiates
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Publier un renfort — overlay invisible sur la card */}
                    <div className="relative flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--coral))/40] bg-[hsl(var(--coral))/8] p-4 hover:bg-[hsl(var(--coral))/14] transition-colors overflow-hidden cursor-pointer">
                        <Siren className="h-5 w-5 text-[hsl(var(--coral))] pointer-events-none" aria-hidden="true" />
                        <span className="text-sm font-semibold pointer-events-none">
                            Publier un renfort
                        </span>
                        <PublishRenfortButton
                            label="Publier un renfort"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Réserver un atelier */}
                    <Link
                        href="/marketplace?tab=workshops"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <Sparkles className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold">Réserver un atelier</span>
                    </Link>

                    {/* Formations */}
                    <Link
                        href="/marketplace?tab=trainings"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <GraduationCap className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold leading-snug">
                            Réserver une formation pour vos équipes
                        </span>
                    </Link>

                    {/* Gérer mes crédits */}
                    <Link
                        href="/dashboard/packs"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <CreditCard className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold">Gérer mes crédits</span>
                    </Link>

                    {/* Signaler un problème */}
                    <Link
                        href="/dashboard/demandes"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <LifeBuoy className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold">Signaler un problème</span>
                    </Link>
                </div>
            </section>

            {/* ── Zone 2 : À traiter ── */}
            <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    À traiter
                </p>
                {/* Alerte missions à valider */}
                <MissionsToValidateWidget bookings={awaitingPaymentBookings} />

                {/* Prochaine mission (full-width si présente) */}
                {nextMission && (
                    <NextMissionCard
                        detailsHref="/dashboard/renforts"
                        title={getMissionDisplayTitle(nextMission)}
                        establishment={nextMissionFreelance}
                        city={nextMission.city ?? nextMission.address ?? ""}
                        scheduledAt={nextMissionDate?.toISOString() ?? nextMission.dateStart}
                        dateDisplay={nextMissionDateDisplay}
                        timeRange={nextMissionTimeRange}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Candidatures en attente */}
                    <DashboardWidget
                        icon={Users}
                        iconColor="coral"
                        title="Candidatures en attente"
                        subtitle="En attente de décision"
                        viewAllHref="/dashboard/renforts"
                        viewAllLabel="Voir toutes les candidatures en attente"
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
                                    Gérer les candidatures →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucune candidature en attente.
                            </p>
                        )}
                    </DashboardWidget>

                    {/* TODO(Sprint finance): réintroduire un flux paiement distinct quand le cycle métier sera clarifié. */}
                    {showPendingQuotes && (
                        <DashboardWidget
                            icon={FileText}
                            iconColor="teal"
                            title="Propositions reçues"
                            subtitle="Devis en attente"
                        >
                            <QuoteListWidget quotes={pendingQuotes} error={quotesError} />
                        </DashboardWidget>
                    )}

                    {/* Demandes Desk ouvertes */}
                    <DashboardWidget
                        icon={Inbox}
                        iconColor="teal"
                        title="Demandes Desk ouvertes"
                        subtitle="Signalements et tickets"
                        viewAllHref="/dashboard/demandes"
                        viewAllLabel="Voir toutes les demandes Desk ouvertes"
                    >
                        {deskRequestsError ? (
                            <p className="text-sm text-muted-foreground">{deskRequestsError}</p>
                        ) : openDeskRequests.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-3xl font-bold text-[hsl(var(--teal))]">
                                    {openDeskRequests.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    demande{openDeskRequests.length > 1 ? "s" : ""} en cours de
                                    traitement par Le Desk
                                </p>
                                <Link
                                    href="/dashboard/demandes"
                                    className="block w-full text-center text-xs font-medium text-[hsl(var(--teal))] hover:underline"
                                >
                                    Suivre mes demandes →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucun ticket ouvert.
                            </p>
                        )}
                    </DashboardWidget>
                </div>
            </section>

            {/* KPI row */}
            <EstablishmentKpiGrid
                renfortsToFill={renfortsToFill}
                pendingApplications={pendingCandidatures}
                upcomingInterventions={upcomingInterventions}
                availableCredits={availableCredits}
            />

            {/* ── Zone 3 : Mes activités ── */}
            <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Mes activités
                </p>
                <BentoSection cols={3} gap="md">
                    {/* Mes réservations de renfort */}
                    <BentoItem span={2}>
                        <DashboardWidget
                            icon={Siren}
                            iconColor="coral"
                            title="Mes réservations de renfort"
                            subtitle="Missions en cours et ouvertes"
                            viewAllHref="/dashboard/renforts"
                            viewAllLabel="Voir toutes mes réservations de renfort"
                        >
                            <RenfortsWidget missions={activeMissions} error={missionsError} />
                        </DashboardWidget>
                    </BentoItem>

                    {/* Ateliers & Formations */}
                    <DashboardWidget
                        icon={GraduationCap}
                        iconColor="teal"
                        title="Ateliers & Formations"
                        subtitle="Réservations confirmées"
                        viewAllHref="/marketplace?tab=trainings"
                        viewAllLabel="Voir tous les ateliers et formations"
                    >
                        {confirmedServiceBookings.length > 0 ? (
                            <BookingListWidget
                                bookings={confirmedServiceBookings}
                                emptyMessage="Aucun atelier ou formation confirmé."
                                viewAllLink="/marketplace"
                                viewAllLabel="Voir tous les ateliers et formations"
                                error={bookingsError}
                            />
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Aucun atelier ou formation en cours.
                                </p>
                                <Link
                                    href="/marketplace?tab=trainings"
                                    className="block w-full text-center text-xs font-medium text-[hsl(var(--teal))] hover:underline"
                                >
                                    Explorer le catalogue →
                                </Link>
                            </div>
                        )}
                    </DashboardWidget>

                    {/* Agenda — missions confirmées */}
                    <BentoItem span={2}>
                        <DashboardWidget
                            icon={Calendar}
                            iconColor="teal"
                            title="Agenda"
                            subtitle="Missions confirmées à venir"
                            viewAllHref="/bookings"
                            viewAllLabel="Voir tout mon agenda"
                        >
                            <BookingListWidget
                                bookings={confirmedMissionBookings}
                                emptyMessage="Aucune mission confirmée à venir."
                                viewAllLink="/bookings"
                                viewAllLabel="Voir tout mon agenda"
                                error={bookingsError}
                            />
                        </DashboardWidget>
                    </BentoItem>

                    {/* Avis des freelances */}
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

                    {/* Mes Crédits */}
                    <DashboardWidget
                        icon={CreditCard}
                        iconColor="emerald"
                        title="Mes Crédits"
                        subtitle="Solde renforts et services"
                        viewAllHref="/dashboard/packs"
                        viewAllLabel="Voir tous mes crédits"
                    >
                        <CreditsWidget credits={availableCredits} error={creditsError} />
                    </DashboardWidget>

                    {/* Mes Factures */}
                    <BentoItem span={2}>
                        <DashboardWidget
                            icon={FileText}
                            iconColor="gray"
                            title="Mes Factures"
                            subtitle="Historique de facturation"
                            viewAllHref="/finance"
                            viewAllLabel="Voir toutes mes factures"
                        >
                            <EstablishmentInvoicesWidget invoices={invoices} error={invoicesError} />
                        </DashboardWidget>
                    </BentoItem>

                    {/* Fiche établissement */}
                    <DashboardWidget
                        icon={ShieldCheck}
                        iconColor="emerald"
                        title="Fiche établissement"
                    >
                        <EstablishmentChecklistWidget />
                    </DashboardWidget>

                    {/* Historique & Archives */}
                    <BentoItem span={2}>
                        <DashboardWidget
                            icon={Briefcase}
                            iconColor="gray"
                            title="Historique & Archives"
                            subtitle="Missions terminées"
                            viewAllHref="/bookings"
                            viewAllLabel="Voir tout mon historique et mes archives"
                        >
                            <BookingListWidget
                                bookings={completedBookings}
                                emptyMessage="Aucune mission archivée."
                                viewAllLink="/bookings"
                                viewAllLabel="Voir tout mon historique et mes archives"
                                error={bookingsError}
                            />
                        </DashboardWidget>
                    </BentoItem>
                </BentoSection>
            </section>
        </div>
    );
}
