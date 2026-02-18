"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
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

    // We need an endpoint in the API to update user profile + onboardingStep
    // Let's assume PUT /users/me or PATCH /users/me existing, 
    // OR create a specific one POST /users/me/onboarding/step

    // Since we didn't plan a specific API endpoint for this granular update in the plan,
    // we might need to use the existing update profile endpoint if it supports these fields,
    // or quickly create a new one. 

    // The User model has `onboardingStep`. The `Profile` model has `bio`, `jobTitle`.
    // Address is on `ReliefMission` usually, but for User/Profile we might need to add it there too?
    // Wait, the plan said "Address (pour le calcul des frais)". 
    // Let's check Schema for Profile fields.

    // For now, let's implement the action expecting a generic update endpoint.
    // We'll likely need to update the API to handle `onboardingStep`.

    await apiRequest(`/users/me/onboarding`, {
        method: "PATCH",
        body: { step, ...data },
        token: session.token,
    });

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

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
}
