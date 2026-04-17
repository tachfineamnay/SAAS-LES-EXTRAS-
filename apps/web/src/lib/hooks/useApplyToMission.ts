"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyToMission } from "@/app/actions/missions";

export function useApplyToMission() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const apply = (missionId: string) => {
    startTransition(async () => {
      const result = await applyToMission(missionId);

      if (result.ok) {
        setAppliedIds((prev) => {
          const next = new Set(prev);
          next.add(missionId);
          return next;
        });
        toast.success("Candidature envoyée !", {
          description: "L'établissement a été notifié de votre intérêt.",
        });
        router.refresh();
        return;
      }

      if (result.error?.includes("déjà postulé")) {
        setAppliedIds((prev) => {
          const next = new Set(prev);
          next.add(missionId);
          return next;
        });
        toast.info("Déjà postulé", { description: result.error });
        return;
      }

      toast.error("Impossible de postuler", {
        description: result.error ?? "Une erreur est survenue.",
      });
    });
  };

  return {
    apply,
    isPending,
    hasApplied: (missionId: string) => appliedIds.has(missionId),
  };
}
