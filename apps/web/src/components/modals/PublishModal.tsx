"use client";

import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { createServiceFromPublish } from "@/app/actions/marketplace";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/stores/useUIStore";

type OfferType = "atelier" | "formation";

const defaultForm = {
  title: "",
  description: "",
  price: "",
  capacity: "",
};

export function PublishModal() {
  const isOpen = useUIStore((state) => state.isPublishModalOpen);
  const openPublishModal = useUIStore((state) => state.openPublishModal);
  const closePublishModal = useUIStore((state) => state.closePublishModal);
  const [offerType, setOfferType] = useState<OfferType>("atelier");
  const [form, setForm] = useState(defaultForm);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setOfferType("atelier");
    setForm(defaultForm);
  };

  const handleClose = () => {
    closePublishModal();
    resetForm();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const price = Number(form.price);
        const capacity = Number(form.capacity);

        if (!Number.isFinite(price) || price <= 0) {
          throw new Error("Prix forfaitaire invalide.");
        }

        if (!Number.isFinite(capacity) || capacity < 1) {
          throw new Error("Capacité invalide.");
        }

        await createServiceFromPublish({
          title: form.title,
          description: form.description,
          price,
          capacity,
          type: offerType === "atelier" ? "WORKSHOP" : "TRAINING",
        });

        toast.success("Offre publiée !");
        handleClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de publier l'offre.");
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openPublishModal();
          return;
        }
        handleClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Publier une Offre</DialogTitle>
          <DialogDescription>Créez votre atelier ou formation en quelques secondes.</DialogDescription>
        </DialogHeader>

        <Tabs value={offerType} onValueChange={(value) => setOfferType(value as OfferType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="atelier">Atelier</TabsTrigger>
            <TabsTrigger value="formation">Formation</TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="publish-title">Titre</Label>
            <Input
              id="publish-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex: Atelier cuisine méditerranéenne"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publish-description">Description</Label>
            <Textarea
              id="publish-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Expliquez le contenu de l'offre..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publish-price">Prix Forfaitaire</Label>
              <Input
                id="publish-price"
                type="number"
                min="1"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publish-capacity">Capacité max</Label>
              <Input
                id="publish-capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isPending}
            >
              {isPending ? "Publication..." : "Mettre en ligne"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
