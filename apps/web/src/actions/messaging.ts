"use server";

import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
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

    const { user } = session;
    const validatedFields = sendMessageSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: "Données invalides" };
    }

    const { receiverId, content } = validatedFields.data;

    try {
        // 1. Create DirectMessage
        // Note: We use a transaction to ensure both message and notification are created
        // @ts-ignore - DirectMessage model not yet in generated client
        await (prisma as any).$transaction(async (tx: any) => {
            await tx.directMessage.create({
                data: {
                    content,
                    senderId: user.id,
                    receiverId,
                    isRead: false,
                },
            });
            // 2. Create Notification
            await tx.notification.create({
                data: {
                    userId: receiverId,
                    type: "NEW_MESSAGE",
                    // @ts-ignore
                    message: `Nouveau message de ${user.firstName || "Utilisateur"}`,
                    // We could add metadata or link here if the model supported it, 
                    // but for now relying on type and message. 
                    // The instruction mentioned 'actionUrl' but schema doesn't have it.
                    // We'll stick to the schema: message, type.
                },
            });
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
        // @ts-ignore
        const count = await (prisma as any).directMessage.count({
            where: {
                receiverId: session.user.id,
                isRead: false,
            },
        });
        return count;
    } catch (error) {
        console.error("GetUnreadMessagesCount error:", error);
        return 0;
    }
}

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        });
        return notifications;
    } catch (error) {
        console.error("GetNotifications error:", error);
        return [];
    }
}

export async function markNotificationAsRead(id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
