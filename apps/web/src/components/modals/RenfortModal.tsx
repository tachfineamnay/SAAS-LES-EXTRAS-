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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/lib/stores/useUIStore";
import {
  METIERS_BY_CATEGORY,
  CATEGORY_LABELS,
  HOURLY_RATE_MIN,
  HOURLY_RATE_MAX,
  HOURLY_RATE_DEFAULT,
  MAX_SLOTS,
  TYPES_ETABLISSEMENTS,
  PUBLIC_CIBLE_OPTIONS,
  PERKS_OPTIONS,
  SKILLS_OPTIONS,
  TRANSMISSION_TIMES,
  getMetierLabel,
  type MetierCategory,
} from "@/lib/sos-config";
import { cn } from "@/lib/utils";

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
  // Step 0 — Profil
  metier: z.string().min(1, "Veuillez sélectionner un métier"),
  diplomaRequired: z.boolean().default(true),
  requiredSkills: z.array(z.string()).default([]),
  // Step 1 — Contexte
  establishmentType: z.string().min(1, "Type d'établissement requis"),
  targetPublic: z.array(z.string()).min(1, "Sélectionnez au moins un public"),
  unitSize: z.string().optional(),
  description: z.string().optional(),
  // Step 2 — Planification
  slots: z.array(slotSchema).min(1, "Ajoutez au moins un créneau").max(MAX_SLOTS),
  hasTransmissions: z.boolean().default(false),
  transmissionTime: z.string().optional(),
  // Step 3 — Rémunération
  shift: z.enum(["JOUR", "NUIT"]),
  hourlyRate: z.number().min(HOURLY_RATE_MIN).max(HOURLY_RATE_MAX),
  perks: z.array(z.string()).default([]),
  // Step 4 — Localisation
  exactAddress: z.string().min(5, "Adresse complète requise"),
  zipCode: z.string().min(5, "Code postal requis"),
  city: z.string().min(2, "Ville requise"),
  accessInstructions: z.string().optional(),
});

type RenfortForm = z.infer<typeof renfortSchema>;

const STEPS = ["Profil", "Contexte", "Planification", "Rémunération", "Localisation", "Récap"] as const;

