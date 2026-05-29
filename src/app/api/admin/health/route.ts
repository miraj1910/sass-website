import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireRole } from "@/lib/rbac";
import { serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { getQueueSize } from "@/lib/queue";
import { metrics } from "@/lib/observability/metrics";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN", {}, request);

    const start = Date.now();

    const [dbPing] = await Promise.all([
      prisma.$queryRaw<unknown[]>`SELECT 1`,
    ]);

    const dbOk = Array.isArray(dbPing) && dbPing.length === 1;

    const health = {
      status: dbOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: dbOk ? "ok" : "error", latency: Date.now() - start },
        cache: { status: "ok" },
        queue: { status: "ok", pending: getQueueSize() },
      },
      counters: metrics.getCounters(),
    };

    const httpStatus = dbOk ? 200 : 503;
    return NextResponse.json(health, { status: httpStatus });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "admin.health.GET");
  }
}
