"use client";

import { RenfortCard } from "@/components/ui/renfort-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { useUIStore } from "@/lib/stores/useUIStore";

/* ─── E.6.3 — Matching Missions Widget ───────────────────────────
   Shows 3 compact Renfort Cards for new missions matching the
   freelance's profile, with a CTA to view all missions.
   ─────────────────────────────────────────────────────────────── */

export interface MatchingMission {
  id: string;
  title: string;
  establishment: string;
  city: string;
  dates?: string;
  hours?: string;
  rate?: string;
  urgent?: boolean;
}

interface MatchingMissionsWidgetProps {
  missions: MatchingMission[];
}

export function MatchingMissionsWidget({ missions }: MatchingMissionsWidgetProps) {
  const openApplyModal = useUIStore((s) => s.openApplyModal);

  if (missions.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Aucune nouvelle mission"
        description="Pas de mission correspondante pour l'instant. Revenez bientôt."
        primaryAction={{ label: "Voir toutes les missions", href: "/marketplace" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {missions.slice(0, 3).map((m) => (
          <RenfortCard
            key={m.id}
            variant={m.urgent ? "urgent" : "normal"}
            title={m.title}
            establishment={m.establishment}
            city={m.city}
            dates={m.dates}
            hours={m.hours}
            rate={m.rate}
            actionLabel="Postuler"
            onAction={() => openApplyModal(m.id)}
            href={`/marketplace/missions/${m.id}`}
          />
        ))}
      </div>

      <Button variant="glass" size="sm" className="w-full min-h-[44px]" asChild>
        <Link href="/marketplace">
          Voir toutes les missions
          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
