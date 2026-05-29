import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { teamId: user.teamId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    logTiming("billing.payment-methods", start);
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.payment-methods");
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { paymentMethodId, makeDefault } = await request.json();
    if (!paymentMethodId) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { teamId: user.teamId },
    });

    if (!customer) {
      return NextResponse.json({ error: "No billing customer found" }, { status: 404 });
    }

    const pm = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.stripeCustomerId,
    });

    if (makeDefault) {
      await prisma.paymentMethod.updateMany({
        where: { teamId: user.teamId },
        data: { isDefault: false },
      });
    }

    const saved = await prisma.paymentMethod.create({
      data: {
        teamId: user.teamId,
        customerId: customer.id,
        stripePaymentMethodId: paymentMethodId,
        type: pm.type ?? "card",
        brand: pm.card?.brand ?? null,
        last4: pm.card?.last4 ?? null,
        expMonth: pm.card?.exp_month ?? null,
        expYear: pm.card?.exp_year ?? null,
        fingerprint: pm.card?.fingerprint ?? null,
        isDefault: makeDefault ?? false,
        billingDetails: pm.billing_details ? JSON.parse(JSON.stringify(pm.billing_details)) as any : null,
      },
    });

    if (makeDefault) {
      await stripe.customers.update(customer.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    logTiming("billing.payment-methods.create", start);
    return NextResponse.json({ paymentMethod: saved });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.payment-methods");
  }
}
