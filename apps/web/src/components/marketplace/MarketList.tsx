"use client";

import { MissionCard, type MissionCardProps } from "@/components/cards/MissionCard";
import { ServiceCard, type ServiceCardProps } from "@/components/cards/ServiceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/useUIStore";
import { Filter, SlidersHorizontal } from "lucide-react";

type MarketListProps = {
  missions: MissionCardProps["mission"][];
  services: ServiceCardProps["service"][];
  isDegraded?: boolean;
  degradedReason?: string;
  isVerified?: boolean;
};

export function MarketList({
  missions,
  services,
  isDegraded = false,
  degradedReason,
  isVerified = true,
}: MarketListProps) {
  const userRole = useUIStore((state) => state.userRole);
  const isTalent = userRole === "TALENT";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTalent
              ? "Missions de Renforts disponibles pour les freelances."
              : "Ateliers et formations disponibles à la réservation."}
          </p>
        </div>

        {isTalent && (
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
              <Filter className="h-3 w-3 mr-1" />
              Tous les diplômes
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              Spécialisation
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
              Date
            </Button>
          </div>
        )}
      </div>

      {isTalent && missions.length > 0 && (
        <div className="mb-2 text-xs text-muted-foreground font-medium">
          {missions.length} mission{missions.length > 1 ? 's' : ''} de renfort disponible{missions.length > 1 ? 's' : ''}
        </div>
      )}

      {isDegraded ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Mode Dégradé</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-800">
            {degradedReason ??
              "Données temporairement indisponibles, veuillez réessayer dans quelques instants."}
          </CardContent>
        </Card>
      ) : null}

      {isTalent ? (
        missions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} isVerified={isVerified} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aucune mission de renfort ouverte</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Les nouvelles urgences apparaîtront ici dès leur publication par les établissements.
            </CardContent>
          </Card>
        )
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucun service disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Revenez plus tard pour découvrir de nouvelles offres.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
