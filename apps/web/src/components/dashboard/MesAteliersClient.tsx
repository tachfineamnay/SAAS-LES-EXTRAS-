"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GraduationCap, Plus, Star, Calendar, MoreHorizontal, Pencil, BarChart3 } from "lucide-react";

/* ─── D.6 — « Mes Ateliers » (freelance) ─────────────────────────
   Freelance manages their proposed workshops.
   Tabs: Actifs / Brouillons / Archivés
   ─────────────────────────────────────────────────────────────── */

interface Atelier {
    id: string;
    title: string;
    rating: number | null;
    sessionsCount: number;
    revenue: number;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    lastBookedAt?: string;
}

interface MesAteliersClientProps {
    ateliers: Atelier[];
}

function AtelierRow({ atelier }: { atelier: Atelier }) {
    return (
        <GlassCard className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <GlassCardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-violet-50))] flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-[hsl(var(--color-violet-600))]" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-heading-xs font-semibold truncate">{atelier.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                {atelier.rating != null && (
                                    <span className="inline-flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" aria-hidden="true" />
                                        {atelier.rating.toFixed(1)}
                                    </span>
                                )}
                                <span>{atelier.sessionsCount} sessions</span>
                                <span>{atelier.revenue} €</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge
                            variant={atelier.status === "ACTIVE" ? "success" : atelier.status === "DRAFT" ? "warning" : "quiet"}
                        >
                            {atelier.status === "ACTIVE" ? "Actif" : atelier.status === "DRAFT" ? "Brouillon" : "Archivé"}
                        </Badge>
                        {atelier.lastBookedAt && (
                            <span className="hidden sm:inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" aria-hidden="true" />
                                Dernière résa {new Date(atelier.lastBookedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" asChild>
                            <Link href={`/dashboard/ateliers/${atelier.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Modifier
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" asChild>
                            <Link href={`/dashboard/ateliers/${atelier.id}/stats`}>
                                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                                Stats
                            </Link>
                        </Button>
                    </div>
                </div>
            </GlassCardContent>
        </GlassCard>
    );
}

export function MesAteliersClient({ ateliers }: MesAteliersClientProps) {
    const actifs = ateliers.filter((a) => a.status === "ACTIVE");
    const brouillons = ateliers.filter((a) => a.status === "DRAFT");
    const archives = ateliers.filter((a) => a.status === "ARCHIVED");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-overline uppercase tracking-widest text-muted-foreground">Espace Freelance</p>
                    <h1 className="font-display text-heading-xl tracking-tight">
                        Mes Ateliers {ateliers.length > 0 && <span className="text-muted-foreground">({ateliers.length})</span>}
                    </h1>
                </div>
                <Button variant="default" className="gap-2 min-h-[44px]" asChild>
                    <Link href="/dashboard/ateliers/new">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Créer un atelier
                    </Link>
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="actifs" className="w-full">
                <TabsList className="h-11 glass-surface border border-border/40">
                    <TabsTrigger value="actifs" className="gap-2 min-h-[40px]">
                        Actifs
                        {actifs.length > 0 && (
                            <span className="ml-1 text-[10px] bg-[hsl(var(--color-teal-50))] text-[hsl(var(--color-teal-700))] rounded-full px-1.5 py-0.5 font-semibold">
                                {actifs.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="brouillons" className="gap-2 min-h-[40px]">
                        Brouillons
                        {brouillons.length > 0 && (
                            <span className="ml-1 text-[10px] bg-[hsl(var(--color-sand-100))] text-[hsl(var(--color-sand-700))] rounded-full px-1.5 py-0.5 font-semibold">
                                {brouillons.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="archives" className="gap-2 min-h-[40px]">
                        Archivés
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="actifs" className="mt-6 space-y-3">
                    {actifs.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Vous n'avez pas encore créé d'atelier"
                            description="Partagez votre expertise avec les établissements."
                            primaryAction={{ label: "Créer mon premier atelier", href: "/dashboard/ateliers/new" }}
                        />
                    ) : (
                        actifs.map((a) => <AtelierRow key={a.id} atelier={a} />)
                    )}
                </TabsContent>

                <TabsContent value="brouillons" className="mt-6 space-y-3">
                    {brouillons.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Aucun brouillon"
                            description="Vos ateliers en cours de rédaction apparaîtront ici."
                        />
                    ) : (
                        brouillons.map((a) => <AtelierRow key={a.id} atelier={a} />)
                    )}
                </TabsContent>

                <TabsContent value="archives" className="mt-6 space-y-3">
                    {archives.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Aucun atelier archivé"
                            description="Les ateliers que vous archivez seront listés ici."
                        />
                    ) : (
                        archives.map((a) => <AtelierRow key={a.id} atelier={a} />)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
