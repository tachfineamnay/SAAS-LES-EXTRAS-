"use client";

import { useState } from "react";
import { SerializedService, SerializedFreelance } from "@/app/actions/marketplace";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { FreelanceCard } from "./FreelanceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, Users, X } from "lucide-react";
import { ATELIER_CATEGORIES } from "@/lib/atelier-config";
import { Button } from "@/components/ui/button";

interface EstablishmentCatalogueProps {
  services: SerializedService[];
  freelances: SerializedFreelance[];
}

export function EstablishmentCatalogue({ services, freelances }: EstablishmentCatalogueProps) {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPricing, setFilterPricing] = useState<string | null>(null);

  const filteredServices = services.filter((s) => {
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterPricing && s.pricingType !== filterPricing) return false;
    return true;
  });

  // Build the list of categories actually present in the data
  const presentCategories = ATELIER_CATEGORIES.filter((cat) =>
    services.some((s) => s.category === cat.id),
  );

  const hasFilters = filterCategory !== null || filterPricing !== null;

  const clearFilters = () => {
    setFilterCategory(null);
    setFilterPricing(null);
  };

  return (
    <div className="space-y-6">
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
            {services.length > 0 && (
              <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 font-semibold">
                {services.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="freelances" className="gap-2 min-h-[40px]">
            <Users className="h-4 w-4" aria-hidden="true" />
            Annuaire des Extras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6 space-y-4">
          {/* Filters */}
          {(presentCategories.length > 0 || services.length > 0) && (
            <div className="space-y-3">
              {/* Category filter */}
              {presentCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground font-medium">Catégorie :</span>
                  {presentCategories.map((cat) => {
                    const Icon = cat.icon;
                    const active = filterCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(active ? null : cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Pricing filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground font-medium">Tarif :</span>
                {[
                  { id: "SESSION", label: "Forfait séance" },
                  { id: "PER_PARTICIPANT", label: "Par participant" },
                  { id: "QUOTE", label: "Sur devis" },
                ].map((opt) => {
                  const active = filterPricing === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFilterPricing(active ? null : opt.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}

                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 gap-1 text-xs text-muted-foreground"
                  >
                    <X className="w-3 h-3" /> Effacer
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {filteredServices.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={hasFilters ? "Aucun atelier pour ces filtres" : "Aucune formation disponible"}
              description={
                hasFilters
                  ? "Essayez de modifier vos filtres."
                  : "Les ateliers et formations seront bientôt disponibles."
              }
              tips="Revenez régulièrement pour découvrir les nouvelles offres."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="freelances" className="mt-6">
          {freelances.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun freelance disponible"
              description="Aucun freelance vérifié n'est disponible pour le moment."
              primaryAction={{ label: "Demander un renfort SOS", href: "/dashboard" }}
              tips="Nos équipes valident les profils régulièrement."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {freelances.map((freelance) => (
                <FreelanceCard key={freelance.id} freelance={freelance} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
