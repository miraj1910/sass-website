import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  const status = { ok: true as boolean, db: false as boolean, uptime: process.uptime() };
  const errors: string[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.db = true;
  } catch {
    status.ok = false;
    errors.push("database unreachable");
  }

  const elapsed = Date.now() - start;
  if (!status.ok) {
    console.error(`[HEALTH] FAILED in ${elapsed}ms: ${errors.join(", ")}`);
  }

  return NextResponse.json(
    { ...status, elapsedMs: elapsed, errors: errors.length > 0 ? errors : undefined },
    { status: status.ok ? 200 : 503 },
  );
}
