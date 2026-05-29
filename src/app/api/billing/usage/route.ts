import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const url = new URL(request.url);
    const metric = url.searchParams.get("metric");
    const range = url.searchParams.get("range") ?? "30d";

    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "90d": startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case "1y": startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    }

    const where: Record<string, unknown> = {
      teamId: user.teamId,
      recordedAt: { gte: startDate },
    };
    if (metric) where.metric = metric;

    const usageRecords = await prisma.usageRecord.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: 1000,
    });

    const subscription = await prisma.subscription.findFirst({
      where: { customer: { teamId: user.teamId } },
      orderBy: { createdAt: "desc" },
      include: { plan: { include: { usageLimits: true } } },
    });

    const usageLimits = subscription?.plan?.usageLimits ?? [];
    const currentPeriodStart = subscription?.currentPeriodStart ?? startDate;

    const usageByMetric: Record<string, { total: number; records: typeof usageRecords }> = {};
    for (const record of usageRecords) {
      if (!usageByMetric[record.metric]) {
        usageByMetric[record.metric] = { total: 0, records: [] };
      }
      usageByMetric[record.metric].total += record.amount;
      usageByMetric[record.metric].records.push(record);
    }

    const periodDays = Math.max(1, Math.ceil((now.getTime() - new Date(currentPeriodStart).getTime()) / (1000 * 60 * 60 * 24)));

    const summary = usageLimits.map((limit) => {
      const used = usageByMetric[limit.metric]?.total ?? 0;
      const percentage = limit.limit > 0 ? Math.min(100, (used / limit.limit) * 100) : 0;
      const projectedMonthly = periodDays > 0 ? (used / periodDays) * 30 : used;

      return {
        metric: limit.metric,
        used,
        limit: limit.limit,
        percentage: Math.round(percentage * 100) / 100,
        overagePrice: limit.overagePrice,
        isHardLimit: limit.isHardLimit,
        projectedMonthly: Math.round(projectedMonthly),
        periodDays,
      };
    });

    logTiming("billing.usage", start);
    return NextResponse.json({ usage: summary, records: usageRecords });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.usage");
  }
}
