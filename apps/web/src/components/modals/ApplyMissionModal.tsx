"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/stores/useUIStore";
import { applyToMission } from "@/app/actions/missions";
import { HOURLY_RATE_MIN, HOURLY_RATE_MAX, HOURLY_RATE_DEFAULT } from "@/lib/sos-config";

// ─── Schema ──────────────────────────────────────────────────────────────────

const applySchema = z.object({
  motivation: z
    .string()
    .min(20, "La lettre de motivation doit faire au moins 20 caractères")
    .max(1000, "Maximum 1000 caractères"),
  proposedRate: z
    .number()
    .min(HOURLY_RATE_MIN, `Minimum ${HOURLY_RATE_MIN} €/h`)
    .max(HOURLY_RATE_MAX, `Maximum ${HOURLY_RATE_MAX} €/h`),
});

type ApplyForm = z.infer<typeof applySchema>;

// ─── Component ───────────────────────────────────────────────────────────────

export function ApplyMissionModal() {
  const isOpen = useUIStore((state) => state.isApplyModalOpen);
  const missionId = useUIStore((state) => state.applyMissionId);
  const closeApplyModal = useUIStore((state) => state.closeApplyModal);
  const router = useRouter();

  const form = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      motivation: "",
      proposedRate: HOURLY_RATE_DEFAULT,
    },
  });

  const handleClose = () => {
    closeApplyModal();
    form.reset();
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (!missionId) return;
    try {
      const result = await applyToMission(missionId, {
        motivation: data.motivation,
        proposedRate: data.proposedRate,
      });

      if (result.ok) {
        toast.success("Candidature envoyée !", {
          description: "L'établissement a été notifié de votre intérêt.",
        });
        handleClose();
        router.refresh();
      } else if (result.error?.includes("déjà postulé")) {
        toast.info("Déjà postulé", { description: result.error });
        handleClose();
      } else {
        toast.error("Erreur", { description: result.error || "Impossible de postuler." });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de postuler.");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Postuler à cette mission</DialogTitle>
          <DialogDescription>
            Présentez-vous et proposez votre taux horaire. L'établissement recevra votre candidature immédiatement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Motivation */}
          <div className="space-y-2">
            <Label htmlFor="motivation">Lettre de motivation</Label>
            <Textarea
              id="motivation"
              placeholder="Présentez votre expérience et votre motivation pour ce poste…"
              rows={5}
              {...form.register("motivation")}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{form.formState.errors.motivation?.message ?? ""}</span>
              <span>{form.watch("motivation").length} / 1000</span>
            </div>
          </div>

          {/* Proposed rate slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Taux horaire proposé</Label>
              <span className="text-lg font-bold text-primary">
                {form.watch("proposedRate")} €/h
              </span>
            </div>
            <input
              type="range"
              aria-label="Taux horaire proposé"
              min={HOURLY_RATE_MIN}
              max={HOURLY_RATE_MAX}
              step={1}
              value={form.watch("proposedRate")}
              onChange={(e) =>
                form.setValue("proposedRate", Number(e.target.value), { shouldValidate: true })
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{HOURLY_RATE_MIN} €</span>
              <span>{HOURLY_RATE_MAX} €</span>
            </div>
            {form.formState.errors.proposedRate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.proposedRate.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {form.formState.isSubmitting ? "Envoi…" : "Envoyer ma candidature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
