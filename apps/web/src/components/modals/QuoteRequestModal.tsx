"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarDays, Users, MessageSquare } from "lucide-react";
import { bookService } from "@/app/actions/marketplace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/stores/useUIStore";

export function QuoteRequestModal() {
  const isOpen = useUIStore((s) => s.isQuoteRequestModalOpen);
  const serviceId = useUIStore((s) => s.quoteRequestServiceId);
  const close = useUIStore((s) => s.closeQuoteRequestModal);

  const [date, setDate] = useState("");
  const [nbParticipants, setNbParticipants] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    close();
    setTimeout(() => {
      setDate("");
      setNbParticipants(1);
      setMessage("");
    }, 300);
  };

  const onSubmit = () => {
    if (!serviceId) return;
    if (!date) {
      toast.error("Veuillez renseigner une date souhaitée.");
      return;
    }

    startTransition(async () => {
      const result = await bookService(
        serviceId,
        new Date(date),
        message || undefined,
        nbParticipants,
      );
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Demande de devis envoyée ! Le freelance vous répondra prochainement.");
        handleClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demander un devis</DialogTitle>
          <DialogDescription>
            Précisez vos besoins. Le freelance vous enverra un devis personnalisé que vous pourrez accepter ou refuser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="qr-date" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              Date souhaitée
            </Label>
            <Input
              id="qr-date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-nb" className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Nombre de participants estimé
            </Label>
            <Input
              id="qr-nb"
              type="number"
              min={1}
              value={nbParticipants}
              onChange={(e) => setNbParticipants(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-msg" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Description de votre besoin
            </Label>
            <Textarea
              id="qr-msg"
              placeholder="Décrivez votre contexte, vos objectifs, vos contraintes…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Après envoi, le freelance aura accès à votre demande et rédigera un devis directement dans l&apos;application.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {isPending ? "Envoi…" : "Envoyer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
