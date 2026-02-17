"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { toast } from "sonner";
import { applyToMission } from "@/app/actions/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type MissionCardProps = {
  mission: {
    id: string;
    title: string;
    dateStart: string;
    dateEnd: string;
    address: string;
    hourlyRate: number;
    status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  };
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function getCity(address: string): string {
  const city = address
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .at(-1);

  return city ?? address;
}

export function MissionCard({ mission }: MissionCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dateStart = new Date(mission.dateStart);
  const dateEnd = new Date(mission.dateEnd);

  const handleApply = () => {
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
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <Badge className="w-fit bg-red-600 text-white hover:bg-red-700">Urgence</Badge>
        <CardTitle className="text-lg">{mission.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>{dateFormatter.format(dateStart)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          <span>
            {timeFormatter.format(dateStart)} - {timeFormatter.format(dateEnd)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{getCity(mission.address)}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold text-foreground">
          {moneyFormatter.format(mission.hourlyRate)}
          <span className="ml-1 text-sm font-medium text-muted-foreground">/ h</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleApply} disabled={isPending}>
          {isPending ? "Envoi..." : "Postuler"}
        </Button>
      </CardFooter>
    </Card>
  );
}
