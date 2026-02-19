"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StepLayoutProps = {
    currentStep: number;
    totalSteps: number;
    title: string;
    description: string;
    children: React.ReactNode;
};

export function StepLayout({
    currentStep,
    totalSteps,
    title,
    description,
    children,
}: StepLayoutProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>
                        Étape {currentStep} sur {totalSteps}
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${Math.round(progress)}%` }}
                    />
                </div>
            </div>

            {/* Content Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                {children}
            </div>
        </div>
    );
}
