"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createServiceFromPublish } from "@/app/actions/marketplace";
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
import {
  ATELIER_CATEGORIES,
  PUBLIC_CIBLE_OPTIONS,
  PRICING_TYPE_OPTIONS,
  DURATION_OPTIONS,
  MAX_SERVICE_SLOTS,
  getCategoryLabel,
  getPublicCibleLabels,
  formatDuration,
} from "@/lib/atelier-config";

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

const publishSchema = z
  .object({
    type: z.enum(["WORKSHOP", "TRAINING"]),
    category: z.string().min(1, "Sélectionnez une catégorie"),
    title: z.string().min(3, "Titre trop court (min 3 caractères)"),
    description: z.string().min(20, "Description trop courte (min 20 caractères)"),
    objectives: z.string().optional(),
    methodology: z.string().optional(),
    evaluation: z.string().optional(),
    durationMinutes: z.number().min(30),
    capacity: z.number().int().min(1),
    publicCible: z.array(z.string()).min(1, "Sélectionnez au moins un public"),
    materials: z.string().optional(),
    pricingType: z.enum(["SESSION", "PER_PARTICIPANT", "QUOTE"]),
    price: z.number().min(0).optional(),
    pricePerParticipant: z.number().min(0).optional(),
    slots: z.array(slotSchema).min(1, "Ajoutez au moins un créneau").max(MAX_SERVICE_SLOTS),
  })
  .refine(
    (d) => {
      if (d.pricingType === "SESSION") return (d.price ?? 0) > 0;
      if (d.pricingType === "PER_PARTICIPANT") return (d.pricePerParticipant ?? 0) > 0;
      return true; // QUOTE has no price required
    },
    {
      message: "Veuillez saisir un tarif",
      path: ["price"],
    },
  );

type PublishForm = z.infer<typeof publishSchema>;

const STEPS = ["Type", "Description", "Pédagogie", "Participants", "Tarif", "Créneaux"] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5;

