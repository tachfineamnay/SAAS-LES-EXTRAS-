"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Building2, Award, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { applyToMission, MissionStatus } from "@/app/actions/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MissionCardProps = {
  mission: {
    id: string;
    title: string;
    dateStart: string;
    dateEnd: string;
    address: string;
    hourlyRate: number;
    status: MissionStatus;
    isRenfort?: boolean;
    isUrgent?: boolean;
    isNetworkMatch?: boolean;
    establishmentName?: string;
    requiredDiploma?: string[];
  };
  isVerified?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function MissionCard({ mission, isVerified = true }: MissionCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dateStart = new Date(mission.dateStart);
  const dateEnd = new Date(mission.dateEnd);

  const handleApply = () => {
    if (!isVerified) return;

    startTransition(async () => {
      try {
        await applyToMission(mission.id);
        toast.success("Candidature envoyée !");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Impossible d'envoyer votre candidature.",
        );
      }
    });
  };

  return (
    <Card className={cn("flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-all", mission.isUrgent && "border-red-200 bg-red-50/10")}>
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {mission.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{mission.establishmentName || "Établissement"}</span>
            </div>
          </div>
          {mission.isUrgent && (
            <Badge variant="destructive" className="shrink-0 animate-pulse text-[10px] px-2 py-0.5 h-6">
              <Zap className="h-3 w-3 mr-1" />
              Renfort Immédiat
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {mission.isNetworkMatch && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Déjà intervenu
            </Badge>
          )}
          {mission.requiredDiploma?.map(d => (
            <Badge key={d} variant="outline" className="text-[10px] text-muted-foreground">
              {d}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-2">
        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1 p-2 rounded-md bg-muted/40">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Date
            </span>
            <span className="font-medium">{dateFormatter.format(dateStart)}</span>
          </div>
          <div className="flex flex-col gap-1 p-2 rounded-md bg-muted/40">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock3 className="h-3 w-3" /> Horaire
            </span>
            <span className="font-medium">
              {timeFormatter.format(dateStart)} - {timeFormatter.format(dateEnd)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-dashed">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary/70" />
            <span className="truncate max-w-[140px]">{mission.address.split(',')[0]}</span>
          </div>
          <div className="text-lg font-bold text-primary">
            {moneyFormatter.format(mission.hourlyRate)}
            <span className="text-xs font-normal text-muted-foreground ml-1">/ h</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {isVerified ? (
          <Button className="w-full" onClick={handleApply} disabled={isPending} size="lg">
            {isPending ? "Envoi..." : "Postuler"}
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="w-full">
                  <Button className="w-full" disabled variant="secondary" size="lg">
                    Postuler
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Veuillez compléter votre profil pour postuler</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
}
