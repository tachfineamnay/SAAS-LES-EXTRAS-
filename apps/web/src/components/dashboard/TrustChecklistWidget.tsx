"use client";

import { CheckCircle2, Circle, Upload, User, FileText, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepStatus = "COMPLETED" | "PENDING" | "MISSING";

type VerificationStep = {
    id: string;
    label: string;
    icon: React.ReactNode;
    status: StepStatus;
};

const STEPS: VerificationStep[] = [
    {
        id: "photo",
        label: "Photo de profil",
        icon: <User className="h-4 w-4" />,
        status: "COMPLETED",
    },
    {
        id: "bio",
        label: "Biographie",
        icon: <FileText className="h-4 w-4" />,
        status: "COMPLETED",
    },
    {
        id: "diploma",
        label: "Diplômes",
        icon: <GraduationCap className="h-4 w-4" />,
        status: "MISSING",
    },
    {
        id: "identity",
        label: "Pièce d'identité",
        icon: <ShieldCheck className="h-4 w-4" />,
        status: "PENDING",
    },
];

export function TrustChecklistWidget() {
    const completedCount = STEPS.filter((s) => s.status === "COMPLETED").length;
    const progress = Math.round((completedCount / STEPS.length) * 100);

    return (
        <div className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Profil de confiance</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {STEPS.map((step) => (
                    <div key={step.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border",
                                    step.status === "COMPLETED"
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                        : "border-muted bg-background text-muted-foreground",
                                )}
                            >
                                {step.status === "COMPLETED" ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    step.icon
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    step.status === "COMPLETED" ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {step.status !== "COMPLETED" && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                {step.status === "PENDING" ? "En cours" : "Ajouter"}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                <p>Un profil vérifié à 100% augmente vos chances d'être sélectionné par les établissements.</p>
            </div>
        </div>
    );
}
