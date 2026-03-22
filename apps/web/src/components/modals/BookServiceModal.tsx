"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { CalendarDays, Users, MessageSquare, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { bookService } from "@/app/actions/marketplace";
import { getService, type SerializedService } from "@/app/actions/marketplace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/stores/useUIStore";
import { formatDuration, type ServiceSlot } from "@/lib/atelier-config";

type Step = 0 | 1 | 2;

export function BookServiceModal() {
  const isOpen = useUIStore((s) => s.isBookServiceModalOpen);
  const serviceId = useUIStore((s) => s.bookServiceModalId);
  const close = useUIStore((s) => s.closeBookServiceModal);
  const router = useRouter();

  const [service, setService] = useState<SerializedService | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [selectedSlot, setSelectedSlot] = useState<ServiceSlot | null>(null);
  const [manualDate, setManualDate] = useState("");
  const [nbParticipants, setNbParticipants] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && serviceId) {
      getService(serviceId).then(setService);
    }
  }, [isOpen, serviceId]);

  const handleClose = () => {
    close();
    setTimeout(() => {
      setService(null);
      setStep(0);
      setSelectedSlot(null);
      setManualDate("");
      setNbParticipants(1);
      setMessage("");
    }, 300);
  };

  const goNext = () => {
    if (step === 0 && !selectedSlot && !manualDate) {
      toast.error("Sélectionnez un créneau ou renseignez une date.");
      return;
    }
    setStep((s) => (Math.min(s + 1, 2) as Step));
  };

  const onSubmit = () => {
    if (!serviceId) return;

    const computedDate = selectedSlot
      ? new Date(`${selectedSlot.date}T${selectedSlot.heureDebut}`)
      : manualDate
        ? new Date(`${manualDate}T09:00`)
        : null;

    if (!computedDate || Number.isNaN(computedDate.getTime())) {
      toast.error("Date invalide.");
      return;
    }

    startTransition(async () => {
      const result = await bookService(
        serviceId,
        computedDate,
        message || undefined,
        nbParticipants,
      );
      if ("error" in result) {
        if (result.error.toLowerCase().includes("déjà")) {
          toast.info(result.error);
          handleClose();
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Demande envoyée au freelance !");
        handleClose();
        router.refresh();
      }
    });
  };

  const slots = Array.isArray(service?.slots) ? (service.slots as ServiceSlot[]) : [];
  const totalPrice =
    service?.pricingType === "PER_PARTICIPANT" && service.pricePerParticipant
      ? service.pricePerParticipant * nbParticipants
      : service?.price ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Réserver l&apos;atelier</DialogTitle>
          <DialogDescription>{service?.title ?? "Chargement…"}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {(["Créneau", "Participants", "Récap"] as const).map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-[hsl(var(--color-teal-100))] text-[hsl(var(--color-teal-700))] border-2 border-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 flex-1 mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-4 py-2 min-h-[180px]">
          {/* Step 0: slot selection */}
          {step === 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Choisissez un créneau disponible
              </Label>
              {slots.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Aucun créneau renseigné par le freelance. Proposez une date.</p>
                  <Input
                    id="book-manual-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {slots.map((slot, i) => {
                    const active = selectedSlot?.date === slot.date && selectedSlot?.heureDebut === slot.heureDebut;
                    const dateLabel = new Date(slot.date).toLocaleDateString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long",
                    });
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 text-sm transition-colors text-left ${
                          active ? "border-primary bg-[hsl(var(--color-teal-50))]" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div>
                          <p className="font-medium capitalize">{dateLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {slot.heureDebut} – {slot.heureFin}
                            {service?.durationMinutes && ` (${formatDuration(service.durationMinutes)})`}
                          </p>
                        </div>
                        {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 1: nb participants + message */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nb-part" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Nombre de participants
                </Label>
                <Input
                  id="nb-part"
                  type="number"
                  min={1}
                  max={service?.capacity ?? 100}
                  value={nbParticipants}
                  onChange={(e) => setNbParticipants(Number(e.target.value))}
                />
                {service?.capacity && (
                  <p className="text-xs text-muted-foreground">Capacité max : {service.capacity} participants</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-msg" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Message (optionnel)
                </Label>
                <Textarea
                  id="book-msg"
                  placeholder="Précisez vos besoins, attentes ou contraintes…"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: recap */}
          {step === 2 && (selectedSlot || manualDate) && (
            <div className="rounded-xl bg-[hsl(var(--surface-2))] border p-4 space-y-3 text-sm">
              <p className="font-semibold text-foreground">Récapitulatif de votre demande</p>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atelier</span>
                  <span className="font-medium text-right max-w-[60%] truncate">{service?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {selectedSlot ? (
                      <>
                        {new Date(selectedSlot.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        {" "}{selectedSlot.heureDebut} – {selectedSlot.heureFin}
                      </>
                    ) : (
                      new Date(`${manualDate}T09:00`).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span>{nbParticipants}</span>
                </div>
                {service?.pricingType !== "QUOTE" && (
                  <div className="flex justify-between font-semibold text-base pt-1 border-t">
                    <span>Total estimé</span>
                    <span className="text-[hsl(var(--teal-text))]">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(totalPrice)} HT
                    </span>
                  </div>
                )}
              </div>
              {message && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Message : {message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2 border-t">
          <Button variant="ghost" onClick={() => setStep((s) => (Math.max(s - 1, 0) as Step))} disabled={step === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </Button>

          {step < 2 ? (
            <Button onClick={goNext} className="gap-1">
              Suivant <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onSubmit} disabled={isPending}>
              {isPending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
