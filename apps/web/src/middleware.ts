import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "lesextras_admin_token";
const DEFAULT_DESK_HOST = "desk.les-extras.com";

function normalizeHost(host: string): string {
  const firstValue = host.split(",")[0] ?? "";
  const withoutPort = firstValue.trim().toLowerCase().split(":")[0] ?? "";
  return withoutPort;
}

function getRequestHost(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    return normalizeHost(forwardedHost);
  }

  return normalizeHost(request.nextUrl.host);
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const host = getRequestHost(request);
  const pathname = request.nextUrl.pathname;
  const deskHost = (process.env.APP_DESK_HOST ?? DEFAULT_DESK_HOST).toLowerCase();
  const isLocalDevHost =
    process.env.NODE_ENV !== "production" &&
    (host === "localhost" || host === "127.0.0.1");

  const isDeskHost = host === deskHost || isLocalDevHost;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPath = pathname === "/admin/login";
  const isAdminAuthApiPath = pathname.startsWith("/api/admin-auth/");

  if (isAdminAuthApiPath) {
    return NextResponse.next();
  }

  if (isDeskHost) {
    if (!isAdminPath) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isAdminLoginPath) {
      const isValidSession = await hasValidAdminSession(request);
      if (isValidSession) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    }

    const isValidSession = await hasValidAdminSession(request);
    if (!isValidSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  if (isAdminPath) {
    return NextResponse.redirect(new URL("/marketplace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
