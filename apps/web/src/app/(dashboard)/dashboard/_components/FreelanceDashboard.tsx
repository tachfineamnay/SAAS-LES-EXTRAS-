import Link from "next/link";
import type { BookingLine } from "@/app/actions/bookings";
import type { MyDeskRequest } from "@/app/actions/desk";
import type { MesAtelierItem } from "@/app/actions/marketplace";
import type { MatchingMission } from "@/components/dashboard/MatchingMissionsWidget";
import { BentoSection } from "@/components/layout/BentoSection";
import { FreelanceKpiGrid } from "@/components/dashboard/FreelanceKpiGrid";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { TrustChecklistWidget } from "@/components/dashboard/TrustChecklistWidget";
import { NextMissionCard } from "@/components/dashboard/NextMissionCard";
import { MatchingMissionsWidget } from "@/components/dashboard/MatchingMissionsWidget";
import { RecentReviewsWidget } from "@/components/dashboard/RecentReviewsWidget";
import { Button } from "@/components/ui/button";
import { DashboardWidget } from "./DashboardWidget";
import {
    Calendar,
    Briefcase,
    BookOpen,
    ShieldCheck,
    TrendingUp,
    Star,
    Sparkles,
    Inbox,
} from "lucide-react";

export interface ReviewItem {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    context: string;
}

export interface FreelanceDashboardProps {
    confirmedBookings: BookingLine[];
    pendingBookings: BookingLine[];
    serviceBookings: BookingLine[];
    bookingsError: string | null;
    matchingMissions: MatchingMission[];
    availableMissionsError: string | null;
    nextMission: BookingLine | undefined;
    recentReviews: ReviewItem[];
    recentReviewsError: string | null;
    isAvailable?: boolean;
    services: MesAtelierItem[];
    servicesError: string | null;
    deskRequests: MyDeskRequest[];
    deskRequestsError: string | null;
    completedMissionsThisMonth: number;
    activeServices: number;
    openDeskRequests: number;
    averageRating: number | null;
}

