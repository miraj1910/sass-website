import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken, type GetTokenParams } from "next-auth/jwt";

const SESSION_COOKIE_NAMES = ["next-auth.session-token", "__Secure-next-auth.session-token"] as const;

function parseCookiesFromHeader(request: NextRequest): Record<string, string> {
  const header = request.headers.get("cookie") || "";
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.substring(0, idx).trim();
    const value = part.substring(idx + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

function hasSessionCookie(cookies: Record<string, string>): boolean {
  return Object.keys(cookies).some((name) =>
    SESSION_COOKIE_NAMES.some((cookieName) => name.startsWith(cookieName)),
  );
}

async function resolveToken(request: NextRequest) {
  const cookieNames = new Set<string>([
    process.env.NEXTAUTH_URL?.startsWith("https://")
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
    ...SESSION_COOKIE_NAMES,
  ]);

  // Method A: native NextRequest cookies.
  for (const cookieName of cookieNames) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, cookieName });
    if (token) return token;
  }

  // Method B: raw Cookie header fallback for Route Handler/proxy cookie edge cases.
  const rawCookies = parseCookiesFromHeader(request);
  if (!hasSessionCookie(rawCookies)) return null;

  const cookieRequest = { cookies: rawCookies, headers: request.headers } as unknown as GetTokenParams["req"];

  for (const cookieName of cookieNames) {
    const token = await getToken({
      req: cookieRequest,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });
    if (token) return token;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const token = await resolveToken(request);

  const { pathname } = request.nextUrl;
  if (process.env.AUTH_DEBUG === "true") {
    console.log("HOST:", request.headers.get("host"));
    console.log("COOKIE:", request.headers.get("cookie"));
    console.log("URL:", request.nextUrl.pathname);
  }

  // Skip proxy for API routes and static assets.
  // API routes self-protect via requireAuth() in each handler.
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Not logged in → send to login
  if (!token) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in, no team → send to onboarding
  if (!token.teamId && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (token.teamId && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
