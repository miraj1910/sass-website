import { describe, it, expect } from "vitest";
import { badRequest, serverError } from "@/lib/api-utils";
import { z } from "zod";

describe("badRequest", () => {
  it("returns 400 with Zod error message", () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    const res = badRequest(result.error!);
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-Zod errors", () => {
    const res = badRequest(new Error("generic"));
    expect(res.status).toBe(400);
  });
});

describe("serverError", () => {
  it("returns 500", () => {
    const res = serverError(new Error("test error"), "test.label");
    expect(res.status).toBe(500);
  });
});
