"use server";

import { revalidatePath } from "next/cache";
import { getSession, createSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

export type OnboardingData = {
    // Freelance
    jobTitle?: string;
    bio?: string;
    skills?: string[];
    diplomaUrl?: string; // We'll just store the URL for now
    address?: string;

    // Client
    establishmentName?: string;
    establishmentType?: string; // MECS, EHPAD...
    phone?: string;
    contactName?: string;
}

export async function saveOnboardingStep(step: number, data: OnboardingData) {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    await apiRequest(`/users/me/onboarding`, {
        method: "PATCH",
        body: { step, ...data },
        token: session.token,
    });

    // Update local session
    session.user.onboardingStep = step;
    await createSession(session);

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
}

export async function completeOnboarding() {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    await apiRequest(`/users/me/onboarding/complete`, {
        method: "POST",
        token: session.token,
    });

    // Update local session to completed state (e.g., 4)
    // Assuming 4 is the completion step based on logic elsewhere
    session.user.onboardingStep = 4;
    await createSession(session);

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
}

export const updateProfile = saveOnboardingStep;
