"use server";

import { z } from "zod";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    jobTitle: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    siret: z.string().optional(), // We could add regex for SIRET validation
    tvaNumber: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export async function updateFreelanceProfile(data: ProfileFormValues) {
    const session = await getSession();

    if (!session) {
        return { error: "Non connecté" };
    }

    const validatedFields = profileSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Données invalides", details: validatedFields.error.flatten() };
    }

    try {
        await apiRequest("/users/me", {
            method: "PATCH",
            token: session.token,
            body: {
                firstName: data.firstName,
                lastName: data.lastName,
                jobTitle: data.jobTitle,
                bio: data.bio,
                skills: data.skills || [],
                phone: data.phone,
                address: data.address,
                city: data.city,
                zipCode: data.zipCode,
                siret: data.siret,
                tvaNumber: data.tvaNumber,
            },
        });

        revalidatePath("/account");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Une erreur est survenue lors de la mise à jour du profil." };
    }
}