const STEP_FIELDS: Record<StepIndex, (keyof PublishForm)[]> = {
  0: ["type", "category"],
  1: ["title", "description"],
  2: ["objectives", "methodology", "evaluation"],
  3: ["durationMinutes", "capacity", "publicCible", "materials"],
  4: ["pricingType", "price", "pricePerParticipant"],
  5: ["slots"],
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PublishModal() {
  const router = useRouter();
  const isOpen = useUIStore((s) => s.isPublishModalOpen);
  const openPublishModal = useUIStore((s) => s.openPublishModal);
  const closePublishModal = useUIStore((s) => s.closePublishModal);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      type: "WORKSHOP",
      category: "",
      title: "",
      description: "",
      objectives: "",
      methodology: "",
      evaluation: "",
      durationMinutes: 120,
      capacity: 15,
      publicCible: [],
      materials: "",
      pricingType: "SESSION",
      price: undefined,
      pricePerParticipant: undefined,
      slots: [{ date: "", heureDebut: "09:00", heureFin: "11:00" }],
    },
  });

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  const [step, setStep] = useFormStep();
  const [dir, setDir] = useDir();

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setDir(1);
    setStep((s) => (Math.min(s + 1, STEPS.length - 1) as StepIndex));
  };

  const goPrev = () => {
    setDir(-1);
    setStep((s) => (Math.max(s - 1, 0) as StepIndex));
  };

  const handleClose = () => {
    closePublishModal();
    setTimeout(() => {
      form.reset();
      setStep(0);
    }, 300);
  };

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        await createServiceFromPublish({
          type: data.type,
          title: data.title,
          description: data.description,
          price: data.pricingType === "SESSION" ? (data.price ?? 0) : 0,
          capacity: data.capacity,
          pricingType: data.pricingType,
          pricePerParticipant: data.pricePerParticipant,
          durationMinutes: data.durationMinutes,
          category: data.category,
          publicCible: data.publicCible,
          materials: data.materials || undefined,
          objectives: data.objectives || undefined,
          methodology: data.methodology || undefined,
          evaluation: data.evaluation || undefined,
          slots: data.slots,
        });
        toast.success(data.type === "WORKSHOP" ? "Atelier publié avec succès !" : "Formation publiée avec succès !");
        handleClose();
        router.push("/marketplace");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Impossible de publier l'offre.");
      }
    });
  });

  const values = form.watch();
  const isLastStep = step === STEPS.length - 1;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) { openPublishModal(); return; }
        handleClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Publier {values.type === "WORKSHOP" ? "un atelier" : "une formation"}
          </DialogTitle>
          <DialogDescription>
            Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0 ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-[hsl(var(--color-teal-100))] text-[hsl(var(--color-teal-700))] border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="relative overflow-hidden">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="space-y-4 py-2"
            >
              {/* ── Étape 0: Type + Catégorie ── */}
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Type d&apos;offre</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["WORKSHOP", "TRAINING"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => form.setValue("type", t)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                            values.type === t
                              ? "border-primary bg-[hsl(var(--color-teal-50))] text-[hsl(var(--color-teal-700))]"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          {t === "WORKSHOP" ? "🎨 Atelier" : "📚 Formation"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ATELIER_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => form.setValue("category", cat.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors text-left ${
                              values.category === cat.id
                                ? "border-primary bg-[hsl(var(--color-teal-50))] text-[hsl(var(--color-teal-700))]"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="leading-tight">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.category && (
                      <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Étape 1: Titre + Description ── */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pub-title">Titre de l&apos;atelier</Label>
                    <Input
                      id="pub-title"
                      {...form.register("title")}
                      placeholder="Ex : Atelier gestion des émotions pour adolescents"
                    />
                    {form.formState.errors.title && (
                      <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pub-desc">Description générale</Label>
                    <Textarea
                      id="pub-desc"
                      {...form.register("description")}
                      placeholder="Présentez votre atelier en quelques phrases..."
                      rows={5}
                    />
                    {form.formState.errors.description && (
                      <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Étape 2: Sections pédagogiques ── */}
              {step === 2 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Ces sections sont optionnelles mais rassurent les établissements.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="pub-obj">Objectifs</Label>
                    <Textarea
                      id="pub-obj"
                      {...form.register("objectives")}
                      placeholder="Quels sont les objectifs pédagogiques ?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pub-method">Méthodologie</Label>
                    <Textarea
                      id="pub-method"
                      {...form.register("methodology")}
                      placeholder="Comment se déroule l'atelier ?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pub-eval">Évaluation</Label>
                    <Textarea
                      id="pub-eval"
                      {...form.register("evaluation")}
                      placeholder="Comment évaluez-vous les résultats ?"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* ── Étape 3: Participants & public ── */}
              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pub-dur">Durée</Label>
                      <select
                        id="pub-dur"
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                        value={values.durationMinutes}
                        onChange={(e) => form.setValue("durationMinutes", Number(e.target.value))}
                      >
                        {DURATION_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pub-cap">Capacité max</Label>
                      <Input
                        id="pub-cap"
                        type="number"
                        min={1}
                        {...form.register("capacity", { valueAsNumber: true })}
                      />
                      {form.formState.errors.capacity && (
                        <p className="text-xs text-red-500">{form.formState.errors.capacity.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Public cible</Label>
                    <div className="flex flex-wrap gap-2">
                      {PUBLIC_CIBLE_OPTIONS.map((p) => {
                        const selected = values.publicCible?.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              const current = values.publicCible ?? [];
                              form.setValue(
                                "publicCible",
                                selected ? current.filter((x) => x !== p.id) : [...current, p.id],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground/50"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.publicCible && (
                      <p className="text-xs text-red-500">{form.formState.errors.publicCible.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pub-mat">Matériel fourni (optionnel)</Label>
                    <Input
                      id="pub-mat"
                      {...form.register("materials")}
                      placeholder="Ex : Feutres, papier, support pédagogique…"
                    />
                  </div>
                </>
              )}

              {/* ── Étape 4: Tarification ── */}
              {step === 4 && (
                <>
                  <div className="space-y-3">
                    {PRICING_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => form.setValue("pricingType", opt.id)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                          values.pricingType === opt.id
                            ? "border-primary bg-[hsl(var(--color-teal-50))]"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            values.pricingType === opt.id ? "border-primary" : "border-border"
                          }`}
                        >
                          {values.pricingType === opt.id && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {values.pricingType === "SESSION" && (
                    <div className="space-y-2">
                      <Label htmlFor="pub-price">Tarif forfaitaire (€ HT)</Label>
                      <Input
                        id="pub-price"
                        type="number"
                        min={0}
                        step={10}
                        {...form.register("price", { valueAsNumber: true })}
                        placeholder="Ex : 350"
                      />
                      {form.formState.errors.price && (
                        <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
                      )}
                    </div>
                  )}

                  {values.pricingType === "PER_PARTICIPANT" && (
                    <div className="space-y-2">
                      <Label htmlFor="pub-ppp">Tarif par participant (€ HT)</Label>
                      <Input
                        id="pub-ppp"
                        type="number"
                        min={0}
                        step={5}
                        {...form.register("pricePerParticipant", { valueAsNumber: true })}
                        placeholder="Ex : 25"
                      />
                    </div>
                  )}

                  {values.pricingType === "QUOTE" && (
                    <div className="rounded-lg bg-[hsl(var(--color-amber-50))] border border-[hsl(var(--color-amber-200)/0.4)] p-4 text-sm text-[hsl(var(--color-amber-700))]">
                      Le tarif sera défini après échange avec l&apos;établissement. Vous recevrez une demande et pourrez rédiger votre devis directement dans l&apos;application.
                    </div>
                  )}
                </>
              )}

              {/* ── Étape 5: Créneaux + Récap ── */}
              {step === 5 && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Créneaux disponibles</Label>
                      <span className="text-xs text-muted-foreground">{slotFields.length}/{MAX_SERVICE_SLOTS}</span>
                    </div>

                    {slotFields.map((field, i) => (
                      <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                        <Input
                          type="date"
                          {...form.register(`slots.${i}.date`)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <Input
                          type="time"
                          className="w-24"
                          {...form.register(`slots.${i}.heureDebut`)}
                        />
                        <Input
                          type="time"
                          className="w-24"
                          {...form.register(`slots.${i}.heureFin`)}
                        />
                        {slotFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSlot(i)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {slotFields.length < MAX_SERVICE_SLOTS && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendSlot({ date: "", heureDebut: "09:00", heureFin: "11:00" })}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" /> Ajouter un créneau
                      </Button>
                    )}

                    {form.formState.errors.slots && (
                      <p className="text-xs text-red-500">
                        {typeof form.formState.errors.slots === "object" && "message" in form.formState.errors.slots
                          ? (form.formState.errors.slots as { message: string }).message
                          : "Vérifiez vos créneaux"}
                      </p>
                    )}
                  </div>

                  {/* Mini récap */}
                  <div className="rounded-xl bg-[hsl(var(--surface-2))] border p-4 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">Récap</p>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                      <span className="text-muted-foreground/70">Type</span>
                      <span>{values.type === "WORKSHOP" ? "Atelier" : "Formation"}</span>
                      <span className="text-muted-foreground/70">Catégorie</span>
                      <span>{getCategoryLabel(values.category)}</span>
                      <span className="text-muted-foreground/70">Durée</span>
                      <span>{formatDuration(values.durationMinutes)}</span>
                      <span className="text-muted-foreground/70">Capacité</span>
                      <span>{values.capacity} pers.</span>
                      <span className="text-muted-foreground/70">Public</span>
                      <span className="truncate">{getPublicCibleLabels(values.publicCible ?? []).join(", ") || "—"}</span>
                      <span className="text-muted-foreground/70">Tarif</span>
                      <span>
                        {values.pricingType === "QUOTE"
                          ? "Sur devis"
                          : values.pricingType === "PER_PARTICIPANT"
                          ? `${values.pricePerParticipant ?? 0} €/pers.`
                          : `${values.price ?? 0} € HT`}
                      </span>
                      <span className="text-muted-foreground/70">Créneaux</span>
                      <span>{slotFields.length} créneau{slotFields.length > 1 ? "x" : ""}</span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrev}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? "Publication..." : `Publier ${values.type === "WORKSHOP" ? "l'atelier" : "la formation"}`}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                className="gap-1"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hook helpers ─────────────────────────────────────────────────────────────

function useFormStep() {
  const [step, setStep] = useState<StepIndex>(0);
  return [step, setStep] as const;
}

function useDir() {
  const [dir, setDir] = useState(1);
  return [dir, setDir] as const;
}
