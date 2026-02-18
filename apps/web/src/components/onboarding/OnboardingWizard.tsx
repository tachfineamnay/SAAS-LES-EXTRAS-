"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, MapPin, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, completeOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";

// Define steps
const steps = [
    { id: "identity", title: "Identité", icon: User },
    { id: "professional", title: "Info Pro", icon: Building },
    { id: "location", title: "Localisation", icon: MapPin },
];

export default function OnboardingWizard({ userId, userRole }: { userId: string, userRole: "CLIENT" | "TALENT" }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: "",
        jobTitle: "",
        bio: "",
        companyName: "",
        siret: "",
        address: "",
        city: "",
        zipCode: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = async () => {
        setLoading(true);

        // Save current step data
        const res = await updateProfile(userId, {
            ...formData,
            onboardingStep: currentStep + 1
        });

        setLoading(false);

        if (res.ok) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                await finalizeOnboarding();
            }
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
    };

    const finalizeOnboarding = async () => {
        setLoading(true);
        await completeOnboarding(userId);
        toast.success("Profil complété !");
        router.push("/dashboard");
    };

    const StepIcon = steps[currentStep]?.icon || User;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                <div className="relative z-10 flex justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div
                                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                        ${isActive ? "border-primary bg-primary text-white scale-110" :
                                            isCompleted ? "border-primary bg-primary text-white" : "border-muted bg-background text-muted-foreground"}
                    `}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle>Étape {currentStep + 1} : {steps[currentStep]?.title}</CardTitle>
                            <CardDescription>
                                Complétez les informations ci-dessous.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentStep === 0 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Numéro de téléphone</Label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    {userRole === "CLIENT" ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Nom de l'établissement / Société</Label>
                                                <Input
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    placeholder="Clinique des Lilas"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Numéro SIRET</Label>
                                                <Input
                                                    name="siret"
                                                    value={formData.siret}
                                                    onChange={handleInputChange}
                                                    placeholder="123 456 789 00012"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Intitulé du poste</Label>
                                                <Input
                                                    name="jobTitle"
                                                    value={formData.jobTitle}
                                                    onChange={handleInputChange}
                                                    placeholder="Infirmier DE"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bio (optionnel)</Label>
                                                <Input
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    placeholder="Quelques mots sur votre expérience..."
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Adresse</Label>
                                        <Input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="10 rue de la Paix"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Code Postal</Label>
                                            <Input
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                placeholder="75001"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ville</Label>
                                            <Input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="Paris"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={nextStep} disabled={loading} size="lg">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                                {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
