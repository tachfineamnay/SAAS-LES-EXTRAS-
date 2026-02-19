"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOnboardingStep, completeOnboarding, type OnboardingData } from "@/app/actions/onboarding";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, Clock, CheckCircle2, ChevronRight } from "lucide-react";

const ESTABLISHMENT_TYPES = {
    "Protection de l'enfance": ["MECS", "AEMO", "Foyer de l'Enfance", "PEAD"],
    "Personnes âgées": ["EHPAD", "USLD", "Résidence Autonomie", "SSIAD"],
    "Handicap adulte": ["FAM", "MAS", "SAMSAH", "ESAT", "Foyer de vie", "Foyer d'hébergement"],
    "Handicap enfant": ["IME", "ITEP", "SESSAD", "CAMSP", "CMPP"],
    "Addiction & Précarité": ["CSAPA", "CHRS", "LHSS", "ACT"],
    "Autre": ["SAAD", "SPASAD", "Autre"],
};

export function ClientFlow({ currentStep }: { currentStep: number }) {
    const router = useRouter();
    // Step 0 = welcome screen, then steps 1-3
    const [step, setStep] = useState(currentStep === 0 ? 0 : currentStep);
    const [isPending, startTransition] = useTransition();

    // Step 1 — Identity
    const [establishmentName, setEstablishmentName] = useState("");
    const [establishmentType, setEstablishmentType] = useState("");
    const [finess, setFiness] = useState("");

    // Step 2 — Address
    const [street, setStreet] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");

    // Step 3 — Contact
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");

    const totalSteps = 3;

    const handleStart = () => setStep(1);
    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const handleNext = () => {
        startTransition(async () => {
            try {
                let data: OnboardingData = {};

                if (step === 1) {
                    if (!establishmentName) throw new Error("Le nom de l'établissement est requis.");
                    if (!establishmentType) throw new Error("Le type de structure est requis.");
                    data = {
                        establishmentName,
                        establishmentType,
                        // store finess in bio field as workaround since schema doesn't have finess yet
                        ...(finess && { bio: `FINESS: ${finess}` }),
                    };
                } else if (step === 2) {
                    if (!street) throw new Error("La rue est requise.");
                    if (!postalCode) throw new Error("Le code postal est requis.");
                    if (!city) throw new Error("La ville est requise.");
                    data = { address: `${street}, ${postalCode} ${city}` };
                } else if (step === 3) {
                    if (!contactName) throw new Error("Le nom du responsable est requis.");
                    if (!phone) throw new Error("Le téléphone est requis.");
                    data = { contactName, phone };
                }

                await saveOnboardingStep(step, data);

                if (step < totalSteps) {
                    setStep(step + 1);
                } else {
                    await completeOnboarding();
                    toast.success("🎉 Établissement configuré ! Bienvenue sur Les-Extras.");
                    router.push("/dashboard");
                    router.refresh();
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
            }
        });
    };

    // --- Welcome screen ---
    if (step === 0) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-xl border bg-card p-8 shadow-sm text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-primary/10 p-4">
                            <Building2 className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Configurons votre établissement</h1>
                        <p className="text-muted-foreground">
                            Ces informations nous permettent de vous mettre en relation avec les bons profils et de générer vos documents.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/40 p-4 text-left space-y-3">
                        {[
                            "Nom et type de votre structure",
                            "Adresse de facturation",
                            "Contact responsable",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Environ 2 minutes</span>
                    </div>

                    <Button className="w-full gap-2" size="lg" onClick={handleStart}>
                        Commencer la configuration
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // --- Step content ---
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de l'établissement <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Ex: MECS Les Érables"
                                value={establishmentName}
                                onChange={(e) => setEstablishmentName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de structure <span className="text-destructive">*</span></Label>
                            <Select onValueChange={setEstablishmentType} value={establishmentType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ESTABLISHMENT_TYPES).map(([group, types]) => (
                                        <SelectGroup key={group}>
                                            <SelectLabel>{group}</SelectLabel>
                                            {types.map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="finess">
                                Numéro FINESS
                                <span className="ml-2 text-xs text-muted-foreground">(optionnel, recommandé pour les contrats)</span>
                            </Label>
                            <Input
                                id="finess"
                                placeholder="Ex: 750012345"
                                value={finess}
                                onChange={(e) => setFiness(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Rue et numéro <span className="text-destructive">*</span></Label>
                            <Input
                                id="street"
                                placeholder="10 rue de la République"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postal">Code postal <span className="text-destructive">*</span></Label>
                                <Input
                                    id="postal"
                                    placeholder="75001"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
                                <Input
                                    id="city"
                                    placeholder="Paris"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cette adresse figurera sur vos factures et contrats.
                        </p>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">Nom du Responsable <span className="text-destructive">*</span></Label>
                            <Input
                                id="contact"
                                placeholder="Jean Dupont"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone direct <span className="text-destructive">*</span></Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="06 12 34 56 78"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ce contact sera utilisé pour les échanges urgents avec les intervenants.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <StepLayout
            currentStep={step}
            totalSteps={totalSteps}
            title={
                step === 1 ? "Identité de la Structure" :
                    step === 2 ? "Adresse de Facturation" :
                        "Contact Prioritaire"
            }
            description={
                step === 1 ? "Dites-nous qui vous êtes pour apparaître correctement sur la plateforme." :
                    step === 2 ? "L'adresse qui figurera sur vos factures et contrats." :
                        "Le responsable que nous contacterons en cas de besoin urgent."
            }
        >
            <div className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-between pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={isPending}
                    >
                        ← Retour
                    </Button>
                    <Button onClick={handleNext} disabled={isPending}>
                        {isPending
                            ? "Enregistrement..."
                            : step === totalSteps
                                ? "Terminer la configuration"
                                : "Suivant →"}
                    </Button>
                </div>
            </div>
        </StepLayout>
    );
}
