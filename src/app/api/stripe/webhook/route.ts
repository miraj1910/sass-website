import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimitByIp } from "@/lib/rate-limit";
import { eventBus, EVENTS } from "@/lib/event-bus";
import { logger } from "@/lib/observability/logger";
import { DEFAULT_PLANS } from "@/lib/billing/plans";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleCheckoutCompleted(session: Record<string, unknown>) {
  if (session.mode !== "subscription" || !session.subscription) return;

  const teamId = (session.metadata as Record<string, string> | undefined)?.teamId;
  if (!teamId) {
    logger.error("checkout.session.completed missing teamId metadata");
    return;
  }

  let customer = await prisma.customer.findUnique({ where: { teamId } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { teamId, stripeCustomerId: session.customer as string },
    });
  } else if (customer.stripeCustomerId !== session.customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { stripeCustomerId: session.customer as string },
    });
  }

  const rawSub = await stripe.subscriptions.retrieve(session.subscription as string, {
    expand: ["items.data.price.product", "latest_invoice"],
  }) as any;

  const planSlug = (session.metadata as Record<string, string> | undefined)?.planSlug;
  const plan = planSlug ? DEFAULT_PLANS.find((p) => p.slug === planSlug) : undefined;

  const subscriptionData: Record<string, unknown> = {
    customerId: customer.id,
    stripeSubscriptionId: session.subscription as string,
    status: rawSub.status.toUpperCase(),
    currentPeriodStart: rawSub.current_period_start ? new Date(rawSub.current_period_start * 1000) : null,
    currentPeriodEnd: rawSub.current_period_end ? new Date(rawSub.current_period_end * 1000) : null,
    trialStart: rawSub.trial_start ? new Date(rawSub.trial_start * 1000) : null,
    trialEnd: rawSub.trial_end ? new Date(rawSub.trial_end * 1000) : null,
    billing: (session.metadata as Record<string, string> | undefined)?.billing === "YEARLY" ? "YEARLY" : "MONTHLY",
    quantity: rawSub.quantity ?? 1,
    stripeLatestInvoice: rawSub.latest_invoice?.id ?? null,
  };

  if (plan) {
    subscriptionData.planId = plan.id;
  }

  const createdSubscription = await prisma.subscription.upsert({
    where: { stripeSubscriptionId: session.subscription as string },
    update: subscriptionData as any,
    create: subscriptionData as any,
  });

  for (const item of rawSub.items.data) {
    await prisma.subscriptionItem.upsert({
      where: { id: `${session.subscription}_${item.id}` },
      update: {
        stripePriceId: item.price.id,
        stripeProductId: item.price.product as string,
        quantity: item.quantity ?? 1,
      },
      create: {
        id: `${session.subscription}_${item.id}`,
        subscriptionId: createdSubscription.id,
        stripePriceId: item.price.id,
        stripeProductId: item.price.product as string,
        quantity: item.quantity ?? 1,
        planId: plan?.id ?? null,
      },
    });
  }

  const latestInvoice = rawSub.latest_invoice as any;
  if (latestInvoice) {
    await prisma.invoice.upsert({
      where: { stripeInvoiceId: latestInvoice.id },
      update: {
        amountDue: latestInvoice.amount_due,
        amountPaid: latestInvoice.amount_paid,
        amountRemaining: latestInvoice.amount_remaining,
        status: latestInvoice.status.toUpperCase(),
        pdfUrl: latestInvoice.invoice_pdf ?? null,
        hostedUrl: latestInvoice.hosted_invoice_url ?? null,
        periodStart: latestInvoice.period_start ? new Date(latestInvoice.period_start * 1000) : null,
        periodEnd: latestInvoice.period_end ? new Date(latestInvoice.period_end * 1000) : null,
        total: latestInvoice.total,
        subtotal: latestInvoice.subtotal,
        tax: latestInvoice.tax ?? 0,
        paidAt: latestInvoice.status === "paid" ? new Date() : null,
      },
      create: {
        teamId,
        customerId: customer.id,
        stripeInvoiceId: latestInvoice.id,
        number: latestInvoice.number,
        amountDue: latestInvoice.amount_due,
        amountPaid: latestInvoice.amount_paid,
        amountRemaining: latestInvoice.amount_remaining,
        currency: latestInvoice.currency,
        status: latestInvoice.status.toUpperCase(),
        pdfUrl: latestInvoice.invoice_pdf ?? null,
        hostedUrl: latestInvoice.hosted_invoice_url ?? null,
        periodStart: latestInvoice.period_start ? new Date(latestInvoice.period_start * 1000) : null,
        periodEnd: latestInvoice.period_end ? new Date(latestInvoice.period_end * 1000) : null,
        total: latestInvoice.total,
        subtotal: latestInvoice.subtotal,
        tax: latestInvoice.tax ?? 0,
      },
    });
  }

  await prisma.billingActivity.create({
    data: {
      teamId,
      action: "subscription_created",
      description: `Subscribed to ${plan?.name ?? "a"} plan`,
      status: rawSub.status,
    },
  });

  logger.info("Stripe checkout completed", {
    metadata: { teamId, subscription: session.subscription as string },
  });

  eventBus.emit(EVENTS.BILLING_CHECKOUT_COMPLETED, {
    teamId,
    subscriptionId: session.subscription,
    stripeCustomerId: session.customer,
    status: rawSub.status,
  });
}

