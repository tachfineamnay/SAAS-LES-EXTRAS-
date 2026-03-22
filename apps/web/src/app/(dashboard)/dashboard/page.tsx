import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import type { BookingsPageData } from "@/app/actions/bookings";
import { getQuotes } from "@/actions/quotes";
import type { SerializedQuote } from "@/actions/quotes";
import { getInvoices } from "@/actions/finance";
import type { SerializedInvoice } from "@/actions/finance";
import { getCredits } from "@/actions/credits";
import { getReviewsByTarget } from "@/app/actions/reviews";
import { getEstablishmentMissions, getAvailableMissions } from "@/app/actions/missions";
import type { EstablishmentMission } from "@/app/actions/missions";
import { fetchSafe } from "@/lib/widget-result";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getMetierLabel } from "@/lib/sos-config";
import type { MatchingMission } from "@/components/dashboard/MatchingMissionsWidget";
import { BentoSection } from "@/components/layout/BentoSection";
import { EstablishmentKpiGrid } from "@/components/dashboard/EstablishmentKpiGrid";
import { FreelanceKpiGrid } from "@/components/dashboard/FreelanceKpiGrid";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { TrustChecklistWidget } from "@/components/dashboard/TrustChecklistWidget";
import { QuoteCreationModal } from "@/components/dashboard/QuoteCreationModal";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { PaymentValidationWidget } from "@/components/dashboard/PaymentValidationWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/establishment/MissionsToValidateWidget";
import { UpcomingMissionsWidget } from "@/components/dashboard/establishment/UpcomingMissionsWidget";
import { EstablishmentInvoicesWidget } from "@/components/dashboard/establishment/EstablishmentInvoicesWidget";
import { EstablishmentArchivesWidget } from "@/components/dashboard/establishment/EstablishmentArchivesWidget";
import { RenfortsWidget } from "@/components/dashboard/establishment/RenfortsWidget";
import { PublishRenfortButton } from "@/components/dashboard/establishment/PublishRenfortButton";
import { NextMissionCard } from "@/components/dashboard/NextMissionCard";
import { MatchingMissionsWidget } from "@/components/dashboard/MatchingMissionsWidget";
import { RecentReviewsWidget } from "@/components/dashboard/RecentReviewsWidget";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    Calendar,
    Users,
    Briefcase,
    FileText,
    ShieldCheck,
    TrendingUp,
    Star,
    Sparkles,
    Siren,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const { role: userRole } = session.user;
    const { token } = session;

    let availableCredits = 0;
    if (userRole === "ESTABLISHMENT") {
        try { availableCredits = await getCredits(); } catch { /* swallow */ }
    }

    const bookingsResult = await fetchSafe<BookingsPageData>(
        () => getBookingsPageData(token),
        { lines: [], nextStep: null },
        "Réservations",
    );
    const bookingsData = bookingsResult.data;
    const bookingsError = bookingsResult.error;

    let establishmentMissions: EstablishmentMission[] = [];
    let missionsError: string | null = null;
    if (userRole === "ESTABLISHMENT") {
        const missionsResult = await fetchSafe<EstablishmentMission[]>(
            () => getEstablishmentMissions(),
            [],
            "Renforts",
        );
        establishmentMissions = missionsResult.data;
        missionsError = missionsResult.error;
    }

    let quotes: SerializedQuote[] = [];
    let quotesError: string | null = null;
    if (userRole === "ESTABLISHMENT") {
        const quotesResult = await fetchSafe<SerializedQuote[]>(
            () => getQuotes(token),
            [],
            "Propositions",
        );
        quotes = quotesResult.data;
        quotesError = quotesResult.error;
    }

    const invoicesResult = await fetchSafe<SerializedInvoice[]>(
        () => getInvoices(),
        [],
        "Factures",
    );
    const invoices = invoicesResult.data;
    const invoicesError = invoicesResult.error;

    const pendingBookings = (bookingsData?.lines ?? []).filter((b) => b.status === "PENDING");
    const confirmedBookings = (bookingsData?.lines ?? []).filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED"
    );
    const completedBookings = (bookingsData?.lines ?? []).filter(
        (b) => b.status === "COMPLETED" || b.status === "PAID"
    );

    // ─────────────────────────────────────────────────────────────────
    // ESTABLISHMENT VIEW
    // ─────────────────────────────────────────────────────────────────
    if (userRole === "ESTABLISHMENT") {
        const pendingQuotes = quotes.filter((q) => q.status === "PENDING");
        const awaitingPaymentBookings = (bookingsData?.lines ?? []).filter(
            (b) => b.status === "COMPLETED_AWAITING_PAYMENT"
        );
        const missionsToValidate = (bookingsData?.lines ?? []).filter(
            (b) => b.status === "COMPLETED_AWAITING_PAYMENT"
        );
        const upcomingMissions = confirmedBookings;

        const activeMissions = establishmentMissions.filter(
            (m) => m.status === "OPEN" || m.status === "ASSIGNED"
        );
        const pendingCandidatures = establishmentMissions.reduce(
            (acc, m) => acc + (m.bookings?.filter((b) => b.status === "PENDING").length ?? 0),
            0
        );

        return (
            <div className="space-y-8">
                {/* Page header */}
                <header className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Établissement</p>
                        <h1 className="font-display text-heading-xl tracking-tight">Tableau de bord</h1>
                        <p className="text-body-md text-muted-foreground">Vue d&apos;ensemble de vos renforts et opérations.</p>
                    </div>
                    <PublishRenfortButton label="Publier un renfort" />
                </header>

                {/* Alert zone */}
                <MissionsToValidateWidget bookings={missionsToValidate} />

                {/* KPI row */}
                <EstablishmentKpiGrid
                    activeMissions={activeMissions.length}
                    ongoingBookings={pendingCandidatures}
                    availableCredits={availableCredits}
                    averageRating={null}
                />

                {/* Main bento */}
                <BentoSection cols={3} gap="md">
                    {/* Renforts actifs — wide */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-xl icon-coral flex items-center justify-center">
                                        <Siren className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h2 className="text-heading-sm">Mes renforts</h2>
                                        <p className="text-caption text-muted-foreground">Missions en cours et ouvertes</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/renforts" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Voir tout →
                                </Link>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <RenfortsWidget missions={activeMissions} error={missionsError} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Credits */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-emerald flex items-center justify-center">
                                    <DollarSign className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <h2 className="text-heading-sm">Mes Crédits</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <CreditsWidget credits={availableCredits} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Payment validation */}
                    {awaitingPaymentBookings.length > 0 && (
                        <GlassCard className="md:col-span-2">
                            <GlassCardHeader>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-xl icon-amber flex items-center justify-center">
                                        <DollarSign className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-heading-sm">Paiements à valider</h2>
                                </div>
                            </GlassCardHeader>
                            <GlassCardContent>
                                <PaymentValidationWidget bookings={awaitingPaymentBookings} />
                            </GlassCardContent>
                        </GlassCard>
                    )}

                    {/* Invoices */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-gray flex items-center justify-center">
                                    <FileText className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <h2 className="text-heading-sm">Mes Factures</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <EstablishmentInvoicesWidget invoices={invoices} error={invoicesError} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Quotes */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-teal flex items-center justify-center">
                                    <FileText className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <h2 className="text-heading-sm">Propositions</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <QuoteListWidget quotes={pendingQuotes} error={quotesError} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Candidatures */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-coral flex items-center justify-center">
                                    <Users className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <h2 className="text-heading-sm">Candidatures</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            {pendingCandidatures > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-3xl font-bold text-[hsl(var(--coral))]">{pendingCandidatures}</p>
                                    <p className="text-sm text-muted-foreground">
                                        candidature{pendingCandidatures > 1 ? "s" : ""} en attente de votre décision
                                    </p>
                                    <Link
                                        href="/dashboard/renforts"
                                        className="block w-full text-center text-xs font-medium text-[hsl(var(--teal))] hover:underline"
                                    >
                                        Voir le board de matching →
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aucune candidature en attente.</p>
                            )}
                        </GlassCardContent>
                    </GlassCard>

                    {/* Archives */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-gray flex items-center justify-center">
                                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <h2 className="text-heading-sm">Historique & Archives</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <EstablishmentArchivesWidget bookings={completedBookings} />
                        </GlassCardContent>
                    </GlassCard>
                </BentoSection>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // FREELANCE VIEW
    // ─────────────────────────────────────────────────────────────────

    // E.6.1 — Next mission: first upcoming confirmed booking
    const nextMission = confirmedBookings[0] as any | undefined;
    const nextMissionDetailsHref =
        nextMission?.lineType && nextMission?.lineId
            ? `/bookings/${nextMission.lineType}/${nextMission.lineId}`
            : "/bookings";

    // E.6.3 — Matching missions: fetch real open missions from API
    const availableMissionsResult = await fetchSafe(
        () => getAvailableMissions(token),
        [],
        "Missions disponibles",
    );
    const availableMissions = availableMissionsResult.data;
    const availableMissionsError = availableMissionsResult.error;

    const matchingMissions: MatchingMission[] = availableMissions.slice(0, 3).map((m) => ({
        id: m.id,
        title: m.metier ? getMetierLabel(m.metier) : m.title,
        establishment: m.establishment?.profile?.companyName ?? "Établissement",
        city: m.city ?? m.establishment?.profile?.city ?? "",
        dates: m.dateStart && isValid(new Date(m.dateStart)) ? format(new Date(m.dateStart), "dd MMM", { locale: fr }) : undefined,
        hours: m.shift === "NUIT" ? "Nuit" : m.shift === "JOUR" ? "Jour" : undefined,
        rate: `${m.hourlyRate}\u00a0€/h`,
        urgent: m.isUrgent ?? false,
    }));

    let recentReviewsError: string | null = null;
    let recentReviews: any[] = [];
    try {
        const rawReviews = await getReviewsByTarget(session.user.id, token);
        recentReviews = rawReviews.slice(0, 4).map((review: any) => {
            const authorProfile = review.author?.profile;
            const authorName = authorProfile
                ? authorProfile.companyName || `${authorProfile.firstName ?? ""} ${authorProfile.lastName ?? ""}`.trim() || "Établissement"
                : "Établissement";

            return {
                id: review.id,
                authorName,
                rating: review.rating,
                text: review.comment ?? "Avis sans commentaire.",
                context: new Date(review.createdAt).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                }),
            };
        });
    } catch {
        recentReviewsError = "Impossible de charger les avis pour le moment.";
    }

    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Freelance</p>
                    <h1 className="font-display text-heading-xl tracking-tight">Mon Tableau de bord</h1>
                    <p className="text-body-md text-muted-foreground">Suivez vos missions, candidatures et revenus.</p>
                </div>
                <Link href="/marketplace">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--teal))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Voir les missions
                    </span>
                </Link>
            </header>

            {/* E.6.1 — Prochaine mission (elevated card) */}
            {nextMission && (
                <NextMissionCard
                    detailsHref={nextMissionDetailsHref}
                    title={nextMission.service?.name ?? nextMission.title ?? "Mission confirmée"}
                    establishment={nextMission.establishment?.name ?? "Établissement"}
                    city={nextMission.establishment?.city ?? ""}
                    scheduledAt={nextMission.scheduledAt ?? nextMission.startDate ?? new Date().toISOString()}
                    dateDisplay={
                        nextMission.scheduledAt
                            ? new Date(nextMission.scheduledAt).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                              })
                            : "Date à confirmer"
                    }
                    timeRange={nextMission.timeRange}
                />
            )}

            {/* E.6.2 — KPI row */}
            <FreelanceKpiGrid
                completedThisMonth={completedBookings.length}
                revenueThisMonth="—"
                averageRating={null}
                profileCompletion={65}
            />

            {/* Main bento */}
            <BentoSection cols={3} gap="md">
                {/* E.6.3 — Nouvelles missions correspondantes — wide */}
                <GlassCard className="md:col-span-2">
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-coral flex items-center justify-center">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-heading-sm">Nouvelles missions</h2>
                                <p className="text-caption text-muted-foreground">Correspondant à votre profil</p>
                            </div>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <MatchingMissionsWidget missions={matchingMissions} error={availableMissionsError} />
                    </GlassCardContent>
                </GlassCard>

                {/* E.6.5 — Trust progress */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-emerald flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <h2 className="text-heading-sm">Profil & Confiance</h2>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <TrustChecklistWidget />
                    </GlassCardContent>
                </GlassCard>

                {/* Agenda — wide */}
                <GlassCard className="md:col-span-2">
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-teal flex items-center justify-center">
                                <Calendar className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-heading-sm">Mon Agenda</h2>
                                <p className="text-caption text-muted-foreground">Missions confirmées</p>
                            </div>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <BookingListWidget
                            bookings={confirmedBookings}
                            emptyMessage="Aucune mission prévue."
                            viewAllLink="/bookings"
                            error={bookingsError}
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* E.6.6 — Derniers avis reçus */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-amber flex items-center justify-center">
                                <Star className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <h2 className="text-heading-sm">Derniers avis</h2>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <RecentReviewsWidget reviews={recentReviews} error={recentReviewsError} />
                    </GlassCardContent>
                </GlassCard>

                {/* Candidatures — wide */}
                <GlassCard className="md:col-span-2">
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-coral flex items-center justify-center">
                                <Briefcase className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-heading-sm">Mes Candidatures</h2>
                                <p className="text-caption text-muted-foreground">En cours de traitement</p>
                            </div>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <BookingListWidget
                            bookings={pendingBookings}
                            emptyMessage="Aucune candidature en cours."
                            viewAllLink="/bookings"
                            error={bookingsError}
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* Gains card */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-emerald flex items-center justify-center">
                                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <h2 className="text-heading-sm">Mes Finances</h2>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Total gagné</p>
                                <p className="text-3xl font-bold">850,00 €</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-emerald-600">+12%</span>
                                <span className="text-xs text-muted-foreground">par rapport au mois dernier</span>
                            </div>
                            <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
                                <Link href="/finance">Voir mes finances</Link>
                            </Button>
                        </div>
                    </GlassCardContent>
                </GlassCard>
            </BentoSection>
        </div>
    );
}
