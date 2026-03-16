"use server";

import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";

export type UserProfile = {
    id: string;
    email: string;
    role: "ESTABLISHMENT" | "FREELANCE" | "ADMIN";
    status: string;
    onboardingStep: number;
    isAvailable: boolean;
    createdAt: string;
    profile: {
        id: string;
        firstName: string;
        lastName: string;
        companyName: string | null;
        jobTitle: string | null;
        bio: string | null;
        skills: string[];
        address: string | null;
        city: string | null;
        zipCode: string | null;
        phone: string | null;
        siret: string | null;
        tvaNumber: string | null;
    } | null;
};

export async function getCurrentUser(): Promise<UserProfile | null> {
    const session = await getSession();
    if (!session) return null;

    try {
        return await apiRequest<UserProfile>("/users/me", {
            token: session.token,
        });
    } catch {
        return null;
    }
}
