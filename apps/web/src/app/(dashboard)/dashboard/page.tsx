import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import { getQuotes } from "@/actions/quotes";
import { BentoGrid, BentoCard } from "@/components/dashboard/BentoGrid";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { NetworkWidget } from "@/components/dashboard/NetworkWidget";
import { DollarSign, Calendar, Users, Briefcase, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustChecklistWidget } from "@/components/dashboard/TrustChecklistWidget";
import { QuoteCreationModal } from "@/components/dashboard/QuoteCreationModal";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { PaymentValidationWidget } from "@/components/dashboard/PaymentValidationWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/client/MissionsToValidateWidget";
import { UpcomingMissionsWidget } from "@/components/dashboard/client/UpcomingMissionsWidget";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { role: userRole } = session.user;
    const { token } = session;

    // Fetch data with token
    const bookingsData = await getBookingsPageData(token);
    const quotes = userRole === "CLIENT" ? await getQuotes(token) : [];

    // Filter bookings
    const pendingBookings = bookingsData.lines.filter((b) => b.status === "PENDING");
    const confirmedBookings = bookingsData.lines.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED",
    );
    const completedBookings = bookingsData.lines.filter(
        (b) => b.status === "COMPLETED" || b.status === "PAID",
    );

    if (userRole === "CLIENT") {
        const pendingQuotes = quotes.filter((q: any) => q.status === "PENDING");
        const awaitingPaymentBookings = bookingsData.lines.filter((b) => b.status === "COMPLETED_AWAITING_PAYMENT");

        const now = new Date();
        const confirmedBookingsAll = bookingsData.lines.filter(b => b.status === "CONFIRMED" || b.status === "ASSIGNED");

        // Logic for missions to validate: In a real app we would check end date.
        // For this demo, we can't easily filter by date string "DD/MM/YYYY" without parsing.
        // We will assume "CONFIRMED" are upcoming. 
        // If we want to simulate validation, we would need a status "PENDING_VALIDATION".
        // But since we don't have it, we'll keep the widget empty or mock it if needed.
        // Let's pass an empty array for now or a filtered list if we add logic later.
        const missionsToValidate: any[] = [];

        const upcomingMissions = confirmedBookingsAll;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tableau de bord Établissement
                    </h1>
                    <div className="flex gap-2">
                        <Button size="sm">Publier une mission</Button>
                    </div>
                </div>

                {/* Alert Zone for Validation */}
                <MissionsToValidateWidget bookings={missionsToValidate} />

                <BentoGrid>
                    {/* Payments to Validate - High Priority */}
                    {awaitingPaymentBookings.length > 0 && (
                        <BentoCard
                            title="Paiements à Valider"
                            icon={<DollarSign className="h-6 w-6 text-green-600" />}
                            colSpan={2}
                            rowSpan={Math.max(1, awaitingPaymentBookings.length > 2 ? 2 : 1)}
                        >
                            <PaymentValidationWidget bookings={awaitingPaymentBookings} />
                        </BentoCard>
                    )}

                    {/* Planning / Upcoming Missions */}
                    <BentoCard
                        title="Mes Renforts à Venir"
                        icon={<Calendar className="h-6 w-6" />}
                        rowSpan={2}
                    >
                        <UpcomingMissionsWidget bookings={upcomingMissions} />
                    </BentoCard>

                    {/* Offers / Quotes Received - Priority */}
                    <BentoCard
                        title="Propositions Reçues"
                        icon={<FileText className="h-6 w-6" />}
                        colSpan={2}
                        rowSpan={2}
                    >
                        <QuoteListWidget quotes={pendingQuotes} />
                    </BentoCard>

                    {/* Freelances disponibles (PENDING on my missions) */}
                    <BentoCard
                        title="Candidatures"
                        icon={<Users className="h-6 w-6" />}
                        rowSpan={2}
                    >
                        <BookingListWidget
                            bookings={pendingBookings}
                            emptyMessage="Aucune candidature en attente."
                            viewAllLink="/bookings?status=PENDING"
                        />
                    </BentoCard>

                    {/* Facturation */}
                    <BentoCard title="Facturation" icon={<FileText className="h-6 w-6" />}>
                        <div className="flex flex-col gap-4 h-full justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Dépenses ce mois-ci
                                </p>
                                <div className="text-3xl font-bold">1 250,00 €</div>
                            </div>
                            <Button variant="outline" className="w-full">
                                Télécharger les factures
                            </Button>
                        </div>
                    </BentoCard>

                    {/* Réseau de confiance */}
                    <BentoCard
                        title="Mon Réseau"
                        icon={<Users className="h-6 w-6" />}
                        rowSpan={2}
                    >
                        <NetworkWidget />
                    </BentoCard>

                    {/* Stats rapides */}
                    <BentoCard>
                        <StatsWidget
                            title="Missions actives"
                            value={confirmedBookings.length}
                            icon={<Briefcase className="h-4 w-4" />}
                            description="En cours ou à venir"
                            className="border-0 shadow-none p-0"
                        />
                    </BentoCard>
                </BentoGrid>
            </div>
        );
    }

    // TALENT VIEW
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    Tableau de bord Freelance
                </h1>
                <div className="flex gap-2">
                    <QuoteCreationModal />
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/finance">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Mes Finances
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline">Trouver une mission</Button>
                </div>
            </div>

            <BentoGrid>
                {/* Mon Agenda */}
                <BentoCard
                    title="Mon Agenda"
                    icon={<Calendar className="h-6 w-6" />}
                    colSpan={2}
                    rowSpan={2}
                >
                    <BookingListWidget
                        bookings={confirmedBookings}
                        emptyMessage="Aucune mission prévue."
                        viewAllLink="/bookings"
                    />
                </BentoCard>

                {/* Gains */}
                <BentoCard title="Gains cumulés" icon={<DollarSign className="h-6 w-6" />}>
                    <div className="flex flex-col gap-4 h-full justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total gagné</p>
                            <div className="text-3xl font-bold">850,00 €</div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <span className="text-emerald-600 font-medium flex items-center mr-1">
                                +12%
                            </span>
                            par rapport au mois dernier
                        </div>
                    </div>
                </BentoCard>

                {/* Mes Postulations */}
                <BentoCard
                    title="Mes Candidatures"
                    icon={<Briefcase className="h-6 w-6" />}
                    rowSpan={2}
                >
                    <BookingListWidget
                        bookings={pendingBookings}
                        emptyMessage="Aucune candidature en cours."
                        viewAllLink="/bookings"
                    />
                </BentoCard>

                {/* Missions complétées */}
                <BentoCard>
                    <StatsWidget
                        title="Missions réalisées"
                        value={completedBookings.length}
                        icon={<CheckCircle className="h-4 w-4" />}
                        description="Depuis votre inscription"
                        className="border-0 shadow-none p-0"
                    />
                </BentoCard>

                {/* Checklist de confiance */}
                <BentoCard
                    title="Checklist Confiance"
                    icon={<ShieldCheck className="h-6 w-6" />}
                    rowSpan={2}
                >
                    <TrustChecklistWidget />
                </BentoCard>
            </BentoGrid>
        </div>
    );
}
