"use client";

import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { createMissionFromSOS } from "@/app/actions/marketplace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUIStore } from "@/lib/stores/useUIStore";

const defaultForm = {
  role: "",
  dateTime: "",
  location: "",
  hourlyRate: "",
};

export function SOSModal() {
  const isOpen = useUIStore((state) => state.isSOSModalOpen);
  const openSOSModal = useUIStore((state) => state.openSOSModal);
  const closeSOSModal = useUIStore((state) => state.closeSOSModal);
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => setForm(defaultForm);

  const handleClose = () => {
    closeSOSModal();
    resetForm();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        if (!form.role) {
          throw new Error("Veuillez sélectionner un poste recherché.");
        }

        const dateStart = new Date(form.dateTime);
        if (Number.isNaN(dateStart.getTime())) {
          throw new Error("Date invalide.");
        }

        const dateEnd = new Date(dateStart.getTime() + 8 * 60 * 60 * 1000);
        const hourlyRate = Number(form.hourlyRate);
        if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
          throw new Error("Tarif horaire invalide.");
        }

        await createMissionFromSOS({
          title: form.role,
          dateStart: dateStart.toISOString(),
          dateEnd: dateEnd.toISOString(),
          address: form.location,
          hourlyRate,
        });

        toast.success("Alerte SOS diffusée !");
        handleClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de créer la mission SOS.");
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openSOSModal();
          return;
        }
        handleClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Lancer un SOS</DialogTitle>
          <DialogDescription>Décrivez votre besoin urgent, on diffuse immédiatement.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="sos-role">Poste recherché</Label>
            <Select
              value={form.role}
              onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger id="sos-role">
                <SelectValue placeholder="Sélectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serveur">Serveur</SelectItem>
                <SelectItem value="chef-de-rang">Chef de rang</SelectItem>
                <SelectItem value="cuisinier">Cuisinier</SelectItem>
                <SelectItem value="plongeur">Plongeur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sos-datetime">Date & Heure</Label>
            <Input
              id="sos-datetime"
              type="datetime-local"
              value={form.dateTime}
              onChange={(event) => setForm((prev) => ({ ...prev, dateTime: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sos-location">Lieu</Label>
            <Input
              id="sos-location"
              value={form.location}
              placeholder="Adresse de l'établissement"
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sos-rate">Tarif Horaire</Label>
            <Input
              id="sos-rate"
              type="number"
              min="1"
              value={form.hourlyRate}
              placeholder="Ex: 22"
              onChange={(event) => setForm((prev) => ({ ...prev, hourlyRate: event.target.value }))}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? "Diffusion..." : "Diffuser l'alerte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
