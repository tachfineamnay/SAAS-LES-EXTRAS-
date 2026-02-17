"use client";

import { MissionCard, type MissionCardProps } from "@/components/cards/MissionCard";
import { ServiceCard, type ServiceCardProps } from "@/components/cards/ServiceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUIStore } from "@/lib/stores/useUIStore";

type MarketListProps = {
  missions: MissionCardProps["mission"][];
  services: ServiceCardProps["service"][];
};

export function MarketList({ missions, services }: MarketListProps) {
  const userRole = useUIStore((state) => state.userRole);
  const isTalent = userRole === "TALENT";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isTalent
            ? "Opportunités SOS disponibles pour les intervenants."
            : "Ateliers et formations disponibles à la réservation."}
        </p>
      </div>

      {isTalent ? (
        missions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Aucune mission ouverte</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Les nouvelles urgences apparaîtront ici dès leur publication.
            </CardContent>
          </Card>
        )
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
