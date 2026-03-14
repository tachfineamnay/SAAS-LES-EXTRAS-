import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getBookingsPageData } from "@/app/actions/bookings";
import { getQuotes } from "@/actions/quotes";
import { getInvoices } from "@/actions/finance";
import { getCredits } from "@/actions/credits";
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

    let bookingsData: { lines: any[] } = { lines: [] };
    try {
        bookingsData = await getBookingsPageData(token);
    } catch { /* API might be down */ }

    let quotes: any[] = [];
    if (userRole === "ESTABLISHMENT") {
        try { quotes = await getQuotes(token); } catch { /* swallow */ }
    }
    if (!Array.isArray(quotes)) quotes = [];

    let invoices: any[] = [];
    try {
        const inv = await getInvoices();
        invoices = Array.isArray(inv) ? inv : [];
    } catch { /* swallow */ }

    const pendingBookings = (bookingsData?.lines ?? []).filter((b: any) => b.status === "PENDING");
    const confirmedBookings = (bookingsData?.lines ?? []).filter(
        (b: any) => b.status === "CONFIRMED" || b.status === "ASSIGNED"
    );
    const completedBookings = (bookingsData?.lines ?? []).filter(
        (b: any) => b.status === "COMPLETED" || b.status === "PAID"
    );

    // ─────────────────────────────────────────────────────────────────
    // ESTABLISHMENT VIEW
    // ─────────────────────────────────────────────────────────────────
    if (userRole === "ESTABLISHMENT") {
        const pendingQuotes = quotes.filter((q: any) => q.status === "PENDING");
        const awaitingPaymentBookings = (bookingsData?.lines ?? []).filter(
            (b: any) => b.status === "COMPLETED_AWAITING_PAYMENT"
        );
        const missionsToValidate: any[] = [];
        const upcomingMissions = confirmedBookings;

        return (
            <div className="space-y-8">
                {/* Page header */}
                <header className="space-y-1.5">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Établissement</p>
                    <h1 className="font-display text-heading-xl tracking-tight">Tableau de bord</h1>
                    <p className="text-body-md text-muted-foreground">Vue d'ensemble de vos renforts et opérations.</p>
                </header>

                {/* Alert zone */}
                <MissionsToValidateWidget bookings={missionsToValidate} />

                {/* KPI row */}
                <EstablishmentKpiGrid
                    confirmedCount={confirmedBookings.length}
                    awaitingPaymentCount={awaitingPaymentBookings.length}
                    availableCredits={availableCredits}
                    pendingQuotesCount={pendingQuotes.length}
                />

                {/* Main bento */}
                <BentoSection cols={3} gap="md">
                    {/* Upcoming missions — wide */}
                    <GlassCard className="md:col-span-2">
                        <GlassCardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl icon-teal flex items-center justify-center">
                                    <Calendar className="h-4 w-4" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 className="text-heading-sm">Renforts à venir</h2>
                                    <p className="text-caption text-muted-foreground">Missions confirmées</p>
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
                            <EstablishmentInvoicesWidget invoices={invoices} />
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
                            <QuoteListWidget quotes={pendingQuotes} />
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
    return (
        <div className="space-y-8">
            {/* Page header */}
            <header className="space-y-1.5">
                <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Freelance</p>
                <h1 className="font-display text-heading-xl tracking-tight">Mon Tableau de bord</h1>
                <p className="text-body-md text-muted-foreground">Suivez vos missions, candidatures et revenus.</p>
            </header>

            {/* KPI row */}
            <FreelanceKpiGrid
                confirmedCount={confirmedBookings.length}
                completedCount={completedBookings.length}
                pendingCount={pendingBookings.length}
            />

            {/* Main bento */}
            <BentoSection cols={3} gap="md">
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
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* Trust checklist */}
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

                {/* Candidatures */}
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
                        />
                    </GlassCardContent>
                </GlassCard>

                {/* Propositions */}
                <GlassCard>
                    <GlassCardHeader>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl icon-violet flex items-center justify-center">
                                <FileText className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <h2 className="text-heading-sm">Propositions</h2>
                        </div>
                    </GlassCardHeader>
                    <GlassCardContent>
                        <QuoteCreationModal />
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
