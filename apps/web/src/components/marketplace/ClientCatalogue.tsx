
"use client";

import { SerializedService, SerializedTalent } from "@/app/actions/marketplace";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { TalentCard } from "./TalentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCardProps } from "@/components/cards/ServiceCard"; // Ensure this import

interface ClientCatalogueProps {
    services: SerializedService[];
    talents: SerializedTalent[];
}

export function ClientCatalogue({ services, talents }: ClientCatalogueProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Catalogue & Annuaire</h1>
                <p className="text-muted-foreground">Découvrez nos formations et nos meilleurs talents.</p>
            </div>

            <Tabs defaultValue="services" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="services">Ateliers & Formations</TabsTrigger>
                    <TabsTrigger value="talents">Annuaire des Extras</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-6">
                    {services.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground">Aucun service disponible pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {services.map((service) => (
                                // Cast to any or fix ServiceCardProps if distinct types
                                <ServiceCard key={service.id} service={service as any} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="talents" className="mt-6">
                    {talents.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground">Aucun talent vérifié disponible pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
