import "server-only";

import { getServerSession } from "next-auth";
import { getToken, type GetTokenParams, type JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: Role;
  teamId: string | null;
  ownedTeamId: string | null;
};

type AuthOptions = {
  requireTeam?: boolean;
};

const SESSION_COOKIE_NAMES = ["next-auth.session-token", "__Secure-next-auth.session-token"] as const;
const AUTH_DEBUG = process.env.AUTH_DEBUG === "true";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function parseCookiesFromHeader(request: NextRequest | Request): Record<string, string> {
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

function tokenUserId(token: JWT | null): string | undefined {
  return typeof token?.id === "string" ? token.id : token?.sub;
}

function safeCookieNames(cookies: Record<string, string>): string[] {
  return Object.keys(cookies).filter((name) =>
    SESSION_COOKIE_NAMES.some((cookieName) => name.startsWith(cookieName)),
  );
}

async function resolveToken(request: NextRequest | Request) {
  const cookieNames = new Set<string>([
    process.env.NEXTAUTH_URL?.startsWith("https://")
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
    ...SESSION_COOKIE_NAMES,
  ]);

  for (const cookieName of cookieNames) {
    const token = await getToken({
      req: request as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });
    if (token) return token;
  }

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

async function resolveUserId(request?: NextRequest | Request): Promise<string | null | undefined> {
  if (request) {
    // Method A/B: decode the JWT from request cookies. We try secure and
    // non-secure cookie names because deployments can disagree with NEXTAUTH_URL.
    const token = await resolveToken(request);
    const id = tokenUserId(token);
    if (id) return id;

    // Method C: getServerSession fallback (uses cookies() from next/headers).
    // Works in Server Components and some Route Handler contexts.
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) return session.user.id;
    } catch {
      // cookies() from next/headers may throw in Route Handlers
    }

    return null;
  }
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

export async function inspectAuthRequest(request: NextRequest | Request) {
  const rawCookies = parseCookiesFromHeader(request);
  const token = await resolveToken(request);
  const tokenId = tokenUserId(token);

  let asyncCookieNames: string[] = [];
  let asyncCookiesError: string | null = null;
  try {
    asyncCookieNames = (await cookies())
      .getAll()
      .map((cookie) => cookie.name)
      .filter((name) => SESSION_COOKIE_NAMES.some((cookieName) => name.startsWith(cookieName)));
  } catch (error) {
    asyncCookiesError = error instanceof Error ? error.message : String(error);
  }

  let session = null;
  let sessionError: string | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    sessionError = error instanceof Error ? error.message : String(error);
  }

  const sessionUserId = session?.user?.id ?? null;
  const resolvedUserId = tokenId ?? sessionUserId;
  const dbUser = resolvedUserId
    ? await prisma.user.findUnique({
        where: { id: resolvedUserId },
        select: { id: true, email: true, teamId: true, role: true },
      })
    : null;

  return {
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    url: request.url,
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    hasCookieHeader: !!request.headers.get("cookie"),
    rawSessionCookieNames: safeCookieNames(rawCookies),
    nextRequestSessionCookieNames:
      "cookies" in request && typeof request.cookies?.getAll === "function"
        ? request.cookies
            .getAll()
            .map((cookie) => cookie.name)
            .filter((name) => SESSION_COOKIE_NAMES.some((cookieName) => name.startsWith(cookieName)))
        : null,
    asyncCookieNames,
    asyncCookiesError,
    getToken: {
      success: !!token,
      id: typeof token?.id === "string" ? token.id : null,
      sub: token?.sub ?? null,
      teamId: typeof token?.teamId === "string" ? token.teamId : null,
      role: typeof token?.role === "string" ? token.role : null,
    },
    getServerSession: {
      success: !!session,
      userId: sessionUserId,
      teamId: session?.user?.teamId ?? null,
      role: session?.user?.role ?? null,
      error: sessionError,
    },
    prismaUser: dbUser
      ? {
          found: true,
          id: dbUser.id,
          email: dbUser.email,
          teamId: dbUser.teamId,
          role: dbUser.role,
        }
      : { found: false, checkedId: resolvedUserId },
    env: {
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
  };
}

const DEV_BYPASS = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export async function requireAuth(options: AuthOptions = {}, request?: NextRequest | Request): Promise<AuthUser> {
  const { requireTeam = true } = options;

  if (DEV_BYPASS) {
    return {
      id: "dev-bypass-user",
      email: "dev@example.com",
      name: "Dev User",
      image: null,
      role: "ADMIN" as Role,
      teamId: "dev-team-id",
      ownedTeamId: "dev-team-id",
    };
  }

  const userId = await resolveUserId(request);

  if (!userId) {
    if (AUTH_DEBUG && request) {
      console.warn("[auth] requireAuth unresolved user", await inspectAuthRequest(request));
    }
    throw new AuthError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      teamId: true,
      ownedTeam: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    if (AUTH_DEBUG && request) {
      console.warn("[auth] requireAuth missing prisma user", await inspectAuthRequest(request));
    }
    throw new AuthError("Unauthorized", 401);
  }

  if (requireTeam && !user.teamId) {
    throw new AuthError("Team required", 428);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    teamId: user.teamId,
    ownedTeamId: user.ownedTeam?.id ?? null,
  };
}

export async function requireRole(
  roles: Role | Role[],
  options: AuthOptions = {},
  request?: NextRequest | Request,
): Promise<AuthUser> {
  const user = await requireAuth(options, request);
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }

  return user;
}

export function requireTeamOwner(user: AuthUser): void {
  if (!user.teamId || user.ownedTeamId !== user.teamId) {
    throw new AuthError("Only the team owner can perform this action", 403);
  }
}

export function authErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof AuthError)) {
    return null;
  }

  return NextResponse.json({ error: error.message }, { status: error.status });
}
