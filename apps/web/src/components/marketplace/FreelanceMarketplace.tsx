"use client";

import { useState } from "react";
import type { SerializedMission, SerializedService } from "@/app/actions/marketplace";
import { FreelanceJobBoard } from "./FreelanceJobBoard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, GraduationCap, X } from "lucide-react";
import { ATELIER_CATEGORIES } from "@/lib/atelier-config";
import { Button } from "@/components/ui/button";

interface FreelanceMarketplaceProps {
  missions: SerializedMission[];
  services: SerializedService[];
}

export function FreelanceMarketplace({ missions, services }: FreelanceMarketplaceProps) {
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPricing, setFilterPricing] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"WORKSHOP" | "TRAINING" | null>(null);

  const filteredServices = services.filter((s) => {
    if (filterType && s.type !== filterType) return false;
    if (filterCategory && s.category !== filterCategory) return false;
    if (filterPricing && s.pricingType !== filterPricing) return false;
    return true;
  });

  const presentCategories = ATELIER_CATEGORIES.filter((cat) =>
    services.some((s) => s.category === cat.id),
  );

  const hasFilters = filterCategory !== null || filterPricing !== null || filterType !== null;

  const clearFilters = () => {
    setFilterCategory(null);
    setFilterPricing(null);
    setFilterType(null);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Marketplace
        </p>
        <h1 className="font-display text-heading-xl tracking-tight">
          Missions & Services
        </h1>
        <p className="text-sm text-muted-foreground">
          Trouvez des missions de renfort et découvrez les ateliers et formations disponibles.
        </p>
      </header>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="h-11 glass-surface border border-border/40">
          <TabsTrigger value="missions" className="gap-2 min-h-[40px]">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Missions de renfort
            {missions.length > 0 && (
              <span className="ml-1 text-[10px] bg-[hsl(var(--color-teal-50))] text-[hsl(var(--color-teal-700))] rounded-full px-1.5 py-0.5 font-semibold">
                {missions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2 min-h-[40px]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Ateliers & Formations
            {services.length > 0 && (
              <span className="ml-1 text-[10px] bg-[hsl(var(--color-teal-50))] text-[hsl(var(--color-teal-700))] rounded-full px-1.5 py-0.5 font-semibold">
                {services.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="mt-6">
          <FreelanceJobBoard missions={missions} hideHeader />
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-4">
          {/* Filters */}
          {(presentCategories.length > 0 || services.length > 0) && (
            <div className="space-y-3">
              {/* Type filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground font-medium">Type :</span>
                {(["WORKSHOP", "TRAINING"] as const).map((t) => {
                  const active = filterType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterType(active ? null : t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-[hsl(var(--color-teal-600))] text-white border-[hsl(var(--color-teal-600))]"
                          : "border-border text-muted-foreground hover:border-[hsl(var(--color-teal-300))] hover:text-[hsl(var(--color-teal-600))]"
                      }`}
                    >
                      {t === "WORKSHOP" ? "Ateliers" : "Formations"}
                    </button>
                  );
                })}
              </div>

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
                            ? "bg-[hsl(var(--color-teal-600))] text-white border-[hsl(var(--color-teal-600))]"
                            : "border-border text-muted-foreground hover:border-[hsl(var(--color-teal-300))] hover:text-[hsl(var(--color-teal-600))]"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              )}

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
                          ? "bg-[hsl(var(--color-teal-600))] text-white border-[hsl(var(--color-teal-600))]"
                          : "border-border text-muted-foreground hover:border-[hsl(var(--color-teal-300))] hover:text-[hsl(var(--color-teal-600))]"
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
              title={hasFilters ? "Aucun résultat pour ces filtres" : "Aucun atelier ou formation disponible"}
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
      </Tabs>
    </div>
  );
}
