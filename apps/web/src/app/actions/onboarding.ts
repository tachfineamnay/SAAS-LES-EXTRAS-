"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type Profile } from "@prisma/client";
import { apiRequest } from "@/lib/api";

type UpdateProfileInput = Partial<Profile>;

export async function updateProfile(
    userId: string,
    data: UpdateProfileInput,
): Promise<{ ok: boolean; error?: string }> {
    try {
        // In a real implementation, we would call the API to update the user profile
        // For now, we'll simulate it or assume the API route exists
        // await apiRequest(`/users/${userId}/profile`, { method: "PATCH", body: data });

        // Since we don't have the API route yet, we'll just log
        console.log("Updating profile for", userId, data);

        // TODO: Implement actual API call once endpoint is ready

        revalidatePath("/onboarding");
        return { ok: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { ok: false, error: "Failed to update profile" };
    }
}

export async function completeOnboarding(userId: string): Promise<void> {
    // Update user status to VERIFIED or PENDING
    console.log("Completing onboarding for", userId);

    // Navigate to dashboard
    redirect("/dashboard");
}