async function handleSubscriptionUpdated(subEvent: Record<string, unknown>) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subEvent.id as string },
  });

  if (!existing) return;

  const status = ((subEvent.status as string) ?? "ACTIVE").toUpperCase();

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      status: status as any,
      currentPeriodStart: (subEvent.current_period_start as number)
        ? new Date((subEvent.current_period_start as number) * 1000) : undefined,
      currentPeriodEnd: (subEvent.current_period_end as number)
        ? new Date((subEvent.current_period_end as number) * 1000) : undefined,
      canceledAt: (subEvent.canceled_at as number)
        ? new Date((subEvent.canceled_at as number) * 1000) : null,
      endedAt: (subEvent.ended_at as number)
        ? new Date((subEvent.ended_at as number) * 1000) : null,
      trialStart: (subEvent.trial_start as number)
        ? new Date((subEvent.trial_start as number) * 1000) : undefined,
      trialEnd: (subEvent.trial_end as number)
        ? new Date((subEvent.trial_end as number) * 1000) : undefined,
    },
  });

  const customer = await prisma.customer.findUnique({
    where: { id: existing.customerId },
  });

  if (customer) {
    await prisma.billingActivity.create({
      data: {
        teamId: customer.teamId,
        action: "subscription_updated",
        description: `Subscription status changed to ${subEvent.status as string}`,
        status: subEvent.status as string,
      },
    });
  }

  logger.info("Stripe subscription updated", {
    metadata: { subscriptionId: subEvent.id as string, status: subEvent.status as string },
  });

  eventBus.emit(EVENTS.BILLING_SUBSCRIPTION_UPDATED, {
    subscriptionId: subEvent.id,
    status: subEvent.status,
  });
}

async function handleSubscriptionDeleted(subEvent: Record<string, unknown>) {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subEvent.id as string },
  });

  if (!existing) return;

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      status: "CANCELED",
      canceledAt: (subEvent.canceled_at as number)
        ? new Date((subEvent.canceled_at as number) * 1000) : new Date(),
      endedAt: (subEvent.ended_at as number)
        ? new Date((subEvent.ended_at as number) * 1000) : new Date(),
    },
  });

  const customer = await prisma.customer.findUnique({
    where: { id: existing.customerId },
  });

  if (customer) {
    await prisma.billingActivity.create({
      data: {
        teamId: customer.teamId,
        action: "subscription_canceled",
        description: "Subscription was canceled",
        status: "canceled",
      },
    });
  }

  logger.info("Stripe subscription deleted", {
    metadata: { subscriptionId: subEvent.id as string },
  });

  eventBus.emit(EVENTS.BILLING_SUBSCRIPTION_DELETED, {
    subscriptionId: subEvent.id,
  });
}

