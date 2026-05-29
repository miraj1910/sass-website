import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function parseCookieHeader(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.substring(0, idx).trim();
    const value = part.substring(idx + 1).trim();
    if (name) cookies[name] = value ? "[present]" : "";
  }
  return cookies;
}

export async function GET(request: NextRequest) {
  if (process.env.AUTH_DEBUG !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token =
    (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token",
    })) ??
    (await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "__Secure-next-auth.session-token",
    }));

  return NextResponse.json({
    host: request.headers.get("host"),
    url: request.url,
    pathname: request.nextUrl.pathname,
    cookieHeader,
    parsedCookies: parseCookieHeader(cookieHeader),
    nextRequestCookies: request.cookies.getAll().map((cookie) => ({
      name: cookie.name,
      present: !!cookie.value,
    })),
    tokenPresent: !!token,
    tokenUserId: token?.id ?? token?.sub ?? null,
    tokenTeamId: token?.teamId ?? null,
    env: {
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    },
  });
}
