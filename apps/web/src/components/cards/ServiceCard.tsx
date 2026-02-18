"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Users } from "lucide-react";
import { toast } from "sonner";
import { bookService } from "@/app/actions/marketplace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type ServiceCardProps = {
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    type: "WORKSHOP" | "TRAINING";
    capacity: number;
  };
};

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function getServiceCategoryLabel(type: "WORKSHOP" | "TRAINING"): string {
  return type === "WORKSHOP" ? "Atelier" : "Formation";
}

function getServiceDuration(type: "WORKSHOP" | "TRAINING"): string {
  return type === "WORKSHOP" ? "2h" : "4h";
}

function getAvatarFallback(title: string): string {
  return title
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBook = () => {
    startTransition(async () => {
      try {
        await bookService(service.id);
        toast.success("Réservation effectuée !");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Impossible d'effectuer la réservation.",
        );
      }
    });
  };

  return (
    <Card className="flex h-full flex-col border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarFallback>{getAvatarFallback(service.title)}</AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="font-normal">{getServiceCategoryLabel(service.type)}</Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground pb-2">
        {service.description ? <p className="line-clamp-2">{service.description}</p> : null}

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{getServiceDuration(service.type)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Max {service.capacity}</span>
          </div>
        </div>

        <div className="mt-auto text-xl font-bold text-foreground pt-1">
          {moneyFormatter.format(service.price)}
          <span className="ml-1 text-sm font-medium text-muted-foreground">HT</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button className="w-full" onClick={handleBook} disabled={isPending} variant="outline">
          {isPending ? "Réservation..." : "Réserver"}
        </Button>
      </CardFooter>
    </Card>
  );
}
