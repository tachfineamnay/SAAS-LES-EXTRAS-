"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { UserRole } from "@/lib/stores/useUIStore";

const RegisterSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
    role: z.enum(["CLIENT", "TALENT"], { message: "Rôle invalide" }),
});

export type RegisterState = {
    errors?: {
        email?: string[];
        password?: string[];
        role?: string[];
        _form?: string[];
    };
    message?: string;
} | undefined;

type AuthResponse = {
    accessToken: string;
    user: {
        id: string;
        email: string;
        role: "CLIENT" | "TALENT" | "ADMIN";
        onboardingStep: number;
    };
};

export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const validatedFields = RegisterSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Veuillez vérifier les champs du formulaire.",
        };
    }

    const { email, password, role } = validatedFields.data;

    try {
        const response = await apiRequest<AuthResponse>("/auth/register", {
            method: "POST",
            body: { email, password, role },
        });

        await createSession({
            token: response.accessToken,
            user: {
                id: response.user.id,
                email: response.user.email,
                role: response.user.role as UserRole,
                onboardingStep: response.user.onboardingStep,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription.";
        return {
            message,
        };
    }

    // Redirect to dashboard now that we have a session
    redirect("/dashboard");
}
