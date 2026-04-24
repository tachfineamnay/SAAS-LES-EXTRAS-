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
    GraduationCap,
    CreditCard,
    LifeBuoy,
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
    const nextMissionFreelance =
        nextMission?.bookings?.find((b) => b.status === "CONFIRMED" || b.status === "ASSIGNED")
            ? "Freelance assigné"
            : `${nextMission?.bookings?.filter((b) => b.status === "PENDING").length ?? 0} candidature(s)`;

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
                        href="/marketplace"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <Sparkles className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold">Réserver un atelier</span>
                    </Link>

                    {/* Formations */}
                    <Link
                        href="/marketplace"
                        className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                    >
                        <GraduationCap className="h-5 w-5 text-[hsl(var(--teal))]" aria-hidden="true" />
                        <span className="text-sm font-semibold">Formations</span>
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
                        href="mailto:support@les-extras.com"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Candidatures en attente */}
                    <DashboardWidget
                        icon={Users}
                        iconColor="coral"
                        title="Candidatures en attente"
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
                                    Gérer les candidatures →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Aucune candidature en attente.
                            </p>
                        )}
                    </DashboardWidget>

                    {/* Paiements à valider */}
                    <DashboardWidget
                        icon={DollarSign}
                        iconColor="amber"
                        title="Paiements à valider"
                        subtitle="Heures à confirmer"
                    >
                        <PaymentValidationWidget bookings={awaitingPaymentBookings} />
                    </DashboardWidget>

                    {/* Propositions reçues */}
                    <DashboardWidget
                        icon={FileText}
                        iconColor="teal"
                        title="Propositions reçues"
                        subtitle="Devis en attente"
                    >
                        <QuoteListWidget quotes={pendingQuotes} error={quotesError} />
                    </DashboardWidget>
                </div>
            </section>

            {/* KPI row */}
            <EstablishmentKpiGrid
                activeMissions={activeMissions.length}
                ongoingBookings={pendingCandidatures}
                availableCredits={availableCredits}
                averageRating={null}
                completedThisMonth={completedBookings.length}
            />

            {/* ── Zone 3 : Mes activités ── */}
            <section className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Mes activités
                </p>
                <BentoSection cols={3} gap="md">
                    {/* Mes réservations de renfort */}
                    <DashboardWidget
                        icon={Siren}
                        iconColor="coral"
                        title="Mes réservations de renfort"
                        subtitle="Missions en cours et ouvertes"
                        viewAllHref="/dashboard/renforts"
                        wide
                    >
                        <RenfortsWidget missions={activeMissions} error={missionsError} />
                    </DashboardWidget>

                    {/* Ateliers & Formations */}
                    <DashboardWidget
                        icon={GraduationCap}
                        iconColor="teal"
                        title="Ateliers & Formations"
                        subtitle="Réservations confirmées"
                        viewAllHref="/marketplace"
                    >
                        {confirmedServiceBookings.length > 0 ? (
                            <BookingListWidget
                                bookings={confirmedServiceBookings}
                                emptyMessage="Aucun atelier ou formation confirmé."
                                viewAllLink="/marketplace"
                                error={bookingsError}
                            />
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Aucun atelier ou formation en cours.
                                </p>
                                <Link
                                    href="/marketplace"
                                    className="block w-full text-center text-xs font-medium text-[hsl(var(--teal))] hover:underline"
                                >
                                    Explorer le catalogue →
                                </Link>
                            </div>
                        )}
                    </DashboardWidget>

                    {/* Agenda — missions confirmées */}
                    <DashboardWidget
                        icon={Calendar}
                        iconColor="teal"
                        title="Agenda"
                        subtitle="Missions confirmées à venir"
                        viewAllHref="/bookings"
                        wide
                    >
                        <BookingListWidget
                            bookings={confirmedMissionBookings}
                            emptyMessage="Aucune mission confirmée à venir."
                            viewAllLink="/bookings"
                            error={bookingsError}
                        />
                    </DashboardWidget>

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
                    >
                        <CreditsWidget credits={availableCredits} error={creditsError} />
                    </DashboardWidget>

                    {/* Mes Factures */}
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

                    {/* Fiche établissement */}
                    <DashboardWidget
                        icon={ShieldCheck}
                        iconColor="emerald"
                        title="Fiche établissement"
                    >
                        <EstablishmentChecklistWidget />
                    </DashboardWidget>

                    {/* Historique & Archives */}
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
            </section>
        </div>
    );
}
