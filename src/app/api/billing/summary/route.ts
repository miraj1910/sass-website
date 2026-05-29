import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
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

    const customer = await prisma.customer.findUnique({
      where: { teamId: user.teamId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: { include: { usageLimits: true, features: true } } },
        },
      },
    });

    const invoices = await prisma.invoice.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { teamId: user.teamId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    const taxIds = await prisma.taxId.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "desc" },
    });

    const seats = await prisma.seat.findMany({
      where: { teamId: user.teamId, status: { not: "REMOVED" } },
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });

    const activity = await prisma.billingActivity.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const now = new Date();
    const currentPeriodStart = customer?.subscriptions[0]?.currentPeriodStart ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodDays = Math.max(1, Math.ceil((now.getTime() - new Date(currentPeriodStart).getTime()) / (1000 * 60 * 60 * 24)));

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        teamId: user.teamId,
        recordedAt: { gte: currentPeriodStart },
      },
    });

    const usageByMetric: Record<string, number> = {};
    for (const record of usageRecords) {
      usageByMetric[record.metric] = (usageByMetric[record.metric] ?? 0) + record.amount;
    }

    const usageLimits = customer?.subscriptions[0]?.plan?.usageLimits ?? [];
    const usage = usageLimits.map((limit) => {
      const used = usageByMetric[limit.metric] ?? 0;
      const percentage = limit.limit > 0 ? Math.min(100, (used / limit.limit) * 100) : 0;
      return {
        metric: limit.metric,
        used,
        limit: limit.limit,
        percentage: Math.round(percentage * 100) / 100,
        overagePrice: limit.overagePrice,
        isHardLimit: limit.isHardLimit,
        projectedMonthly: periodDays > 0 ? Math.round((used / periodDays) * 30) : used,
      };
    });

    const subscription = customer?.subscriptions[0] ?? null;

    logTiming("billing.summary", start);
    return NextResponse.json({
      hasCustomer: !!customer,
      stripeCustomerId: customer?.stripeCustomerId ?? null,
      subscription: subscription ? {
        id: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        planId: subscription.planId,
        plan: subscription.plan,
        status: subscription.status,
        billing: subscription.billing,
        quantity: subscription.quantity,
        trialStart: subscription.trialStart?.toISOString() ?? null,
        trialEnd: subscription.trialEnd?.toISOString() ?? null,
        currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        canceledAt: subscription.canceledAt?.toISOString() ?? null,
        pauseCollection: subscription.pauseCollection,
      } : null,
      invoices,
      paymentMethods,
      taxIds,
      seats,
      usage,
      activity,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.summary");
  }
}
