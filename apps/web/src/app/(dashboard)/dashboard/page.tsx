import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMarketplaceData } from "@/app/actions/marketplace";
import { getBookingsPageData } from "@/app/actions/bookings";
import { BentoGrid, BentoCard } from "@/components/dashboard/BentoGrid";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { NetworkWidget } from "@/components/dashboard/NetworkWidget";
import { DollarSign, Calendar, Users, Briefcase, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustChecklistWidget } from "@/components/dashboard/TrustChecklistWidget";

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
    // marketplaceData was unused in original code, removing it unless needed later

    // Filter bookings
    const pendingBookings = bookingsData.lines.filter((b) => b.status === "PENDING");
    const confirmedBookings = bookingsData.lines.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED",
    );
    const completedBookings = bookingsData.lines.filter(
        (b) => b.status === "COMPLETED" || b.status === "PAID",
    );

    if (userRole === "CLIENT") {
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

                <BentoGrid>
                    {/* Freelances disponibles (PENDING on my missions) */}
                    <BentoCard
                        title="Freelances disponibles"
                        icon={<Users className="h-6 w-6" />}
                        colSpan={2}
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
                    <Button size="sm">Trouver une mission</Button>
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
