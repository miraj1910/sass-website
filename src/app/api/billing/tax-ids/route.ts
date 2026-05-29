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

    const taxIds = await prisma.taxId.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "desc" },
    });

    logTiming("billing.tax-ids", start);
    return NextResponse.json({ taxIds });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.tax-ids");
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

    const { type, value } = await request.json();
    if (!type || !value) {
      return NextResponse.json({ error: "Type and value required" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { teamId: user.teamId },
    });

    if (!customer) {
      return NextResponse.json({ error: "No billing customer found" }, { status: 404 });
    }

    const stripeTaxId = await stripe.customers.createTaxId(customer.stripeCustomerId, {
      type,
      value,
    });

    const saved = await prisma.taxId.create({
      data: {
        teamId: user.teamId,
        stripeTaxIdId: stripeTaxId.id,
        type: stripeTaxId.type,
        value: stripeTaxId.value,
        country: stripeTaxId.country ?? null,
        isVerified: true,
      },
    });

    logTiming("billing.tax-ids.create", start);
    return NextResponse.json({ taxId: saved });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.tax-ids");
  }
}
