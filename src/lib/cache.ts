import "server-only";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryStore = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 60_000;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (getRedisUrl()) {
      try {
        const { default: Redis } = await import("ioredis");
        const redis = new Redis(getRedisUrl()!);
        const raw = await redis.get(key);
        await redis.quit();
        if (!raw) return null;
        return JSON.parse(raw) as T;
      } catch {
        /* fallback to memory */
      }
    }

    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value as T;
  },

  async set<T>(key: string, value: T, ttlMs = DEFAULT_TTL): Promise<void> {
    if (getRedisUrl()) {
      try {
        const { default: Redis } = await import("ioredis");
        const redis = new Redis(getRedisUrl()!);
        await redis.set(key, JSON.stringify(value), "PX", ttlMs);
        await redis.quit();
        return;
      } catch {
        /* fallback to memory */
      }
    }

    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  },

  async del(key: string): Promise<void> {
    if (getRedisUrl()) {
      try {
        const { default: Redis } = await import("ioredis");
        const redis = new Redis(getRedisUrl()!);
        await redis.del(key);
        await redis.quit();
        return;
      } catch {
        /* fallback to memory */
      }
    }

    memoryStore.delete(key);
  },

  async remember<T>(
    key: string,
    fetch: () => Promise<T>,
    ttlMs = DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fetch();
    await this.set(key, value, ttlMs);
    return value;
  },

  async invalidatePattern(pattern: string): Promise<void> {
    if (getRedisUrl()) {
      try {
        const { default: Redis } = await import("ioredis");
        const redis = new Redis(getRedisUrl()!);
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        await redis.quit();
        return;
      } catch {
        /* fallback to memory */
      }
    }

    for (const key of memoryStore.keys()) {
      if (key.startsWith(pattern.replace("*", ""))) {
        memoryStore.delete(key);
      }
    }
  },

  get size(): number {
    return memoryStore.size;
  },
};
