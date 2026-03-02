import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import { getQuotes } from "@/actions/quotes";
import { getInvoices } from "@/actions/finance";
import { getCredits } from "@/actions/credits";
import { BentoSection } from "@/components/layout/BentoSection";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { TrustChecklistWidget } from "@/components/dashboard/TrustChecklistWidget";
import { QuoteCreationModal } from "@/components/dashboard/QuoteCreationModal";
import { QuoteListWidget } from "@/components/dashboard/QuoteListWidget";
import { PaymentValidationWidget } from "@/components/dashboard/PaymentValidationWidget";
import { MissionsToValidateWidget } from "@/components/dashboard/client/MissionsToValidateWidget";
import { UpcomingMissionsWidget } from "@/components/dashboard/client/UpcomingMissionsWidget";
import { ClientInvoicesWidget } from "@/components/dashboard/client/ClientInvoicesWidget";
import { ClientArchivesWidget } from "@/components/dashboard/client/ClientArchivesWidget";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    Calendar,
    Users,
    Briefcase,
    FileText,
    CheckCircle,
    ShieldCheck,
    Siren,
    TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const { role: userRole } = session.user;
    const { token } = session;

    let availableCredits = 0;
    if (userRole === "CLIENT") {
        availableCredits = await getCredits();
    }

    const bookingsData = await getBookingsPageData(token);
    const quotes = userRole === "CLIENT" ? await getQuotes(token) : [];
    const invoices = await getInvoices();

    const pendingBookings = bookingsData.lines.filter((b) => b.status === "PENDING");
    const confirmedBookings = bookingsData.lines.filter(
        (b) => b.status === "CONFIRMED" || b.status === "ASSIGNED"
    );
    const completedBookings = bookingsData.lines.filter(
        (b) => b.status === "COMPLETED" || b.status === "PAID"
    );

    // ─────────────────────────────────────────────────────────────────
    // CLIENT VIEW
    // ─────────────────────────────────────────────────────────────────
    if (userRole === "CLIENT") {
        const pendingQuotes = quotes.filter((q: any) => q.status === "PENDING");
        const awaitingPaymentBookings = bookingsData.lines.filter(
            (b) => b.status === "COMPLETED_AWAITING_PAYMENT"
        );
        const missionsToValidate: any[] = [];
        const upcomingMissions = confirmedBookings;

        return (
            <div className="space-y-8">
                {/* Page header */}
                <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Espace Établissement</p>
                        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-sm text-muted-foreground">Vue d'ensemble de vos renforts et opérations.</p>
                    </div>
                    <Button size="sm" className="shadow-sm self-start sm:self-auto gap-2 min-h-[44px]">
                        <Siren className="h-4 w-4" aria-hidden="true" />
                        Demander un renfort
                    </Button>
                </header>

                {/* Alert zone */}
                <MissionsToValidateWidget bookings={missionsToValidate} />

                {/* KPI row */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiTile
                        label="Renforts actifs"
                        value={confirmedBookings.length}
                        icon={Briefcase}
                        iconColor="gray"
                    />
                    <KpiTile
                        label="En attente paiement"
                        value={awaitingPaymentBookings.length}
                        icon={DollarSign}
                        iconColor="amber"
                    />
                    <KpiTile
                        label="Crédits disponibles"
                        value={availableCredits}
                        icon={TrendingUp}
                        iconColor="emerald"
                    />
                    <KpiTile
                        label="Propositions reçues"
                        value={pendingQuotes.length}
                        icon={FileText}
                        iconColor="teal"
                    />
                </div>

                {/* Main bento */}
                <BentoSection cols={3} gap="md">
                    {/* Upcoming missions — wide */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold tracking-tight">Renforts à venir</h2>
                                    <p className="text-xs text-muted-foreground">Missions confirmées</p>
                                </div>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <UpcomingMissionsWidget bookings={upcomingMissions} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Credits */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                </div>
                                <h2 className="text-base font-semibold tracking-tight">Mes Crédits</h2>
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
                                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <DollarSign className="h-4 w-4 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-base font-semibold tracking-tight">Paiements à valider</h2>
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
                                <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-secondary" aria-hidden="true" />
                                </div>
                                <h2 className="text-base font-semibold tracking-tight">Mes Factures</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <ClientInvoicesWidget invoices={invoices} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Quotes */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                                </div>
                                <h2 className="text-base font-semibold tracking-tight">Propositions</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <QuoteListWidget quotes={pendingQuotes} />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Candidatures */}
                    <GlassCard>
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-secondary" aria-hidden="true" />
                                </div>
                                <h2 className="text-base font-semibold tracking-tight">Candidatures</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <BookingListWidget
                                bookings={pendingBookings}
                                emptyMessage="Aucune candidature en attente."
                                viewAllLink="/bookings?status=PENDING"
                            />
                        </GlassCardContent>
                    </GlassCard>

                    {/* Archives */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <h2 className="text-base font-semibold tracking-tight">Historique & Archives</h2>
                            </div>
                        </GlassCardHeader>
                        <GlassCardContent>
                            <ClientArchivesWidget bookings={completedBookings} />
                        </GlassCardContent>
                    </GlassCard>
                </BentoSection>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // TALENT / FREELANCE VIEW
    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Espace Freelance</p>
                    <h1 className="text-3xl font-bold tracking-tight">Mon Tableau de bord</h1>
                    <p className="text-sm text-muted-foreground">Suivez vos missions, candidatures et revenus.</p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                    <QuoteCreationModal />
                    <Button variant="glass" size="sm" className="min-h-[44px]" asChild>
                        <Link href="/marketplace">
                            Trouver une mission
                        </Link>
                    </Button>
                </div>
            </header>

            {/* KPI row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiTile
                    label="Missions à venir"
                    value={confirmedBookings.length}
                    icon={Calendar}
                    iconColor="gray"
                />
                <KpiTile
                    label="Gains cumulés"
                    value="850 €"
                    icon={DollarSign}
                    iconColor="emerald"
                    trend="up"
                    trendLabel="+12% ce mois"
                />
                <KpiTile
                    label="Missions réalisées"
                    value={completedBookings.length}
                    icon={CheckCircle}
                    iconColor="teal"
                />
                <KpiTile
                    label="Candidatures"
                    value={pendingBookings.length}
                    icon={Briefcase}
                    iconColor="amber"
                />
            </div>

            {/* Main bento */}
            <BentoSection cols={3} gap="md">
                {/* Agenda — wide */}
                <GlassCard className="md:col-span-2">
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-secondary" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold tracking-tight">Mon Agenda</h2>
                                <p className="text-xs text-muted-foreground">Missions confirmées</p>
                            </div>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <BookingListWidget
                            bookings={confirmedBookings}
                            emptyMessage="Aucune mission prévue."
                            viewAllLink="/bookings"
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* Trust checklist */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-base font-semibold tracking-tight">Profil & Confiance</h2>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <TrustChecklistWidget />
                    </GlassCardContent>
                </GlassCard>

                {/* Candidatures */}
                <GlassCard className="md:col-span-2">
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold tracking-tight">Mes Candidatures</h2>
                                <p className="text-xs text-muted-foreground">En cours de traitement</p>
                            </div>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <BookingListWidget
                            bookings={pendingBookings}
                            emptyMessage="Aucune candidature en cours."
                            viewAllLink="/bookings"
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* Gains card */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-base font-semibold tracking-tight">Mes Finances</h2>
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
