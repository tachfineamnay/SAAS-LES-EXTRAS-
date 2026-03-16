"use client";

import { useUIStore } from "@/lib/stores/useUIStore";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface MissionApplyButtonProps {
  missionId: string;
  className?: string;
}

export function MissionApplyButton({ missionId, className }: MissionApplyButtonProps) {
  const openApplyModal = useUIStore((s) => s.openApplyModal);

  return (
    <Button
      variant="action"
      size="lg"
      className={`w-full gap-2 font-bold ${className ?? ""}`}
      onClick={() => openApplyModal(missionId)}
    >
      <Zap className="h-4 w-4 fill-current" aria-hidden="true" />
      Postuler à cette mission
    </Button>
  );
}
