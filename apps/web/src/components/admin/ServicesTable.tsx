"use client";

import { useState, useTransition } from "react";
import { Star, EyeOff, Eye, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  featureService,
  getAdminServices,
  hideService,
  type AdminServiceRow,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ServicesTableProps = {
  services: AdminServiceRow[];
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function getTypeLabel(type: AdminServiceRow["type"]): string {
  return type === "WORKSHOP" ? "Atelier" : "Formation";
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [rows, setRows] = useState<AdminServiceRow[]>(services);
  const [selectedService, setSelectedService] = useState<AdminServiceRow | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenDetails = (service: AdminServiceRow) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const refreshRows = async () => {
    const nextRows = await getAdminServices();
    setRows(nextRows);
    if (selectedService) {
      const nextSelected = nextRows.find((item) => item.id === selectedService.id) ?? null;
      setSelectedService(nextSelected);
    }
  };

  const handleToggleFeature = (serviceId: string) => {
    startTransition(async () => {
      try {
        await featureService(serviceId);
        await refreshRows();
        toast.success("Mise en avant mise à jour.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de modifier la mise en avant.");
      }
    });
  };

  const handleToggleHide = (serviceId: string) => {
    startTransition(async () => {
      try {
        await hideService(serviceId);
        await refreshRows();
        toast.success("Visibilité du service mise à jour.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de modifier la visibilité.");
      }
    });
  };

  return (
    <>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Talent</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  Aucun service à modérer.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((service) => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer"
                  onClick={() => handleOpenDetails(service)}
                >
                  <TableCell className="font-medium text-slate-900">{service.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{service.talentName}</TableCell>
                  <TableCell className="text-sm text-slate-900">
                    {moneyFormatter.format(service.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTypeLabel(service.type)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={service.isFeatured ? "secondary" : "outline"}
                        disabled={isPending}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleToggleFeature(service.id);
                        }}
                      >
                        <Star className="h-4 w-4" />
                        {service.isFeatured ? "En avant" : "Mettre en avant"}
                      </Button>
                      <Button
                        size="sm"
                        variant={service.isHidden ? "secondary" : "outline"}
                        disabled={isPending}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleToggleHide(service.id);
                        }}
                      >
                        {service.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        {service.isHidden ? "Afficher" : "Masquer"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Détail service</SheetTitle>
            <SheetDescription>Lecture rapide du contenu publié.</SheetDescription>
          </SheetHeader>

          {selectedService ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Titre</p>
                <p className="text-base font-medium text-slate-900">{selectedService.title}</p>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="h-4 w-4" />
                <span>
                  {selectedService.talentName} ({selectedService.talentEmail})
                </span>
              </div>

              <div className="rounded-md border bg-slate-50 p-3">
                <p className="text-xs text-muted-foreground">Description complète</p>
                <p className="mt-1">
                  {selectedService.description?.trim() || "Aucune description fournie."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-md border bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Prix</p>
                  <p className="font-medium">{moneyFormatter.format(selectedService.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{getTypeLabel(selectedService.type)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mise en avant</p>
                  <p className="font-medium">{selectedService.isFeatured ? "Oui" : "Non"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visibilité</p>
                  <p className="font-medium">{selectedService.isHidden ? "Masqué" : "Visible"}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Publié le {dateFormatter.format(new Date(selectedService.createdAt))}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
