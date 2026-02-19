"use client";

import { useEffect, useState } from "react";
import { FreelanceFlow } from "./FreelanceFlow";
import { ClientFlow } from "./ClientFlow";
import { UserRole } from "@prisma/client";
import { useUIStore } from "@/lib/stores/useUIStore";

type OnboardingGuardProps = {
    children: React.ReactNode;
    userRole: UserRole;
    onboardingStep: number;
};

export function OnboardingGuard({ children, userRole, onboardingStep }: OnboardingGuardProps) {
    const [mounted, setMounted] = useState(false);
    const { setUserRole, setOnboardingStep } = useUIStore();

    useEffect(() => {
        setMounted(true);
        if (userRole === "CLIENT" || userRole === "TALENT") {
            setUserRole(userRole);
        }
        setOnboardingStep(onboardingStep);
    }, [userRole, onboardingStep, setUserRole, setOnboardingStep]);

    if (!mounted) {
        return <>{children}</>;
    }

    // Assuming max steps = 4 for now.
    const isComplete = onboardingStep >= 4;

    if (!isComplete) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
                <div className="w-full max-w-2xl">
                    {userRole === "TALENT" ? (
                        <FreelanceFlow currentStep={onboardingStep} />
                    ) : userRole === "CLIENT" ? (
                        <ClientFlow currentStep={onboardingStep} />
                    ) : (
                        <>{children}</>
                    )}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
