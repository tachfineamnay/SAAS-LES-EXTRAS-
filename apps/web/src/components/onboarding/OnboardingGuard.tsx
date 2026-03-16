"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/useUIStore";

type OnboardingGuardProps = {
    children: React.ReactNode;
    userRole: "ESTABLISHMENT" | "FREELANCE" | "ADMIN";
    onboardingStep: number;
};

export function OnboardingGuard({ children, userRole, onboardingStep }: OnboardingGuardProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { setUserRole, setOnboardingStep } = useUIStore();

    // ESTABLISHMENT flow has 3 steps, FREELANCE flow has 4 steps
    const maxSteps = userRole === "FREELANCE" ? 4 : 3;
    const isComplete = onboardingStep >= maxSteps;

    useEffect(() => {
        setMounted(true);
        if (userRole === "ESTABLISHMENT" || userRole === "FREELANCE") {
            setUserRole(userRole);
        }
        setOnboardingStep(onboardingStep);
    }, [userRole, onboardingStep, setUserRole, setOnboardingStep]);

    useEffect(() => {
        if (mounted && !isComplete) {
            router.push("/wizard");
        }
    }, [mounted, isComplete, router]);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    if (!isComplete) {
        return null;
    }

    return <>{children}</>;
}