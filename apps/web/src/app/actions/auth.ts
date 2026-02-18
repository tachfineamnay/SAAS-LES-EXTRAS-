"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { z } from "zod";

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
        await apiRequest("/auth/register", {
            method: "POST",
            body: { email, password, role },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription.";
        return {
            message,
        };
    }

    // Redirect on success
    redirect("/welcome");
}
