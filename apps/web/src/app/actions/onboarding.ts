"use server";

import { revalidatePath } from "next/cache";
import { getSession, createSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { MAX_STEP_BY_ROLE } from "@/lib/constants";

export type OnboardingData = {
    // Freelance
    jobTitle?: string;
    bio?: string;
    skills?: string[];
    diplomaUrl?: string; // We'll just store the URL for now
    address?: string;

    // Establishment
    establishmentName?: string;
    establishmentType?: string; // MECS, EHPAD...
    phone?: string;
    contactName?: string;
    city?: string;
    zipCode?: string;
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

    // Update local session to completed state based on role
    const userRole = session.user.role as keyof typeof MAX_STEP_BY_ROLE;
    const maxStep = MAX_STEP_BY_ROLE[userRole] || 4;
    
    session.user.onboardingStep = maxStep;
    await createSession(session);

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
}

export async function uploadDiploma(formData: FormData): Promise<{ url: string }> {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const { getApiBaseUrl } = await import("@/lib/api");
    const url = `${getApiBaseUrl()}/users/me/diploma`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Erreur lors de l'upload du diplôme");
    }

    const data = await response.json();
    return data;
}

export const updateProfile = saveOnboardingStep;
