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

    const activity = await prisma.billingActivity.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    logTiming("billing.activity", start);
    return NextResponse.json({ activity });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.activity");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const { action, description, amount, currency, status: activityStatus } = await request.json();

    const activity = await prisma.billingActivity.create({
      data: {
        teamId: user.teamId,
        action,
        description,
        amount,
        currency,
        status: activityStatus,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.activity.create");
  }
}
