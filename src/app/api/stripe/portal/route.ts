import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

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

    const customer = await prisma.customer.findUnique({
      where: { teamId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "No billing customer found" },
        { status: 404 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${request.headers.get("origin") || "http://localhost:3000"}/billing`,
    });

    logTiming("stripe.portal", start);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "stripe.portal");
  }
}
