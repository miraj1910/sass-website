import { describe, it, expect } from "vitest";
import {
  metricCreateSchema,
  checkoutSchema,
  teamCreateSchema,
  teamInviteSchema,
} from "@/lib/validations";

describe("metricCreateSchema", () => {
  it("accepts valid metric payload", () => {
    const result = metricCreateSchema.safeParse({ key: "test_metric", value: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects missing key", () => {
    const result = metricCreateSchema.safeParse({ value: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects empty key", () => {
    const result = metricCreateSchema.safeParse({ key: "", value: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric value", () => {
    const result = metricCreateSchema.safeParse({ key: "test", value: "not-a-number" });
    expect(result.success).toBe(false);
  });

  it("rejects missing value", () => {
    const result = metricCreateSchema.safeParse({ key: "test" });
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("accepts valid priceId", () => {
    const result = checkoutSchema.safeParse({ priceId: "price_123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty priceId", () => {
    const result = checkoutSchema.safeParse({ priceId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing priceId", () => {
    const result = checkoutSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("teamCreateSchema", () => {
  it("accepts valid team name", () => {
    const result = teamCreateSchema.safeParse({ name: "My Team" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = teamCreateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = teamCreateSchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = teamCreateSchema.safeParse({ name: "  My Team  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Team");
    }
  });
});

describe("teamInviteSchema", () => {
  it("accepts valid email", () => {
    const result = teamInviteSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = teamInviteSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("normalizes email", () => {
    const result = teamInviteSchema.safeParse({ email: " USER@Example.COM " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});
