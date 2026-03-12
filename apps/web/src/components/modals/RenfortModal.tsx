"use client";

import { useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Sun, Moon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { createMissionFromRenfort } from "@/app/actions/marketplace";
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
import { useUIStore } from "@/lib/stores/useUIStore";
import {
  METIERS,
  METIERS_BY_CATEGORY,
  CATEGORY_LABELS,
  HOURLY_RATE_MIN,
  HOURLY_RATE_MAX,
  HOURLY_RATE_DEFAULT,
  MAX_SLOTS,
  getMetierLabel,
  type MetierCategory,
} from "@/lib/sos-config";

// ─── Schema ──────────────────────────────────────────────────────────────────

const slotSchema = z
  .object({
    date: z.string().min(1, "Date requise"),
    heureDebut: z.string().min(1, "Heure de début requise"),
    heureFin: z.string().min(1, "Heure de fin requise"),
  })
  .refine((s) => s.heureFin > s.heureDebut, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["heureFin"],
  });

const renfortSchema = z.object({
  metier: z.string().min(1, "Veuillez sélectionner un métier"),
  slots: z.array(slotSchema).min(1, "Ajoutez au moins un créneau").max(MAX_SLOTS),
  shift: z.enum(["JOUR", "NUIT"]),
  hourlyRate: z.number().min(HOURLY_RATE_MIN).max(HOURLY_RATE_MAX),
  city: z.string().min(2, "Ville requise"),
  zipCode: z.string().min(5, "Code postal requis"),
});

type RenfortForm = z.infer<typeof renfortSchema>;

const STEPS = ["Métier", "Créneaux", "Conditions", "Localisation", "Récap"] as const;
type Step = 0 | 1 | 2 | 3 | 4;

const STEP_FIELDS: Record<Step, (keyof RenfortForm)[]> = {
  0: ["metier"],
  1: ["slots"],
  2: ["shift", "hourlyRate"],
  3: ["city", "zipCode"],
  4: [],
};

