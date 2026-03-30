import { redirect } from "next/navigation";
import { getSession, deleteSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import type { BookingsPageData } from "@/app/actions/bookings";
import type { SerializedQuote } from "@/actions/quotes";
import { getInvoices } from "@/actions/finance";
import type { SerializedInvoice } from "@/actions/finance";
import { getCredits } from "@/actions/credits";
import { getReviewsByTarget } from "@/app/actions/reviews";
import { getEstablishmentMissions, getAvailableMissions } from "@/app/actions/missions";
import type { EstablishmentMission } from "@/app/actions/missions";
import { fetchSafe } from "@/lib/widget-result";
import { UnauthorizedError } from "@/lib/api";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { getMetierLabel } from "@/lib/sos-config";
import type { MatchingMission } from "@/components/dashboard/MatchingMissionsWidget";
import { getCurrentUser } from "@/app/actions/user";
import { EstablishmentDashboard } from "./_components/EstablishmentDashboard";
import { FreelanceDashboard } from "./_components/FreelanceDashboard";
import type { ReviewItem } from "./_components/FreelanceDashboard";

export const dynamic = "force-dynamic";

// ─── Data fetching helpers ──────────────────────────────────────

async function fetchEstablishmentData(token: string, userId: string) {
    const [bookingsResult, missionsResult, invoicesResult, creditsResult, reviewsResult] =
        await Promise.all([
            fetchSafe<BookingsPageData>(
                () => getBookingsPageData(token),
                { lines: [], nextStep: null },
                "Réservations",
            ),
            fetchSafe<EstablishmentMission[]>(
                () => getEstablishmentMissions(token),
                [],
                "Renforts",
            ),
            fetchSafe<SerializedInvoice[]>(
                () => getInvoices(),
                [],
                "Factures",
            ),
            fetchSafe<number>(
                () => getCredits(),
                0,
                "Crédits",
            ),
            fetchReviews(userId, token),
        ]);

    // Quotes endpoint not yet implemented — use empty placeholder
    const quotesResult = { data: [] as SerializedQuote[], error: null };

    const lines = bookingsResult.data?.lines ?? [];
    const missions = missionsResult.data;

    const activeMissions = missions.filter(
        (m) => m.status === "OPEN" || m.status === "ASSIGNED",
    );
    const pendingCandidatures = missions.reduce(
        (acc, m) => acc + (m.bookings?.filter((b) => b.status === "PENDING").length ?? 0),
        0,
    );
    const awaitingPaymentBookings = lines.filter(
        (b) => b.status === "COMPLETED_AWAITING_PAYMENT",
    );
    const confirmedBookings = lines.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED",
    );
    const completedBookings = lines.filter(
        (b) => b.status === "COMPLETED" || b.status === "PAID",
    );
    const pendingQuotes = (quotesResult.data ?? []).filter((q) => q.status === "PENDING");

    // Find the next upcoming mission (earliest dateStart among ASSIGNED or OPEN)
    const sortedMissions = [...activeMissions].sort(
        (a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime(),
    );
    const nextMission = sortedMissions[0] ?? null;

    return {
        activeMissions,
        missionsError: missionsResult.error,
        pendingQuotes,
        quotesError: quotesResult.error,
        invoices: invoicesResult.data ?? [],
        invoicesError: invoicesResult.error,
        availableCredits: creditsResult.data,
        pendingCandidatures,
        awaitingPaymentBookings,
        confirmedBookings,
        completedBookings,
        bookingsError: bookingsResult.error,
        nextMission,
        recentReviews: reviewsResult.data,
        recentReviewsError: reviewsResult.error,
    };
}

async function fetchFreelanceData(token: string, userId: string) {
    const [bookingsResult, missionsResult, reviewsResult, availabilityResult] = await Promise.all([
        fetchSafe<BookingsPageData>(
            () => getBookingsPageData(token),
            { lines: [], nextStep: null },
            "Réservations",
        ),
        fetchSafe(
            () => getAvailableMissions(token),
            [],
            "Missions disponibles",
        ),
        fetchReviews(userId, token),
        fetchSafe(
            () => getCurrentUser(),
            null,
            "Disponibilité",
        ),
    ]);

    const lines = bookingsResult.data?.lines ?? [];
    const confirmedBookings = lines.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED",
    );

    const matchingMissions: MatchingMission[] = (missionsResult.data ?? [])
        .slice(0, 3)
        .map((m) => ({
            id: m.id,
            title: m.metier ? getMetierLabel(m.metier) : m.title,
            establishment: m.establishment?.profile?.companyName ?? "Établissement",
            city: m.city ?? m.establishment?.profile?.city ?? "",
            dates:
                m.dateStart && isValid(new Date(m.dateStart))
                    ? format(new Date(m.dateStart), "dd MMM", { locale: fr })
                    : undefined,
            hours: m.shift === "NUIT" ? "Nuit" : m.shift === "JOUR" ? "Jour" : undefined,
            rate: `${m.hourlyRate}\u00a0€/h`,
            urgent: m.isUrgent ?? false,
        }));

    return {
        confirmedBookings,
        pendingBookings: lines.filter((b) => b.status === "PENDING"),
        completedBookings: lines.filter(
            (b) => b.status === "COMPLETED" || b.status === "PAID",
        ),
        bookingsError: bookingsResult.error,
        matchingMissions,
        availableMissionsError: missionsResult.error,
        nextMission: confirmedBookings[0],
        recentReviews: reviewsResult.data,
        recentReviewsError: reviewsResult.error,
        isAvailable: availabilityResult.data?.isAvailable ?? false,
    };
}

async function fetchReviews(
    userId: string,
    token: string,
): Promise<{ data: ReviewItem[]; error: string | null }> {
    try {
        const rawReviews = await getReviewsByTarget(userId, token);
        const data: ReviewItem[] = rawReviews.slice(0, 4).map((review: any) => {
            const authorProfile = review.author?.profile;
            const authorName = authorProfile
                ? authorProfile.companyName ||
                  `${authorProfile.firstName ?? ""} ${authorProfile.lastName ?? ""}`.trim() ||
                  "Établissement"
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
        return { data, error: null };
    } catch {
        return { data: [], error: "Impossible de charger les avis pour le moment." };
    }
}

// ─── Page component ─────────────────────────────────────────────

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const { role: userRole } = session.user;
    const { token } = session;

    try {
        if (userRole === "ESTABLISHMENT") {
            const data = await fetchEstablishmentData(token, session.user.id);
            return <EstablishmentDashboard {...data} />;
        }

        const data = await fetchFreelanceData(token, session.user.id);
        return <FreelanceDashboard {...data} />;
    } catch (e) {
        if (e instanceof UnauthorizedError) {
            await deleteSession();
            redirect("/login");
        }
        throw e;
    }
}
