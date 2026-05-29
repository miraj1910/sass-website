import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, rateLimitByIp, rateLimitByUser } from "@/lib/rate-limit";

// Import the module to access the internal store for reset
// We test behavior, not internals

describe("rateLimit", () => {
  beforeEach(() => {
    // Each test isolates via unique identifiers
  });

  it("allows first request", () => {
    const result = rateLimit("test-1", { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks when exceeding limit", () => {
    const id = "test-2";
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { maxRequests: 2, windowMs: 60_000 });
    }
    // Third attempt should be blocked
    const result = rateLimit(id, { maxRequests: 2, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining correctly", () => {
    const id = "test-3";
    const first = rateLimit(id, { maxRequests: 10, windowMs: 60_000 });
    expect(first.remaining).toBe(9);

    const second = rateLimit(id, { maxRequests: 10, windowMs: 60_000 });
    expect(second.remaining).toBe(8);
  });

  it("returns reset time in ms", () => {
    const id = "test-4";
    const result = rateLimit(id, { maxRequests: 1, windowMs: 60_000 });
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(60_000);
  });
});

describe("rateLimitByUser", () => {
  it("uses user-based key", () => {
    const result = rateLimitByUser("user-abc", { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
  });
});

describe("rateLimitByIp", () => {
  it("extracts IP from x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.168.1.1" },
    });
    const result = rateLimitByIp(request, { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
  });

  it("falls back to unknown when no IP header", () => {
    const request = new Request("http://localhost");
    const result = rateLimitByIp(request, { maxRequests: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
  });
});