// ─── Animations ───────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function RenfortModal() {
  const isOpen = useUIStore((state) => state.isRenfortModalOpen);
  const openRenfortModal = useUIStore((state) => state.openRenfortModal);
  const closeRenfortModal = useUIStore((state) => state.closeRenfortModal);

  const form = useForm<RenfortForm>({
    resolver: zodResolver(renfortSchema),
    defaultValues: {
      metier: "",
      slots: [{ date: "", heureDebut: "", heureFin: "" }],
      shift: "JOUR",
      hourlyRate: HOURLY_RATE_DEFAULT,
      city: "",
      zipCode: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  const step = (useUIStore((state) => state.renfortStep) ?? 0) as Step;
  const setStep = useUIStore((state) => state.setRenfortStep);
  const dir = useUIStore((state) => state.renfortStepDir) ?? 1;
  const setDir = useUIStore((state) => state.setRenfortStepDir);

  const goNext = useCallback(async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setDir(1);
    setStep((step + 1) as Step);
  }, [form, step, setDir, setStep]);

  const goPrev = useCallback(() => {
    setDir(-1);
    setStep((step - 1) as Step);
  }, [step, setDir, setStep]);

  const handleClose = useCallback(() => {
    closeRenfortModal();
    form.reset();
    setStep(0);
  }, [closeRenfortModal, form, setStep]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Build first slot dates for the current API signature
      const first = data.slots[0];
      if (!first) throw new Error("Au moins un créneau est requis");
      const dateStart = new Date(`${first.date}T${first.heureDebut}`);
      const dateEnd = new Date(`${first.date}T${first.heureFin}`);

      await createMissionFromRenfort({
        title: getMetierLabel(data.metier),
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
        address: `${data.city} ${data.zipCode}`,
        hourlyRate: data.hourlyRate,
        isRenfort: true,
        // Extended fields passed through (picked up after tâche 3/4 backend update)
        // @ts-ignore — will be typed after backend update
        metier: data.metier,
        slots: data.slots,
        shift: data.shift,
        city: data.city,
        zipCode: data.zipCode,
      });

      toast.success("SOS Renfort diffusé !", {
        description: `${getMetierLabel(data.metier)} · ${data.slots.length} créneau(x)`,
      });

      // Auto-close after 2.5s
      setTimeout(() => handleClose(), 2500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de créer la demande.");
    }
  });

  const values = form.watch();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) { openRenfortModal(); return; }
        handleClose();
      }}
    >
      <DialogContent className="sm:max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg font-bold">SOS Renfort</span>
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              Étape {step + 1} / {STEPS.length}
            </span>
          </DialogTitle>
          <DialogDescription>{STEPS[step]}</DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Animated steps */}
        <form onSubmit={onSubmit}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="min-h-[260px]"
            >
              {step === 0 && (
                <StepMetier
                  value={values.metier}
                  onChange={(id) => form.setValue("metier", id, { shouldValidate: true })}
                  error={form.formState.errors.metier?.message}
                />
              )}

              {step === 1 && (
                <StepSlots
                  fields={fields}
                  errors={form.formState.errors.slots}
                  register={form.register}
                  onAdd={() => append({ date: "", heureDebut: "", heureFin: "" })}
                  onRemove={remove}
                />
              )}

              {step === 2 && (
                <StepConditions
                  shift={values.shift}
                  onShiftChange={(v) => form.setValue("shift", v)}
                  hourlyRate={values.hourlyRate}
                  onRateChange={(v) => form.setValue("hourlyRate", v)}
                />
              )}

              {step === 3 && (
                <StepLocalisation
                  city={values.city}
                  zipCode={values.zipCode}
                  onCityChange={(v) => form.setValue("city", v, { shouldValidate: true })}
                  onZipChange={(v) => form.setValue("zipCode", v, { shouldValidate: true })}
                  errors={{
                    city: form.formState.errors.city?.message,
                    zipCode: form.formState.errors.zipCode?.message,
                  }}
                />
              )}

              {step === 4 && <StepRecap values={values} />}
            </motion.div>
          </AnimatePresence>

          {/* Footer navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} className="gap-1">
                Suivant <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="gap-1 bg-primary"
              >
                {form.formState.isSubmitting ? (
                  "Publication..."
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Publier le SOS
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Step 1 — Métier ─────────────────────────────────────────────────────────

function StepMetier({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      {(Object.keys(METIERS_BY_CATEGORY) as MetierCategory[]).map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {CATEGORY_LABELS[cat]}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {METIERS_BY_CATEGORY[cat].map((m) => {
              const Icon = m.icon;
              const selected = value === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange(m.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ─── Step 2 — Créneaux ───────────────────────────────────────────────────────

function StepSlots({
  fields,
  errors,
  register,
  onAdd,
  onRemove,
}: {
  fields: { id: string }[];
  errors: any;
  register: any;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Créneau {i + 1}</span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-destructive hover:opacity-75 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 space-y-1">
              <Label className="text-xs">Date</Label>
              <Input type="date" {...register(`slots.${i}.date`)} />
              {errors?.[i]?.date && (
                <p className="text-xs text-destructive">{errors[i].date.message}</p>
              )}
            </div>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Début</Label>
                <Input type="time" {...register(`slots.${i}.heureDebut`)} />
                {errors?.[i]?.heureDebut && (
                  <p className="text-xs text-destructive">{errors[i].heureDebut.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fin</Label>
                <Input type="time" {...register(`slots.${i}.heureFin`)} />
                {errors?.[i]?.heureFin && (
                  <p className="text-xs text-destructive">{errors[i].heureFin.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {fields.length < MAX_SLOTS && (
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="w-full gap-2">
          <Plus className="h-4 w-4" /> Ajouter un créneau
        </Button>
      )}
    </div>
  );
}

// ─── Step 3 — Conditions ─────────────────────────────────────────────────────

function StepConditions({
  shift,
  onShiftChange,
  hourlyRate,
  onRateChange,
}: {
  shift: "JOUR" | "NUIT";
  onShiftChange: (v: "JOUR" | "NUIT") => void;
  hourlyRate: number;
  onRateChange: (v: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Shift toggle */}
      <div className="space-y-2">
        <Label>Type de poste</Label>
        <div className="flex gap-3">
          {(["JOUR", "NUIT"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onShiftChange(s)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${
                shift === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {s === "JOUR" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {s === "JOUR" ? "Jour" : "Nuit"}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly rate slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Taux horaire brut</Label>
          <span className="text-lg font-bold text-primary">{hourlyRate} €/h</span>
        </div>
        <input
          type="range"
          min={HOURLY_RATE_MIN}
          max={HOURLY_RATE_MAX}
          step={1}
          value={hourlyRate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{HOURLY_RATE_MIN} €</span>
          <span>{HOURLY_RATE_MAX} €</span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Localisation ───────────────────────────────────────────────────

function StepLocalisation({
  city,
  zipCode,
  onCityChange,
  onZipChange,
  errors,
}: {
  city: string;
  zipCode: string;
  onCityChange: (v: string) => void;
  onZipChange: (v: string) => void;
  errors: { city?: string; zipCode?: string };
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Indiquez la localisation de votre établissement pour ce renfort.
      </p>
      <div className="space-y-2">
        <Label htmlFor="renfort-city">Ville</Label>
        <Input
          id="renfort-city"
          value={city}
          placeholder="Ex: Lyon"
          onChange={(e) => onCityChange(e.target.value)}
        />
        {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="renfort-zip">Code postal</Label>
        <Input
          id="renfort-zip"
          value={zipCode}
          placeholder="Ex: 69003"
          maxLength={5}
          onChange={(e) => onZipChange(e.target.value)}
        />
        {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode}</p>}
      </div>
    </div>
  );
}

// ─── Step 5 — Récap ──────────────────────────────────────────────────────────

function StepRecap({ values }: { values: RenfortForm }) {
  const metierLabel = getMetierLabel(values.metier);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Vérifiez les informations avant de publier.</p>
      <div className="rounded-lg border divide-y text-sm">
        <Row label="Métier" value={metierLabel} />
        <Row
          label="Créneaux"
          value={`${values.slots.length} créneau(x)`}
        />
        {values.slots.map((s, i) => (
          <Row
            key={i}
            label={`  Créneau ${i + 1}`}
            value={`${s.date} · ${s.heureDebut} → ${s.heureFin}`}
          />
        ))}
        <Row label="Poste" value={values.shift === "JOUR" ? "☀️ Jour" : "🌙 Nuit"} />
        <Row label="Taux horaire" value={`${values.hourlyRate} €/h`} />
        <Row label="Localisation" value={`${values.city} ${values.zipCode}`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