async function handleInvoicePaid(invoice: Record<string, unknown>) {
  const teamId = (invoice.metadata as Record<string, string> | undefined)?.teamId
    ?? (invoice.subscription as string
      ? await getTeamIdFromSubscription(invoice.subscription as string)
      : null);

  if (!teamId) {
    logger.error("invoice.paid unable to determine teamId");
    return;
  }

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id as string },
    update: {
      status: "PAID",
      amountPaid: invoice.amount_paid as number ?? 0,
      amountRemaining: invoice.amount_remaining as number ?? 0,
      paidAt: new Date(),
      pdfUrl: (invoice as any).invoice_pdf ?? null,
      hostedUrl: (invoice as any).hosted_invoice_url ?? null,
    },
    create: {
      teamId,
      stripeInvoiceId: invoice.id as string,
      number: invoice.number as string | null ?? null,
      amountDue: invoice.amount_due as number ?? 0,
      amountPaid: invoice.amount_paid as number ?? 0,
      amountRemaining: invoice.amount_remaining as number ?? 0,
      currency: invoice.currency as string ?? "usd",
      status: "PAID",
      pdfUrl: (invoice as any).invoice_pdf ?? null,
      hostedUrl: (invoice as any).hosted_invoice_url ?? null,
      periodStart: invoice.period_start ? new Date((invoice.period_start as number) * 1000) : null,
      periodEnd: invoice.period_end ? new Date((invoice.period_end as number) * 1000) : null,
      total: invoice.total as number ?? 0,
      subtotal: invoice.subtotal as number ?? 0,
      tax: invoice.tax as number ?? 0,
      paidAt: new Date(),
    },
  });

  await prisma.billingActivity.create({
    data: {
      teamId,
      action: "payment_succeeded",
      description: `Payment of ${formatCentsStatic(invoice.amount_paid as number, invoice.currency as string ?? "usd")} succeeded`,
      amount: invoice.amount_paid as number ?? 0,
      currency: invoice.currency as string ?? "usd",
      status: "paid",
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Record<string, unknown>) {
  const teamId = (invoice.metadata as Record<string, string> | undefined)?.teamId
    ?? (invoice.subscription as string
      ? await getTeamIdFromSubscription(invoice.subscription as string)
      : null);

  if (!teamId) return;

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id as string },
    update: {
      status: invoice.status === "uncollectible" ? "UNCOLLECTIBLE" : "OPEN",
      amountRemaining: invoice.amount_remaining as number ?? 0,
    },
    create: {
      teamId,
      stripeInvoiceId: invoice.id as string,
      number: invoice.number as string | null ?? null,
      amountDue: invoice.amount_due as number ?? 0,
      amountPaid: invoice.amount_paid as number ?? 0,
      amountRemaining: invoice.amount_remaining as number ?? 0,
      currency: invoice.currency as string ?? "usd",
      status: invoice.status === "uncollectible" ? "UNCOLLECTIBLE" : "OPEN",
      total: invoice.total as number ?? 0,
      subtotal: invoice.subtotal as number ?? 0,
      tax: invoice.tax as number ?? 0,
    },
  });

  await prisma.billingActivity.create({
    data: {
      teamId,
      action: "payment_failed",
      description: `Payment of ${formatCentsStatic(invoice.amount_due as number, invoice.currency as string ?? "usd")} failed`,
      amount: invoice.amount_due as number ?? 0,
      currency: invoice.currency as string ?? "usd",
      status: "failed",
    },
  });

  if (teamId) {
    const subscriptions = await prisma.subscription.findMany({
      where: { customer: { teamId } },
    });
    for (const sub of subscriptions) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "PAST_DUE" },
      });
    }
  }
}

async function getTeamIdFromSubscription(subscriptionId: string): Promise<string | null> {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { customer: true },
  });
  return sub?.customer.teamId ?? null;
}

function formatCentsStatic(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET is not defined");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const rl = rateLimitByIp(request, { maxRequests: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error("Stripe webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const data = event.data.object as unknown as Record<string, unknown>;

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(data);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(data);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(data);
        break;
      case "invoice.paid":
        await handleInvoicePaid(data);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(data);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
