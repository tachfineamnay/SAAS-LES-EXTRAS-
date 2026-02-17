import "server-only";

import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "lesextras_admin_token";

export function getAdminSessionToken(): string {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    throw new Error("Session admin requise.");
  }

  return token;
}
