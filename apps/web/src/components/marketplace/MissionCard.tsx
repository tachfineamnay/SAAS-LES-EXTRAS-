"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Euro, MapPin, Building2, Sun, Moon, Clock, Loader2, Zap } from "lucide-react";
import { SerializedMission } from "@/app/actions/marketplace";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getMetierById } from "@/lib/sos-config";
import { useUIStore } from "@/lib/stores/useUIStore";

interface MissionCardProps {
  mission: SerializedMission;
  onApply?: (mission: SerializedMission) => void;
}

export function MissionCard({ mission, onApply }: MissionCardProps) {
  const clientName =
    mission.client?.profile?.companyName || "Établissement confidentiel";

  const displayCity =
    mission.city ||
    mission.client?.profile?.city ||
    mission.address.split(",").pop()?.trim() ||
    "Localisation inconnue";

  const metier = mission.metier ? getMetierById(mission.metier) : null;
  const MetierIcon = metier?.icon;

  // Build slots display (from new structure or fallback to single slot)
  const slots =
    mission.slots && Array.isArray(mission.slots) && mission.slots.length > 0
      ? mission.slots
      : [
          {
            date: format(new Date(mission.dateStart), "yyyy-MM-dd"),
            heureDebut: format(new Date(mission.dateStart), "HH:mm"),
            heureFin: format(new Date(mission.dateEnd), "HH:mm"),
          },
        ];

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2 space-y-2">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2 items-center">
          {mission.isUrgent && (
            <Badge variant="destructive" className="text-xs">
              URGENT
            </Badge>
          )}
          {mission.isRenfort && !mission.isUrgent && (
            <Badge variant="secondary" className="text-xs">
              Renfort
            </Badge>
          )}
          {mission.shift && (
            <Badge
              variant="outline"
              className={`text-xs gap-1 ${
                mission.shift === "NUIT"
                  ? "border-indigo-400 text-indigo-600"
                  : "border-amber-400 text-amber-600"
              }`}
            >
              {mission.shift === "NUIT" ? (
                <Moon className="h-3 w-3" />
              ) : (
                <Sun className="h-3 w-3" />
              )}
              {mission.shift === "NUIT" ? "Nuit" : "Jour"}
            </Badge>
          )}
          <span className="ml-auto text-lg font-bold text-primary">
            {mission.hourlyRate}€ /h
          </span>
        </div>

        {/* Métier */}
        <h3 className="font-bold text-base leading-tight line-clamp-2 flex items-center gap-2">
          {MetierIcon && <MetierIcon className="h-4 w-4 shrink-0 text-primary" />}
          {metier ? metier.label : mission.title}
        </h3>

        {/* Établissement */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{clientName}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow space-y-2">
        {/* Créneaux */}
        <div className="space-y-1">
          {slots.slice(0, 2).map((slot, i) => {
            const s = slot as { date: string; heureDebut: string; heureFin: string };
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {s.date
                    ? format(new Date(s.date), "dd MMM", { locale: fr })
                    : "—"}
                  {" · "}
                  <Clock className="h-3 w-3 inline-block mx-0.5" />
                  {s.heureDebut} → {s.heureFin}
                </span>
              </div>
            );
          })}
          {slots.length > 2 && (
            <p className="text-xs text-muted-foreground pl-5">
              +{slots.length - 2} créneau(x) supplémentaire(s)
            </p>
          )}
        </div>

        {/* Localisation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {displayCity}
            {mission.zipCode ? ` (${mission.zipCode})` : ""}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full font-bold gap-2"
          onClick={() => onApply?.(mission)}
        >
          <Zap className="h-4 w-4 fill-current" />
          Postuler
        </Button>
      </CardFooter>
    </Card>
  );
}
