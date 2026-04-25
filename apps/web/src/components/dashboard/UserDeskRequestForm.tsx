"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  createUserDeskRequest,
  type UserDeskRequestType,
} from "@/app/actions/desk";
import {
  USER_MANUAL_DESK_REQUEST_TYPES,
  getDeskRequestTypeLabel,
} from "@/lib/desk-labels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function UserDeskRequestForm() {
  const [type, setType] = useState<UserDeskRequestType>("TECHNICAL_ISSUE");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSubmit = !isPending && message.trim().length >= 5;

  const handleSubmit = () => {
    if (!canSubmit) return;

    startTransition(async () => {
      const result = await createUserDeskRequest(type, message.trim());

      if (!result.ok) {
        toast.error(result.error ?? "Envoi impossible.");
        return;
      }

      toast.success("Votre demande a été transmise au Desk.");
      setType("TECHNICAL_ISSUE");
      setMessage("");
    });
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Créer une demande Desk</h2>
        <p className="text-xs text-muted-foreground">
          Pour un souci technique, un signalement ou un litige, l&apos;équipe traite votre demande sans contact direct hors plateforme.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Type
          </span>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={type}
            onChange={(event) => setType(event.target.value as UserDeskRequestType)}
          >
            {USER_MANUAL_DESK_REQUEST_TYPES.map((requestType) => (
              <option key={requestType} value={requestType}>
                {getDeskRequestTypeLabel(requestType)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Message
          </span>
          <Textarea
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Décrivez le blocage ou le contexte utile au Desk…"
          />
        </label>
      </div>

      <Button
        variant="teal"
        size="sm"
        className="gap-2"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Envoi…" : "Envoyer au Desk"}
      </Button>
    </section>
  );
}
