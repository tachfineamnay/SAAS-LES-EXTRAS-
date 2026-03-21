"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepLayoutProps = {
    currentStep: number;
    totalSteps: number;
    title: string;
    description: string;
    children: React.ReactNode;
    stepLabels?: string[];
};

export function StepLayout({
    currentStep,
    totalSteps,
    title,
    description,
    children,
    stepLabels,
}: StepLayoutProps) {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            {/* Step Indicator */}
            <div className="mb-8 flex items-center justify-center">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const stepNum = i + 1;
                    const isCompleted = stepNum < currentStep;
                    const isActive = stepNum === currentStep;
                    return (
                        <div key={i} className="flex items-center">
                            <div className="flex flex-col items-center gap-1.5">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300",
                                        isCompleted && "bg-[hsl(var(--teal))] text-white",
                                        isActive && "bg-[hsl(var(--teal))] text-white shadow-[0_0_0_4px_hsl(var(--teal)/0.15)]",
                                        !isCompleted && !isActive && "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border))]"
                                    )}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                                </motion.div>
                                {stepLabels?.[i] && (
                                    <span className={cn(
                                        "text-xs font-medium whitespace-nowrap",
                                        isActive ? "text-[hsl(var(--teal))]" : "text-[hsl(var(--text-tertiary))]"
                                    )}>
                                        {stepLabels[i]}
                                    </span>
                                )}
                            </div>
                            {i < totalSteps - 1 && (
                                <div className={cn(
                                    "mx-3 h-0.5 w-12 rounded-full transition-colors duration-300",
                                    stepNum < currentStep ? "bg-[hsl(var(--teal))]" : "bg-[hsl(var(--border))]"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel rounded-2xl p-8 card-shadow-md"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="mb-6 space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--text-primary))]">{title}</h1>
                            <p className="text-[hsl(var(--text-secondary))]">{description}</p>
                        </div>
                        {children}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
