"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveOnboardingStep, completeOnboarding, type OnboardingData } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FreelanceFlow({ currentStep }: { currentStep: number }) {
    const [step, setStep] = useState(currentStep === 0 ? 1 : currentStep);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const totalSteps = 2;

    // Step 1 — Identité
    const [jobTitle, setJobTitle] = useState("");
    const [bio, setBio] = useState("");

    // Step 2 — Localisation
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [phone, setPhone] = useState("");

    const handleBack = () => setStep((s) => Math.max(1, s - 1));

    const handleNext = () => {
        startTransition(async () => {
            try {
                let data: OnboardingData = {};

                if (step === 1) {
                    if (!jobTitle) { toast.error("Veuillez sélectionner votre métier."); return; }
                    if (!bio || bio.length < 10) { toast.error("Veuillez écrire une courte bio (10 caractères min)."); return; }
                    data = { jobTitle, bio };
                } else if (step === 2) {
                    if (!address) { toast.error("Veuillez renseigner votre adresse."); return; }
                    if (!city) { toast.error("Veuillez renseigner votre ville."); return; }
                    data = { address, city, zipCode, phone };
                }

                const saveResult = await saveOnboardingStep(step, data);
                if (saveResult.error) { toast.error(saveResult.error); return; }

                if (step < totalSteps) {
                    setStep(step + 1);
                } else {
                    const completeResult = await completeOnboarding();
                    if (completeResult.error) { toast.error(completeResult.error); return; }
                    toast.success("Profil complété ! Bienvenue sur Les-Extras.");
                    router.push("/marketplace");
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
                            <Label>Votre métier <span className="text-destructive">*</span></Label>
                            <Select onValueChange={setJobTitle} value={jobTitle}>
                                <SelectTrigger><SelectValue placeholder="Sélectionnez votre métier" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Educateur Spécialisé">Éducateur Spécialisé (ES)</SelectItem>
                                    <SelectItem value="Moniteur Educateur">Moniteur Éducateur (ME)</SelectItem>
                                    <SelectItem value="AES / AMP">AES / AMP</SelectItem>
                                    <SelectItem value="Surveillant de Nuit">Surveillant de Nuit</SelectItem>
                                    <SelectItem value="Maîtresse de Maison">Maîtresse de Maison</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Présentez-vous en quelques mots <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="bio"
                                placeholder="Votre expérience, vos spécialités, ce qui vous motive..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                            />
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
                                <Label htmlFor="zipCode">Code postal</Label>
                                <Input id="zipCode" placeholder="75001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
                                <Input id="city" placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <p className="text-xs text-muted-foreground">Sert au calcul des frais kilométriques et à vous contacter.</p>
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
            title={step === 1 ? "Votre Profil" : "Localisation & Contact"}
            description={step === 1 ? "Dites-nous qui vous êtes." : "Pour des missions proches de chez vous."}
        >
            <div className="space-y-6">
                {renderStepContent()}
                <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={handleBack} disabled={isPending || step === 1}>Retour</Button>
                    <Button onClick={handleNext} disabled={isPending}>
                        {isPending ? "Enregistrement…" : step < totalSteps ? "Continuer" : "Terminer"}
                    </Button>
                </div>
            </div>
        </StepLayout>
    );
}

