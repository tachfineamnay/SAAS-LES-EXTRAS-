"use server";

import { z } from "zod";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { revalidatePath } from "next/cache";

const sendMessageSchema = z.object({
    receiverId: z.string(),
    content: z.string().min(1, "Le message ne peut pas être vide"),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;

export async function sendMessage(data: SendMessageData) {
    const session = await getSession();

    if (!session) {
        return { error: "Non connecté" };
    }

    const validatedFields = sendMessageSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Données invalides" };
    }

    try {
        await apiRequest("/conversations/messages", {
            method: "POST",
            token: session.token,
            body: validatedFields.data,
        });

        revalidatePath("/dashboard/inbox");
        return { success: true };
    } catch (error) {
        console.error("SendMessage error:", error);
        return { error: "Erreur lors de l'envoi du message" };
    }
}

export async function getUnreadMessagesCount() {
    const session = await getSession();
    if (!session) return 0;

    try {
        const conversations = await apiRequest<{ unreadCount: number }[]>("/conversations", {
            token: session.token,
        });
        return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    } catch {
        return 0;
    }
}

export async function getNotifications() {
    // Notifications are not exposed via REST API — return empty array
    return [];
}

export async function markNotificationAsRead(_id: string) {
    // Notifications are not exposed via REST API — no-op
    return { success: true };
}
