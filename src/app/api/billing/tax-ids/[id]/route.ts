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

    const taxId = await prisma.taxId.findFirst({
      where: { id, teamId: user.teamId },
    });

    if (!taxId) {
      return NextResponse.json({ error: "Tax ID not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: { teamId: user.teamId },
    });

    if (customer) {
      await stripe.customers.deleteTaxId(customer.stripeCustomerId, taxId.stripeTaxIdId);
    }

    await prisma.taxId.delete({ where: { id } });

    logTiming("billing.tax-ids.delete", start);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.tax-ids.delete");
  }
}
