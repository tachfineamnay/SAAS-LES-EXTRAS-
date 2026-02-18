"use server";

import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/stores/useUIStore";

const LoginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(1, { message: "Mot de passe requis" }),
});

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
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
    };
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = LoginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        const response = await apiRequest<AuthResponse>("/auth/login", {
            method: "POST",
            body: { email, password },
        });

        await createSession({
            token: response.accessToken,
            user: {
                id: response.user.id,
                email: response.user.email,
                role: response.user.role as UserRole,
            },
        });
    } catch (error) {
        return {
            message: "Email ou mot de passe incorrect.",
        };
    }

    redirect("/dashboard");
}
