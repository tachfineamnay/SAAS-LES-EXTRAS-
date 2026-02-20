"use client";

import Link from "next/link";
import { Clock3, Users, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming AvatarImage exists
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ServiceCardProps = {
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    type: "WORKSHOP" | "TRAINING";
    capacity: number;
    owner?: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
        avatar: string | null;
        jobTitle: string | null;
      } | null;
    };
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

function getServiceColor(type: "WORKSHOP" | "TRAINING"): string {
  return type === "WORKSHOP"
    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
    : "bg-purple-100 text-purple-700 hover:bg-purple-200";
}

function getAvatarFallback(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ServiceCard({ service }: ServiceCardProps) {
  const ownerName = service.owner?.profile
    ? `${service.owner.profile.firstName} ${service.owner.profile.lastName}`
    : "Freelance";

  const ownerJob = service.owner?.profile?.jobTitle || "Expert";

  return (
    <Link href={`/marketplace/services/${service.id}`} className="block h-full group">
      <Card className="flex h-full flex-col border border-border/60 shadow-sm hover:shadow-md transition-all hover:border-primary/50 overflow-hidden">
        <CardHeader className="p-4 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn("font-medium px-2.5 py-0.5 rounded-md", getServiceColor(service.type))}
            >
              {getServiceCategoryLabel(service.type)}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              <Users className="h-3 w-3 mr-1" />
              Max {service.capacity}
            </div>
          </div>

          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1 px-4 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {service.description || "Aucune description disponible pour ce service."}
          </p>

          <div className="flex items-center gap-3 pt-2 mt-auto border-t border-dashed pt-3">
            <Avatar className="h-8 w-8 border">
              {/* Image logic could be here if avatar URL populated */}
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                {getAvatarFallback(ownerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">{ownerName}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-1">{ownerJob}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-muted/30 flex items-center justify-between border-t">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Tarif</span>
            <div className="text-lg font-bold text-foreground">
              {moneyFormatter.format(service.price)}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">HT</span>
            </div>
          </div>

          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
