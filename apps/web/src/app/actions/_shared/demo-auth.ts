"use server";

import { apiRequest } from "@/lib/api";

export type DemoRole = "CLIENT" | "TALENT" | "ADMIN";

type DemoAuthSession = {
  token: string;
  userId: string;
};

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: DemoRole;
  };
};

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "LesExtrasDemo!2026";

const DEMO_CREDENTIALS: Record<DemoRole, { email: string }> = {
  CLIENT: { email: "directeur@mecs-avenir.fr" },
  TALENT: { email: "karim.educ@gmail.com" },
  ADMIN: { email: "admin@lesextras.local" },
};

const authCache = new Map<DemoRole, DemoAuthSession>();

export async function getDemoAuth(role: DemoRole): Promise<DemoAuthSession> {
  const cached = authCache.get(role);
  if (cached) {
    return cached;
  }

  const credentials = DEMO_CREDENTIALS[role];

  try {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: {
        email: credentials.email,
        password: DEMO_PASSWORD,
      },
    });

    if (response.user.role !== role) {
      throw new Error("Role mismatch for demo user.");
    }

    const session = {
      token: response.accessToken,
      userId: response.user.id,
    };

    authCache.set(role, session);
    return session;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown auth error";
    throw new Error(
      `Impossible de connecter le compte démo ${role}. Vérifiez le seed API (${message}).`,
    );
  }
}
