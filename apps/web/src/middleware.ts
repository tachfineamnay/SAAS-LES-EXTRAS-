import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "lesextras_admin_token";
const FRONT_RUNTIME = "front";
const DESK_RUNTIME = "desk";
type AppRuntime = typeof FRONT_RUNTIME | typeof DESK_RUNTIME;

function getAppRuntime(): AppRuntime {
  const runtime = (process.env.APP_RUNTIME ?? FRONT_RUNTIME).toLowerCase();
  return runtime === DESK_RUNTIME ? DESK_RUNTIME : FRONT_RUNTIME;
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
  const runtime = getAppRuntime();
  const pathname = request.nextUrl.pathname;
  const isHealthPath = pathname === "/health";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPath = pathname === "/admin/login";
  const isAdminAuthApiPath = pathname.startsWith("/api/admin-auth/");

  if (isHealthPath) {
    return NextResponse.next();
  }

  if (isAdminAuthApiPath) {
    return NextResponse.next();
  }

  if (runtime === FRONT_RUNTIME) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL("/marketplace", request.url));
    }

    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

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

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
