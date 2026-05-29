import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { badRequest, serverError, logTiming } from "@/lib/api-utils";
import { DEFAULT_PLANS } from "@/lib/billing/plans";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    const teamId = user.teamId;
    if (!teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const { priceId, planSlug, billing, trialDays } = await request.json();

    let customer = await prisma.customer.findUnique({ where: { teamId } });

    if (!customer) {
      const newCustomer = await stripe.customers.create({
        metadata: { teamId },
        email: user.email ?? undefined,
        name: user.name ?? undefined,
      });
      customer = await prisma.customer.create({
        data: { teamId, stripeCustomerId: newCustomer.id, email: user.email, name: user.name },
      });
    }

    const plan = DEFAULT_PLANS.find((p) => p.slug === planSlug);
    const trialPeriodDays = trialDays ?? plan?.trialDays ?? 0;

    const sessionParams: Record<string, unknown> = {
      customer: customer.stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { teamId, planSlug, billing: billing ?? "MONTHLY" },
      success_url: `${request.headers.get("origin") || "http://localhost:3000"}/billing?checkout=success`,
      cancel_url: `${request.headers.get("origin") || "http://localhost:3000"}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: { teamId, planSlug },
      } as Record<string, unknown>,
    };

    if (trialPeriodDays > 0) {
      (sessionParams.subscription_data as Record<string, unknown>).trial_period_days = trialPeriodDays;
    }

    const session = await stripe.checkout.sessions.create(sessionParams as any);

    await prisma.billingActivity.create({
      data: {
        teamId,
        action: "checkout_initiated",
        description: `Started checkout for ${planSlug ?? "unknown"} plan`,
        status: "pending",
      },
    });

    logTiming("stripe.checkout", start);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "stripe.checkout");
  }
}
