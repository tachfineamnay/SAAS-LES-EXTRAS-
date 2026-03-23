import Link from "next/link";
import type { BookingLine } from "@/app/actions/bookings";
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
    ShieldCheck,
    TrendingUp,
    Star,
    Sparkles,
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
    completedBookings: BookingLine[];
    bookingsError: string | null;
    matchingMissions: MatchingMission[];
    availableMissionsError: string | null;
    nextMission: BookingLine | undefined;
    recentReviews: ReviewItem[];
    recentReviewsError: string | null;
}

export function FreelanceDashboard({
    confirmedBookings,
    pendingBookings,
    completedBookings,
    bookingsError,
    matchingMissions,
    availableMissionsError,
    nextMission,
    recentReviews,
    recentReviewsError,
}: FreelanceDashboardProps) {
    const nextMissionDetailsHref =
        nextMission?.lineType && nextMission?.lineId
            ? `/bookings/${nextMission.lineType}/${nextMission.lineId}`
            : "/bookings";

    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">
                        Espace Freelance
                    </p>
                    <h1 className="font-display text-heading-xl tracking-tight">
                        Mon Tableau de bord
                    </h1>
                    <p className="text-body-md text-muted-foreground">
                        Suivez vos missions, candidatures et revenus.
                    </p>
                </div>
                <Link href="/marketplace">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--teal))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Voir les missions
                    </span>
                </Link>
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
                completedThisMonth={completedBookings.length}
                revenueThisMonth="—"
                averageRating={null}
                profileCompletion={65}
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

                {/* Finances */}
                <DashboardWidget icon={TrendingUp} iconColor="emerald" title="Mes Finances">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total gagné</p>
                            <p className="text-3xl font-bold">—</p>
                        </div>
                        <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
                            <Link href="/finance">Voir mes finances</Link>
                        </Button>
                    </div>
                </DashboardWidget>
            </BentoSection>
        </div>
    );
}
