import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  return NextResponse.json(
    { error: "Invalid request" },
    { status: 400 },
  );
}

export function serverError(error: unknown, label: string): NextResponse {
  console.error(`[${label}]`, error instanceof Error ? error.message : error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}

export function logTiming(label: string, start: number): void {
  const elapsed = Date.now() - start;
  if (elapsed > 200) {
    console.warn(`[TIMING] ${label} took ${elapsed}ms`);
  }
}
