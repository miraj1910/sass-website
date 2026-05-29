import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/cache";
import { eventBus, EVENTS } from "@/lib/event-bus";

function generateApiKey(): string {
  const prefix = "pd_";
  const random = crypto.randomBytes(32).toString("hex");
  return `${prefix}${random}`;
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createApiKey(params: {
  userId: string;
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}): Promise<{ id: string; key: string; name: string }> {
  const rawKey = generateApiKey();
  const hashedKey = hashKey(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: params.userId,
      name: params.name,
      key: hashedKey,
      scopes: (params.scopes ?? ["read"]).join(","),
      expiresAt: params.expiresInDays
        ? new Date(Date.now() + params.expiresInDays * 86400000)
        : null,
    },
    select: { id: true, name: true },
  });

  eventBus.emit(EVENTS.API_KEY_CREATED, {
    userId: params.userId,
    keyId: apiKey.id,
    name: params.name,
  });

  return { ...apiKey, key: rawKey };
}

export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId, revokedAt: null },
    select: {
      id: true,
      name: true,
      scopes: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(keyId: string, userId: string): Promise<void> {
  const existing = await prisma.apiKey.findFirst({
    where: { id: keyId, userId, revokedAt: null },
  });

  if (!existing) {
    throw new Error("API key not found");
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  eventBus.emit(EVENTS.API_KEY_REVOKED, {
    userId,
    keyId,
    name: existing.name,
  });
}

type AuthResult = {
  authenticated: boolean;
  userId?: string;
  error?: string;
  scopes?: string[];
};

export async function authenticateApiKey(
  request: Request,
): Promise<AuthResult | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { authenticated: false, error: "Invalid authorization header format" };
  }

  const rawKey = match[1];
  if (!rawKey.startsWith("pd_")) {
    return null;
  }

  const hashedKey = hashKey(rawKey);

  const cached = await cache.get<{ userId: string; scopes: string[] }>(
    `apikey:${hashedKey}`,
  );
  if (cached) {
    return { authenticated: true, userId: cached.userId, scopes: cached.scopes };
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      key: hashedKey,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true, userId: true, scopes: true },
  });

  if (!apiKey) {
    return { authenticated: false, error: "Invalid or expired API key" };
  }

  const scopes = apiKey.scopes.split(",");

  await cache.set(`apikey:${hashedKey}`, { userId: apiKey.userId, scopes }, 300_000);

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { authenticated: true, userId: apiKey.userId, scopes };
}

export function requireScope(auth: AuthResult, requiredScope: string): void {
  if (!auth.authenticated || !auth.scopes) {
    throw new Error("Unauthorized");
  }
  if (!auth.scopes.includes(requiredScope) && !auth.scopes.includes("*")) {
    throw new Error(`Missing required scope: ${requiredScope}`);
  }
}
