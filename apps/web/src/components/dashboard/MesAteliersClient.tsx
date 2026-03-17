"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GraduationCap, Plus, Clock3, Users, CalendarDays, AlertCircle } from "lucide-react";
import { useUIStore } from "@/lib/stores/useUIStore";
import { getCategoryLabel, formatDuration } from "@/lib/atelier-config";
import type { BookingLine } from "@/app/actions/bookings";
import type { MesAtelierItem } from "@/app/actions/marketplace";

/* ─── D.6 — « Mes Ateliers » (freelance) ─────────────────────────
   Freelance manages their proposed workshops.
   Tabs: Actifs / Brouillons / Archivés
   ─────────────────────────────────────────────────────────────── */

interface MesAteliersClientProps {
    ateliers: MesAtelierItem[];
    serviceBookings: BookingLine[];
    error?: string;
}

function AtelierRow({ atelier }: { atelier: MesAtelierItem }) {
    const pricingLabel =
        atelier.pricingType === "QUOTE"
            ? "Sur devis"
            : atelier.pricingType === "PER_PARTICIPANT" && atelier.pricePerParticipant
                ? `${atelier.pricePerParticipant} €/participant`
                : `${atelier.price} € / session`;

    const slotsCount = Array.isArray(atelier.slots) ? atelier.slots.length : 0;

    return (
        <GlassCard className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <GlassCardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-violet-50))] flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-[hsl(var(--color-violet-600))]" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <Link href={`/marketplace/services/${atelier.id}`} className="hover:underline">
                                <h3 className="text-heading-xs font-semibold truncate">{atelier.title}</h3>
                            </Link>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                <Badge variant="success">Actif</Badge>
                                <Badge variant="outline" className="border-[hsl(var(--teal)/0.5)] text-[hsl(var(--teal))]">
                                    {atelier.type === "TRAINING" ? "Formation" : "Atelier"}
                                </Badge>
                                {atelier.category && <span>{getCategoryLabel(atelier.category)}</span>}
                                <span className="inline-flex items-center gap-1">
                                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                                    {formatDuration(atelier.durationMinutes)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Users className="h-3 w-3" aria-hidden="true" />
                                    {atelier.capacity} pers.
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" aria-hidden="true" />
                                    {slotsCount} créneau{slotsCount > 1 ? "x" : ""}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tarif</p>
                        <p className="text-sm font-semibold">{pricingLabel}</p>
                    </div>
                </div>
            </GlassCardContent>
        </GlassCard>
    );
}

export function MesAteliersClient({ ateliers, serviceBookings, error }: MesAteliersClientProps) {
    const openPublishModal = useUIStore((s) => s.openPublishModal);

    const pendingCount = serviceBookings.filter((line) => line.status === "PENDING").length;
    const confirmedCount = serviceBookings.filter((line) => line.status === "CONFIRMED").length;
    const completedCount = serviceBookings.filter((line) => line.status === "COMPLETED" || line.status === "PAID").length;

    if (error) {
        return (
            <EmptyState
                icon={AlertCircle}
                title="Impossible de charger vos ateliers"
                description={error}
                primaryAction={{ label: "Retour au dashboard", href: "/dashboard" }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Freelance</p>
                    <h1 className="font-display text-heading-xl tracking-tight">
                        Mes ateliers {ateliers.length > 0 && <span className="text-muted-foreground">({ateliers.length})</span>}
                    </h1>
                </div>
                <Button variant="default" className="gap-2 min-h-[44px]" onClick={openPublishModal}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Créer un atelier
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <GlassCard>
                    <GlassCardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Demandes en attente</p>
                        <p className="text-2xl font-bold">{pendingCount}</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard>
                    <GlassCardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Réservations confirmées</p>
                        <p className="text-2xl font-bold">{confirmedCount}</p>
                    </GlassCardContent>
                </GlassCard>
                <GlassCard>
                    <GlassCardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Ateliers réalisés</p>
                        <p className="text-2xl font-bold">{completedCount}</p>
                    </GlassCardContent>
                </GlassCard>
            </div>

            {ateliers.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="Vous n'avez pas encore publié d'atelier"
                    description="Proposez votre premier atelier pour recevoir des demandes de réservation."
                    primaryAction={{ label: "Découvrir le catalogue ateliers", href: "/marketplace" }}
                />
            ) : (
                <div className="space-y-3">
                    {ateliers.map((atelier) => (
                        <AtelierRow key={atelier.id} atelier={atelier} />
                    ))}
                </div>
            )}
        </div>
    );
}