export function FreelanceDashboard({
    confirmedBookings,
    pendingBookings,
    serviceBookings,
    bookingsError,
    matchingMissions,
    availableMissionsError,
    nextMission,
    recentReviews,
    recentReviewsError,
    isAvailable,
    services,
    servicesError,
    deskRequests,
    deskRequestsError,
    completedMissionsThisMonth,
    activeServices,
    openDeskRequests,
    averageRating,
}: FreelanceDashboardProps) {
    const nextMissionDetailsHref =
        nextMission?.lineType && nextMission?.lineId
            ? `/bookings/${nextMission.lineType}/${nextMission.lineId}`
            : "/bookings";
    const draftServices = services.filter((service) => service.status === "DRAFT").length;
    const pendingServiceBookings = serviceBookings.filter((booking) => booking.status === "PENDING").length;
    const answeredDeskRequests = deskRequests.filter((request) => request.status === "ANSWERED").length;
    const latestDeskRequest = deskRequests[0];

    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1.5">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">
                        Espace Freelance
                    </p>
                    <h1 className="font-display text-heading-xl tracking-tight">
                        Mon Tableau de bord
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className={`relative flex h-2.5 w-2.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-red-500"}`}>
                            {isAvailable && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                        </span>
                        <p className="text-body-sm font-medium">
                            {isAvailable ? "Disponible" : "Indisponible"}
                        </p>
                    </div>
                    <p className="text-body-md text-muted-foreground">
                        Pilotez vos missions de renfort, vos services et vos échanges avec l&apos;équipe.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/marketplace">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--teal))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Explorer missions & services
                        </span>
                    </Link>
                    <Button variant="glass" className="min-h-[44px]" asChild>
                        <Link href="/dashboard/ateliers">
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            Proposer mes services
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Next mission (elevated card) */}
            {nextMission && (
                <NextMissionCard
                    detailsHref={nextMissionDetailsHref}
                    title={nextMission.typeLabel ?? "Mission confirmée"}
                    establishment={nextMission.interlocutor ?? "Établissement"}
                    city={nextMission.address ?? ""}
                    scheduledAt={nextMission.date ?? new Date().toISOString()}
                    dateDisplay={
                        nextMission.date
                            ? new Date(nextMission.date).toLocaleDateString("fr-FR", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                              })
                            : "Date à confirmer"
                    }
                />
            )}

            {/* KPI row */}
            <FreelanceKpiGrid
                completedMissionsThisMonth={completedMissionsThisMonth}
                activeServices={activeServices}
                openDeskRequests={openDeskRequests}
                averageRating={averageRating}
            />

            {/* Main bento */}
            <BentoSection cols={3} gap="md">
                {/* Matching missions */}
                <DashboardWidget
                    icon={Sparkles}
                    iconColor="coral"
                    title="Nouvelles missions"
                    subtitle="Correspondant à votre profil"
                    wide
                >
                    <MatchingMissionsWidget
                        missions={matchingMissions}
                        error={availableMissionsError}
                    />
                </DashboardWidget>

                {/* Trust progress */}
                <DashboardWidget
                    icon={ShieldCheck}
                    iconColor="emerald"
                    title="Profil & Confiance"
                >
                    <TrustChecklistWidget />
                </DashboardWidget>

                {/* Services */}
                <DashboardWidget
                    icon={BookOpen}
                    iconColor="teal"
                    title="Mes services"
                    subtitle="Ateliers et formations proposés"
                    viewAllHref="/dashboard/ateliers"
                >
                    {servicesError ? (
                        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-sm text-muted-foreground">
                            {servicesError}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-2xl font-bold">{services.length}</p>
                                    <p className="text-xs text-muted-foreground">total</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{activeServices}</p>
                                    <p className="text-xs text-muted-foreground">actifs</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{pendingServiceBookings}</p>
                                    <p className="text-xs text-muted-foreground">demandes</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {services.length > 0
                                    ? `${draftServices} brouillon${draftServices > 1 ? "s" : ""} à finaliser.`
                                    : "Publiez un atelier ou une formation pour recevoir des demandes de réservation."}
                            </p>
                            <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
                                <Link href="/dashboard/ateliers">Gérer mes services</Link>
                            </Button>
                        </div>
                    )}
                </DashboardWidget>

                {/* Agenda */}
                <DashboardWidget
                    icon={Calendar}
                    iconColor="teal"
                    title="Mon Agenda"
                    subtitle="Missions confirmées"
                    wide
                >
                    <BookingListWidget
                        bookings={confirmedBookings}
                        emptyMessage="Aucune mission prévue."
                        viewAllLink="/bookings"
                        error={bookingsError}
                    />
                </DashboardWidget>

                {/* Recent reviews */}
                <DashboardWidget icon={Star} iconColor="amber" title="Derniers avis">
                    <RecentReviewsWidget
                        reviews={recentReviews}
                        error={recentReviewsError}
                    />
                </DashboardWidget>

                {/* Candidatures */}
                <DashboardWidget
                    icon={Briefcase}
                    iconColor="coral"
                    title="Mes Candidatures"
                    subtitle="En cours de traitement"
                    wide
                >
                    <BookingListWidget
                        bookings={pendingBookings}
                        emptyMessage="Aucune candidature en cours."
                        viewAllLink="/bookings"
                        error={bookingsError}
                    />
                </DashboardWidget>

                {/* Desk requests */}
                <DashboardWidget
                    icon={Inbox}
                    iconColor="coral"
                    title="Mes demandes"
                    subtitle="Réponses de l'équipe"
                    viewAllHref="/dashboard/demandes"
                >
                    {deskRequestsError ? (
                        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-sm text-muted-foreground">
                            {deskRequestsError}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div>
                                    <p className="text-2xl font-bold">{openDeskRequests}</p>
                                    <p className="text-xs text-muted-foreground">ouvertes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{answeredDeskRequests}</p>
                                    <p className="text-xs text-muted-foreground">réponses</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {latestDeskRequest
                                    ? `Dernière demande : ${latestDeskRequest.mission?.title ?? "—"}`
                                    : "Aucune demande d'information en cours."}
                            </p>
                            <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
                                <Link href="/dashboard/demandes">Voir mes demandes</Link>
                            </Button>
                        </div>
                    )}
                </DashboardWidget>

                {/* Finances */}
                <DashboardWidget icon={TrendingUp} iconColor="emerald" title="Mes Finances">
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Suivez vos factures et paiements validés dans l&apos;espace finances.
                        </p>
                        <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
                            <Link href="/finance">Voir mes finances</Link>
                        </Button>
                    </div>
                </DashboardWidget>
            </BentoSection>
        </div>
    );
}
