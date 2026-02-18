"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/stores/useUIStore";

export type Session = {
    token: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
};

const SESSION_COOKIE_NAME = "lesextras_session";

export async function createSession(session: Session) {
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });
}

export async function getSession(): Promise<Session | null> {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    try {
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}

export async function deleteSession() {
    cookies().delete(SESSION_COOKIE_NAME);
}

export async function getUserRole(): Promise<UserRole | null> {
    const session = await getSession();
    return session?.user.role ?? null;
}

export async function requireUser() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    return session;
}
