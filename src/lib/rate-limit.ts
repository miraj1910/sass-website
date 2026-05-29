type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000; // every 60s
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetInMs: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now >= entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetInMs: entry.resetAt - now };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetInMs: entry.resetAt - now };
}

export function rateLimitByIp(
  request: Request,
  config: RateLimitConfig,
): ReturnType<typeof rateLimit> {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return rateLimit(`ip:${ip}`, config);
}

export function rateLimitByUser(
  userId: string,
  config: RateLimitConfig,
): ReturnType<typeof rateLimit> {
  return rateLimit(`user:${userId}`, config);
}
