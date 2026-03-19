"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    saveOnboardingStep,
    completeOnboarding,
    type OnboardingData,
} from "@/app/actions/onboarding";
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

const ESTABLISHMENT_TYPES: Record<string, string[]> = {
    "Protection de l'enfance": ["MECS", "AEMO", "Foyer de l'Enfance", "PEAD"],
    "Personnes âgées": ["EHPAD", "USLD", "Résidence Autonomie", "SSIAD"],
    "Handicap adulte": ["FAM", "MAS", "SAMSAH", "ESAT", "Foyer de vie", "Foyer d'hébergement"],
    "Handicap enfant": ["IME", "ITEP", "SESSAD", "CAMSP", "CMPP"],
    "Addiction & Précarité": ["CSAPA", "CHRS", "LHSS", "ACT"],
    "Autre": ["SAAD", "SPASAD", "Autre"],
};

export function EstablishmentFlow({ currentStep }: { currentStep: number }) {
    const router = useRouter();
    const [step, setStep] = useState(currentStep === 0 ? 1 : currentStep);
    const [isPending, startTransition] = useTransition();
    const totalSteps = 2;

    // Step 1 — Identité structure
    const [establishmentName, setEstablishmentName] = useState("");
    const [establishmentType, setEstablishmentType] = useState("");

    // Step 2 — Adresse & Contact
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");

    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const handleNext = () => {
        startTransition(async () => {
            try {
                let data: OnboardingData = {};

                if (step === 1) {
                    if (!establishmentName) { toast.error("Le nom de l'établissement est requis."); return; }
                    if (!establishmentType) { toast.error("Le type de structure est requis."); return; }
                    data = { establishmentName, establishmentType };
                } else if (step === 2) {
                    if (!address) { toast.error("L'adresse est requise."); return; }
                    if (!city) { toast.error("La ville est requise."); return; }
                    if (!contactName) { toast.error("Le nom du responsable est requis."); return; }
                    if (!phone) { toast.error("Le téléphone est requis."); return; }
                    data = { address, city, zipCode: postalCode, contactName, phone };
                }

                const saveResult = await saveOnboardingStep(step, data);
                if (saveResult.error) { toast.error(saveResult.error); return; }

                if (step < totalSteps) {
                    setStep(step + 1);
                } else {
                    const completeResult = await completeOnboarding();
                    if (completeResult.error) { toast.error(completeResult.error); return; }
                    toast.success("Établissement configuré ! Bienvenue sur Les-Extras.");
                    router.push("/dashboard");
                    router.refresh();
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
            }
        });
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de l&apos;établissement <span className="text-destructive">*</span></Label>
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
                                <SelectTrigger><SelectValue placeholder="Sélectionnez le type" /></SelectTrigger>
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
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse <span className="text-destructive">*</span></Label>
                            <Input id="address" placeholder="10 rue de la République" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postal">Code postal</Label>
                                <Input id="postal" placeholder="75001" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={5} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
                                <Input id="city" placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Nom du Responsable <span className="text-destructive">*</span></Label>
                            <Input id="contact" placeholder="Jean Dupont" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone <span className="text-destructive">*</span></Label>
                            <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
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
            title={step === 1 ? "Votre Structure" : "Adresse & Contact"}
            description={step === 1 ? "Identifiez votre établissement." : "Pour les factures et échanges avec les intervenants."}
        >
            <div className="space-y-6">
                {renderStepContent()}
                <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={handleBack} disabled={isPending || step === 1}>Retour</Button>
                    <Button onClick={handleNext} disabled={isPending}>
                        {isPending ? "Enregistrement…" : step < totalSteps ? "Continuer" : "Valider mon profil"}
                    </Button>
                </div>
            </div>
        </StepLayout>
    );
}