const STEP_FIELDS: Record<number, (keyof RenfortForm)[]> = {
  0: ["metier"],
  1: ["establishmentType", "targetPublic"],
  2: ["slots"],
  3: ["shift", "hourlyRate"],
  4: ["exactAddress", "zipCode", "city"],
  5: [],
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
      diplomaRequired: true,
      requiredSkills: [],
      establishmentType: "",
      targetPublic: [],
      unitSize: "",
      description: "",
      slots: [{ date: "", heureDebut: "", heureFin: "" }],
      hasTransmissions: false,
      transmissionTime: "",
      shift: "JOUR",
      hourlyRate: HOURLY_RATE_DEFAULT,
      perks: [],
      exactAddress: "",
      zipCode: "",
      city: "",
      accessInstructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  const step = useUIStore((state) => state.renfortStep) ?? 0;
  const setStep = useUIStore((state) => state.setRenfortStep);
  const dir = useUIStore((state) => state.renfortStepDir) ?? 1;
  const setDir = useUIStore((state) => state.setRenfortStepDir);

  const goNext = useCallback(async () => {
    const stepFields = STEP_FIELDS[step];
    const valid = await form.trigger(stepFields as (keyof RenfortForm)[]);
    if (!valid) return;
    setDir(1);
    setStep(step + 1);
  }, [form, step, setDir, setStep]);

  const goPrev = useCallback(() => {
    setDir(-1);
    setStep(step - 1);
  }, [step, setDir, setStep]);

  const handleClose = useCallback(() => {
    closeRenfortModal();
    form.reset();
    setStep(0);
  }, [closeRenfortModal, form, setStep]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const first = data.slots[0];
      if (!first) throw new Error("Au moins un créneau est requis");
      const dateStart = new Date(`${first.date}T${first.heureDebut}`);
      const dateEnd = new Date(`${first.date}T${first.heureFin}`);

      await createMissionFromRenfort({
        title: getMetierLabel(data.metier),
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
        address: `${data.exactAddress}, ${data.zipCode} ${data.city}`,
        hourlyRate: data.hourlyRate,
        isRenfort: true,
        metier: data.metier,
        slots: data.slots,
        shift: data.shift,
        city: data.city,
        zipCode: data.zipCode,
        description: data.description || undefined,
        establishmentType: data.establishmentType,
        targetPublic: data.targetPublic,
        unitSize: data.unitSize || undefined,
        requiredSkills: data.requiredSkills,
        diplomaRequired: data.diplomaRequired,
        hasTransmissions: data.hasTransmissions,
        perks: data.perks,
        exactAddress: data.exactAddress,
        accessInstructions: data.accessInstructions || undefined,
      });

      toast.success("SOS Renfort diffusé !", {
        description: `${getMetierLabel(data.metier)} · ${data.slots.length} créneau(x)`,
      });

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

        {/* Barre de progression */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

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
              className="min-h-[300px] max-h-[60vh] overflow-y-auto pr-1"
            >
              {step === 0 && (
                <StepProfil
                  metier={values.metier}
                  onMetierChange={(id) => form.setValue("metier", id, { shouldValidate: true })}
                  diplomaRequired={values.diplomaRequired}
                  onDiplomaChange={(v) => form.setValue("diplomaRequired", v)}
                  requiredSkills={values.requiredSkills}
                  onSkillsChange={(v) => form.setValue("requiredSkills", v)}
                  errors={{ metier: form.formState.errors.metier?.message }}
                />
              )}

              {step === 1 && (
                <StepContext
                  establishmentType={values.establishmentType}
                  onTypeChange={(v) => form.setValue("establishmentType", v, { shouldValidate: true })}
                  targetPublic={values.targetPublic}
                  onPublicChange={(v) => form.setValue("targetPublic", v, { shouldValidate: true })}
                  unitSize={values.unitSize ?? ""}
                  onUnitSizeChange={(v) => form.setValue("unitSize", v)}
                  description={values.description ?? ""}
                  onDescriptionChange={(v) => form.setValue("description", v)}
                  errors={{
                    establishmentType: form.formState.errors.establishmentType?.message,
                    targetPublic: form.formState.errors.targetPublic?.message,
                  }}
                />
              )}

              {step === 2 && (
                <StepPlanification
                  fields={fields}
                  errors={form.formState.errors.slots}
                  register={form.register}
                  onAdd={() => append({ date: "", heureDebut: "", heureFin: "" })}
                  onRemove={remove}
                  hasTransmissions={values.hasTransmissions}
                  onTransmissionsChange={(v) => form.setValue("hasTransmissions", v)}
                  transmissionTime={values.transmissionTime ?? ""}
                  onTransmissionTimeChange={(v) => form.setValue("transmissionTime", v)}
                />
              )}

              {step === 3 && (
                <StepRemuneration
                  shift={values.shift}
                  onShiftChange={(v) => form.setValue("shift", v)}
                  hourlyRate={values.hourlyRate}
                  onRateChange={(v) => form.setValue("hourlyRate", v)}
                  perks={values.perks}
                  onPerksChange={(v) => form.setValue("perks", v)}
                />
              )}

              {step === 4 && (
                <StepLocalisation
                  exactAddress={values.exactAddress}
                  zipCode={values.zipCode}
                  city={values.city}
                  accessInstructions={values.accessInstructions ?? ""}
                  onAddressChange={(v) => form.setValue("exactAddress", v, { shouldValidate: true })}
                  onZipChange={(v) => form.setValue("zipCode", v, { shouldValidate: true })}
                  onCityChange={(v) => form.setValue("city", v, { shouldValidate: true })}
                  onInstructionsChange={(v) => form.setValue("accessInstructions", v)}
                  errors={{
                    exactAddress: form.formState.errors.exactAddress?.message,
                    zipCode: form.formState.errors.zipCode?.message,
                    city: form.formState.errors.city?.message,
                  }}
                />
              )}

              {step === 5 && <StepRecap values={values} />}
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

// ─── Step 0 — Profil Recherché ────────────────────────────────────────────────

function StepProfil({
  metier, onMetierChange,
  diplomaRequired, onDiplomaChange,
  requiredSkills, onSkillsChange,
  errors,
}: {
  metier: string;
  onMetierChange: (id: string) => void;
  diplomaRequired: boolean;
  onDiplomaChange: (v: boolean) => void;
  requiredSkills: string[];
  onSkillsChange: (v: string[]) => void;
  errors: { metier?: string };
}) {
  const toggleSkill = (skill: string) => {
    const next = requiredSkills.includes(skill)
      ? requiredSkills.filter((s) => s !== skill)
      : [...requiredSkills, skill];
    onSkillsChange(next);
  };

  return (
    <div className="space-y-5">
      {/* Métier */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Métier recherché *</Label>
        {(Object.keys(METIERS_BY_CATEGORY) as MetierCategory[]).map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {METIERS_BY_CATEGORY[cat].map((m) => {
                const Icon = m.icon;
                const selected = metier === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onMetierChange(m.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {errors.metier && <p className="text-sm text-destructive">{errors.metier}</p>}
      </div>

      {/* Diplôme */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Diplôme exigé</Label>
        <div className="flex gap-2">
          {[
            { label: "Exigé", value: true },
            { label: "Non requis", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onDiplomaChange(opt.value)}
              className={cn(
                "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                diplomaRequired === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compétences spécifiques */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Compétences spécifiques{" "}
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_OPTIONS.map((skill) => {
            const active = requiredSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — Contexte Mission ────────────────────────────────────────────────

function StepContext({
  establishmentType, onTypeChange,
  targetPublic, onPublicChange,
  unitSize, onUnitSizeChange,
  description, onDescriptionChange,
  errors,
}: {
  establishmentType: string;
  onTypeChange: (v: string) => void;
  targetPublic: string[];
  onPublicChange: (v: string[]) => void;
  unitSize: string;
  onUnitSizeChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  errors: { establishmentType?: string; targetPublic?: string };
}) {
  const togglePublic = (val: string) => {
    const next = targetPublic.includes(val)
      ? targetPublic.filter((p) => p !== val)
      : [...targetPublic, val];
    onPublicChange(next);
  };

  return (
    <div className="space-y-5">
      {/* Type d'établissement */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Type d'établissement / Service *</Label>
        <Select value={establishmentType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type..." />
          </SelectTrigger>
          <SelectContent>
            {TYPES_ETABLISSEMENTS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.establishmentType && (
          <p className="text-xs text-destructive">{errors.establishmentType}</p>
        )}
      </div>

      {/* Public accompagné */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Public accompagné *</Label>
        <div className="flex flex-wrap gap-2">
          {PUBLIC_CIBLE_OPTIONS.map((pub) => {
            const active = targetPublic.includes(pub);
            return (
              <button
                key={pub}
                type="button"
                onClick={() => togglePublic(pub)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                {pub}
              </button>
            );
          })}
        </div>
        {errors.targetPublic && (
          <p className="text-xs text-destructive">{errors.targetPublic}</p>
        )}
      </div>

      {/* Taille unité */}
      <div className="space-y-2">
        <Label htmlFor="unitSize" className="text-sm font-semibold">
          Taille de l'unité{" "}
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Input
          id="unitSize"
          value={unitSize}
          placeholder="Ex: Unité Alzheimer de 14 résidents"
          onChange={(e) => onUnitSizeChange(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description / Tâches principales{" "}
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          placeholder="Décrivez la journée type, le motif du remplacement..."
          rows={3}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 2 — Planification ──────────────────────────────────────────────────

function StepPlanification({
  fields, errors, register, onAdd, onRemove,
  hasTransmissions, onTransmissionsChange,
  transmissionTime, onTransmissionTimeChange,
}: {
  fields: { id: string }[];
  errors: any;
  register: any;
  onAdd: () => void;
  onRemove: (i: number) => void;
  hasTransmissions: boolean;
  onTransmissionsChange: (v: boolean) => void;
  transmissionTime: string;
  onTransmissionTimeChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Créneaux */}
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

      {/* Transmissions */}
      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Temps de transmissions (relève)</p>
            <p className="text-xs text-muted-foreground">Inclure un temps de relève avant le début</p>
          </div>
          <Switch checked={hasTransmissions} onCheckedChange={onTransmissionsChange} />
        </div>

        {hasTransmissions && (
          <div className="space-y-1">
            <Label className="text-xs">Durée de la relève</Label>
            <Select value={transmissionTime} onValueChange={onTransmissionTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSION_TIMES.map((t) => (
                  <SelectItem key={t} value={t}>{t} avant le shift</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3 — Rémunération & Avantages ───────────────────────────────────────

function StepRemuneration({
  shift, onShiftChange,
  hourlyRate, onRateChange,
  perks, onPerksChange,
}: {
  shift: "JOUR" | "NUIT";
  onShiftChange: (v: "JOUR" | "NUIT") => void;
  hourlyRate: number;
  onRateChange: (v: number) => void;
  perks: string[];
  onPerksChange: (v: string[]) => void;
}) {
  const togglePerk = (id: string) => {
    const next = perks.includes(id) ? perks.filter((p) => p !== id) : [...perks, id];
    onPerksChange(next);
  };

  return (
    <div className="space-y-6">
      {/* Shift */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Type de poste</Label>
        <div className="flex gap-3">
          {(["JOUR", "NUIT"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onShiftChange(s)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors",
                shift === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {s === "JOUR" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {s === "JOUR" ? "Jour" : "Nuit"}
            </button>
          ))}
        </div>
      </div>

      {/* Taux horaire */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Taux horaire brut</Label>
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

      {/* Avantages pratiques */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Avantages pratiques{" "}
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {PERKS_OPTIONS.map((perk) => {
            const active = perks.includes(perk.id);
            return (
              <button
                key={perk.id}
                type="button"
                onClick={() => togglePerk(perk.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-sm border shrink-0 flex items-center justify-center",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
                {perk.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 — Localisation & Accès ───────────────────────────────────────────

function StepLocalisation({
  exactAddress, zipCode, city, accessInstructions,
  onAddressChange, onZipChange, onCityChange, onInstructionsChange,
  errors,
}: {
  exactAddress: string;
  zipCode: string;
  city: string;
  accessInstructions: string;
  onAddressChange: (v: string) => void;
  onZipChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onInstructionsChange: (v: string) => void;
  errors: { exactAddress?: string; zipCode?: string; city?: string };
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Indiquez l'adresse précise pour que le talent sache exactement où se rendre.
      </p>

      <div className="space-y-2">
        <Label htmlFor="exactAddress">Adresse complète *</Label>
        <Input
          id="exactAddress"
          value={exactAddress}
          placeholder="Ex: 12 rue des Lilas"
          onChange={(e) => onAddressChange(e.target.value)}
        />
        {errors.exactAddress && <p className="text-xs text-destructive">{errors.exactAddress}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="renfort-zip">Code postal *</Label>
          <Input
            id="renfort-zip"
            value={zipCode}
            placeholder="69003"
            maxLength={5}
            onChange={(e) => onZipChange(e.target.value)}
          />
          {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="renfort-city">Ville *</Label>
          <Input
            id="renfort-city"
            value={city}
            placeholder="Lyon"
            onChange={(e) => onCityChange(e.target.value)}
          />
          {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accessInstructions">
          Instructions d'accès{" "}
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="accessInstructions"
          value={accessInstructions}
          placeholder="Ex: Code portail 1234, sonner à l'interphone infirmier, se garer sur les places visiteurs"
          rows={3}
          onChange={(e) => onInstructionsChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Step 5 — Récapitulatif ──────────────────────────────────────────────────

function StepRecap({ values }: { values: RenfortForm }) {
  const metierLabel = getMetierLabel(values.metier);
  const perksMap = Object.fromEntries(PERKS_OPTIONS.map((p) => [p.id, p.label]));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Vérifiez les informations avant de publier.</p>
      <div className="rounded-lg border divide-y text-sm">
        {/* Profil */}
        <SectionHeader label="Profil" />
        <Row label="Métier" value={metierLabel} />
        <Row label="Diplôme" value={values.diplomaRequired ? "Exigé" : "Non requis"} />
        {values.requiredSkills.length > 0 && (
          <RowTags label="Compétences" tags={values.requiredSkills} />
        )}

        {/* Contexte */}
        <SectionHeader label="Contexte" />
        <Row label="Établissement" value={values.establishmentType} />
        <RowTags label="Public" tags={values.targetPublic} />
        {values.unitSize && <Row label="Unité" value={values.unitSize} />}

        {/* Planification */}
        <SectionHeader label="Planification" />
        {values.slots.map((s, i) => (
          <Row
            key={i}
            label={`Créneau ${i + 1}`}
            value={`${s.date} · ${s.heureDebut} → ${s.heureFin}`}
          />
        ))}
        {values.hasTransmissions && (
          <Row
            label="Relève"
            value={values.transmissionTime ? `${values.transmissionTime} avant` : "Oui"}
          />
        )}

        {/* Rémunération */}
        <SectionHeader label="Rémunération" />
        <Row label="Poste" value={values.shift === "JOUR" ? "Jour" : "Nuit"} />
        <Row label="Taux horaire" value={`${values.hourlyRate} €/h`} />
        {values.perks.length > 0 && (
          <RowTags label="Avantages" tags={values.perks.map((id) => perksMap[id] ?? id)} />
        )}

        {/* Localisation */}
        <SectionHeader label="Localisation" />
        <Row
          label="Adresse"
          value={`${values.exactAddress}, ${values.zipCode} ${values.city}`}
        />
        {values.accessInstructions && (
          <Row label="Accès" value={values.accessInstructions} />
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 bg-muted/50">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function RowTags({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="flex items-start justify-between px-3 py-2 gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1 justify-end">
        {tags.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}
