import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    const teamId = user.teamId;
    if (!teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const customer = await prisma.customer.findUnique({
      where: { teamId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            plan: {
              include: { features: { orderBy: { sortOrder: "asc" } }, usageLimits: true },
            },
          },
        },
        invoices: { orderBy: { createdAt: "desc" }, take: 5 },
        paymentMethods: { orderBy: { isDefault: "desc" } },
      },
    });

    if (!customer) {
      return NextResponse.json({
        hasCustomer: false,
        subscription: null,
        invoices: [],
        paymentMethods: [],
      });
    }

    const subscription = customer.subscriptions[0] ?? null;

    const usageRecords = subscription
      ? await prisma.usageRecord.findMany({
          where: {
            teamId,
            recordedAt: { gte: subscription.currentPeriodStart ?? undefined },
          },
        })
      : [];

    const usageByMetric: Record<string, number> = {};
    for (const r of usageRecords) {
      usageByMetric[r.metric] = (usageByMetric[r.metric] ?? 0) + r.amount;
    }

    const usageLimits = subscription?.plan?.usageLimits ?? [];
    const now = new Date();
    const periodStart = subscription?.currentPeriodStart ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodDays = Math.max(1, Math.ceil((now.getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)));

    const usage = usageLimits.map((limit) => {
      const used = usageByMetric[limit.metric] ?? 0;
      return {
        metric: limit.metric,
        used,
        limit: limit.limit,
        percentage: limit.limit > 0 ? Math.min(100, (used / limit.limit) * 100) : 0,
        overagePrice: limit.overagePrice,
        isHardLimit: limit.isHardLimit,
        projectedMonthly: periodDays > 0 ? Math.round((used / periodDays) * 30) : used,
      };
    });

    logTiming("stripe.subscription", start);
    return NextResponse.json({
      hasCustomer: true,
      stripeCustomerId: customer.stripeCustomerId,
      subscription: subscription
        ? {
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
            endedAt: subscription.endedAt?.toISOString() ?? null,
            pauseCollection: subscription.pauseCollection,
            defaultPaymentMethod: subscription.defaultPaymentMethod,
          }
        : null,
      invoices: customer.invoices,
      paymentMethods: customer.paymentMethods,
      usage,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "stripe.subscription");
  }
}
