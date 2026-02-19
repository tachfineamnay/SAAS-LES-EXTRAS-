"use client";

import { useState, useTransition } from "react";
import { StepLayout } from "./StepLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveOnboardingStep, completeOnboarding, type OnboardingData } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function FreelanceFlow({ currentStep }: { currentStep: number }) {
    const [step, setStep] = useState(currentStep === 0 ? 1 : currentStep);
    const [isPending, startTransition] = useTransition();

    // State for form fields
    const [jobTitle, setJobTitle] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState("");
    const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
    const [address, setAddress] = useState("");

    const totalSteps = 4;

    const handleNext = () => {
        startTransition(async () => {
            try {
                let data: OnboardingData = {};

                if (step === 1) {
                    if (!jobTitle) throw new Error("Veuillez renseigner votre métier.");
                    data = { jobTitle };
                } else if (step === 2) {
                    if (!bio) throw new Error("Veuillez écrire une courte bio.");
                    data = { bio, skills };
                } else if (step === 3) {
                    // File upload logic would go here. 
                    // For now, we simulation upload by just passing a mock URL if file is present
                    if (!diplomaFile) throw new Error("Veuillez télécharger votre diplôme.");
                    data = { diplomaUrl: "https://mock.url/diploma.pdf" };
                } else if (step === 4) {
                    if (!address) throw new Error("Veuillez renseigner votre adresse.");
                    data = { address };
                }

                await saveOnboardingStep(step, data);

                if (step < totalSteps) {
                    setStep(step + 1);
                } else {
                    await completeOnboarding();
                    toast.success("Profil complété ! En attente de validation.");
                    // Force refresh or redirect?
                    window.location.reload();
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Une erreur est survenue.");
            }
        });
    };

    const addSkill = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && currentSkill.trim()) {
            e.preventDefault();
            if (!skills.includes(currentSkill.trim())) {
                setSkills([...skills, currentSkill.trim()]);
            }
            setCurrentSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Intitulé de votre poste</Label>
                            <Select onValueChange={setJobTitle} value={jobTitle}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez votre métier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Educateur Spécialisé">Éducateur Spécialisé (ES)</SelectItem>
                                    <SelectItem value="Moniteur Educateur">Moniteur Éducateur (ME)</SelectItem>
                                    <SelectItem value="AES / AMP">AES / AMP</SelectItem>
                                    <SelectItem value="Surveillant de Nuit">Surveillant de Nuit</SelectItem>
                                    <SelectItem value="Maîtresse de Maison">Maîtresse de Maison</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bio">À propos de vous</Label>
                            <Textarea
                                id="bio"
                                placeholder="Décrivez votre expérience, vos atouts..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skills">Compétences (Appuyez sur Entrée)</Label>
                            <Input
                                id="skills"
                                placeholder="Ex: Gestion de conflit, Autisme, Permis B..."
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                onKeyDown={addSkill}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="gap-1">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive" aria-label={`Retirer la compétence ${skill}`}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-dashed p-8 text-center hover:bg-muted/50 transition-colors">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Diplôme principal</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG ou PNG (Max 5Mo)</p>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setDiplomaFile(e.target.files?.[0] || null)}
                                    className="max-w-xs mx-auto mt-4"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Ce document est nécessaire pour valider votre statut de Freelance.
                        </p>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse postale complète</Label>
                            <Input
                                id="address"
                                placeholder="10 rue de la Liberté, 75001 Paris"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Sert au calcul des frais kilométriques lors des missions.
                            </p>
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
                step === 1 ? "Identité Professionnelle" :
                    step === 2 ? "Expertise & Bio" :
                        step === 3 ? "Documents Justificatifs" :
                            "Localisation"
            }
            description={
                step === 1 ? "Dites-nous qui vous êtes." :
                    step === 2 ? "Mettez en avant vos atouts." :
                        step === 3 ? "Prouvez votre qualification." :
                            "Pour des missions proches de chez vous."
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
