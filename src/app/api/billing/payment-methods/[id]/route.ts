import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { serverError, logTiming } from "@/lib/api-utils";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, _request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const { id } = await params;

    const pm = await prisma.paymentMethod.findFirst({
      where: { id, teamId: user.teamId },
    });

    if (!pm) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    await stripe.paymentMethods.detach(pm.stripePaymentMethodId);
    await prisma.paymentMethod.delete({ where: { id } });

    logTiming("billing.payment-methods.delete", start);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.payment-methods.delete");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const { id } = await params;
    const { isDefault } = await request.json();

    const pm = await prisma.paymentMethod.findFirst({
      where: { id, teamId: user.teamId },
    });

    if (!pm) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: { teamId: user.teamId },
    });

    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { teamId: user.teamId },
        data: { isDefault: false },
      });

      if (customer) {
        await stripe.customers.update(customer.stripeCustomerId, {
          invoice_settings: { default_payment_method: pm.stripePaymentMethodId },
        });
      }
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault },
    });

    logTiming("billing.payment-methods.update", start);
    return NextResponse.json({ paymentMethod: updated });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.payment-methods.update");
  }
}
