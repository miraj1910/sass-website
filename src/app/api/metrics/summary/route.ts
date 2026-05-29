import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    const teamId = user.teamId;

    if (!teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 60, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalMetrics,
      memberCount,
      metricsByDate,
      recentMetrics,
    ] = await Promise.all([
      prisma.metric.count({ where: { teamId } }),
      prisma.user.count({ where: { teamId } }),
      prisma.metric.groupBy({
        by: ["recordedAt", "key"],
        where: { teamId, recordedAt: { gte: thirtyDaysAgo } },
        _sum: { value: true },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.metric.findMany({
        where: { teamId },
        orderBy: { recordedAt: "desc" },
        take: 10,
      }),
    ]);

    const dateMap = new Map<string, Record<string, number>>();
    for (const m of metricsByDate) {
      const dateStr = m.recordedAt.toISOString().split("T")[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {});
      }
      const entry = dateMap.get(dateStr)!;
      entry[m.key] = m._sum.value ?? 0;
    }

    const metricsByDateFormatted = Array.from(dateMap.entries()).map(
      ([date, values]) => ({ date, ...values }),
    );

    logTiming("metrics.summary", start);
    return NextResponse.json({
      totalMetrics,
      memberCount,
      metricsByDate: metricsByDateFormatted,
      recentMetrics,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "metrics.summary");
  }
}
