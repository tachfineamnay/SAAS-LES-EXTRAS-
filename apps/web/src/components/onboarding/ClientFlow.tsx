"use client";

import { useState, useTransition } from "react";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOnboardingStep, completeOnboarding, type OnboardingData } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ClientFlow({ currentStep }: { currentStep: number }) {
    const [step, setStep] = useState(currentStep === 0 ? 1 : currentStep);
    const [isPending, startTransition] = useTransition();

    // State
    const [establishmentName, setEstablishmentName] = useState("");
    const [establishmentType, setEstablishmentType] = useState("");
    const [address, setAddress] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");

    const totalSteps = 3;

    const handleNext = () => {
        startTransition(async () => {
            try {
                let data: OnboardingData = {};

                if (step === 1) {
                    if (!establishmentName) throw new Error("Nom de l'établissement requis.");
                    if (!establishmentType) throw new Error("Type d'établissement requis.");
                    data = { establishmentName, establishmentType };
                } else if (step === 2) {
                    if (!address) throw new Error("Adresse du siège requise.");
                    data = { address };
                } else if (step === 3) {
                    if (!contactName || !phone) throw new Error("Contact et téléphone requis.");
                    data = { contactName, phone };
                }

                await saveOnboardingStep(step, data);

                if (step < totalSteps) {
                    setStep(step + 1);
                } else {
                    await completeOnboarding();
                    toast.success("Établissement configuré !");
                    window.location.reload();
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
                            <Label htmlFor="name">Nom de l'établissement</Label>
                            <Input
                                id="name"
                                placeholder="Ex: MECS Les Érables"
                                value={establishmentName}
                                onChange={(e) => setEstablishmentName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de structure</Label>
                            <Select onValueChange={setEstablishmentType} value={establishmentType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MECS">MECS</SelectItem>
                                    <SelectItem value="EHPAD">EHPAD</SelectItem>
                                    <SelectItem value="ITEP">ITEP</SelectItem>
                                    <SelectItem value="IME">IME</SelectItem>
                                    <SelectItem value="AEMO">AEMO</SelectItem>
                                    <SelectItem value="Autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse du Siège Social</Label>
                            <Input
                                id="address"
                                placeholder="10 rue de la République, 75001 Paris"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Cette adresse figurera sur vos factures.
                            </p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">Nom du Responsable</Label>
                            <Input
                                id="contact"
                                placeholder="Jean Dupont"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone direct</Label>
                            <Input
                                id="phone"
                                placeholder="06 12 34 56 78"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
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
            title={
                step === 1 ? "Identité de la Structure" :
                    step === 2 ? "Facturation" :
                        "Contact Prioritaire"
            }
            description={
                step === 1 ? "Définissons votre établissement." :
                    step === 2 ? "Où devons-nous envoyer les factures ?" :
                        "Pour faciliter les échanges."
            }
        >
            <div className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={handleNext} disabled={isPending}>
                        {isPending ? "Enregistrement..." : step === totalSteps ? "Terminer" : "Suivant"}
                    </Button>
                </div>
            </div>
        </StepLayout>
    );
}
