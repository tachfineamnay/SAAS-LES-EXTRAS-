
"use client";

import { SerializedService, SerializedTalent } from "@/app/actions/marketplace";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { TalentCard } from "./TalentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, Users } from "lucide-react";

interface ClientCatalogueProps {
    services: SerializedService[];
    talents: SerializedTalent[];
}

export function ClientCatalogue({ services, talents }: ClientCatalogueProps) {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Marketplace</p>
                <h1 className="text-3xl font-bold tracking-tight">Catalogue & Annuaire</h1>
                <p className="text-sm text-muted-foreground">
                    Découvrez nos formations, ateliers et meilleurs freelances vérifiés.
                </p>
            </header>

            <Tabs defaultValue="services" className="w-full">
                <TabsList className="h-11 glass-surface border border-border/40">
                    <TabsTrigger value="services" className="gap-2 min-h-[40px]">
                        <GraduationCap className="h-4 w-4" aria-hidden="true" />
                        Ateliers & Formations
                    </TabsTrigger>
                    <TabsTrigger value="talents" className="gap-2 min-h-[40px]">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        Annuaire des Extras
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-6">
                    {services.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Aucune formation disponible"
                            description="Les ateliers et formations seront bientôt disponibles."
                            tips="Revenez régulièrement pour découvrir les nouvelles offres."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service as any} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="talents" className="mt-6">
                    {talents.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Aucun freelance disponible"
                            description="Aucun talent vérifié n'est disponible pour le moment."
                            primaryAction={{ label: "Demander un renfort SOS", href: "/dashboard" }}
                            tips="Nos équipes valident les profils régulièrement."
                        />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {talents.map((talent) => (
                                <TalentCard key={talent.id} talent={talent} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
