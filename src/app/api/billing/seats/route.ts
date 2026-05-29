import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireAuth, requireTeamOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";
import { MAX_SEATS_BY_PLAN } from "@/lib/billing/constants";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const seats = await prisma.seat.findMany({
      where: { teamId: user.teamId, status: { not: "REMOVED" } },
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });

    logTiming("billing.seats", start);
    return NextResponse.json({ seats });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.seats");
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    requireTeamOwner(user);

    const rl = rateLimitByUser(user.id, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { email, role } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { customer: { teamId: user.teamId }, status: "ACTIVE" },
      include: { plan: true },
    });

    const planSlug = subscription?.plan?.slug ?? "free";
    const maxSeats = MAX_SEATS_BY_PLAN[planSlug] ?? Infinity;
    const currentActiveSeats = await prisma.seat.count({
      where: { teamId: user.teamId, status: "ACTIVE" },
    });

    if (currentActiveSeats >= maxSeats) {
      return NextResponse.json(
        { error: `Seat limit reached for your plan (max ${maxSeats})` },
        { status: 403 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const seatUser = existingUser ?? undefined;

    const seat = await prisma.seat.create({
      data: {
        teamId: user.teamId,
        userId: seatUser?.id,
        email,
        role: role ?? "MEMBER",
        status: seatUser ? "ACTIVE" : "INVITED",
        acceptedAt: seatUser ? new Date() : null,
      },
      include: { user: { select: { name: true, email: true, image: true } } },
    });

    logTiming("billing.seats.create", start);
    return NextResponse.json({ seat });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.seats");
  }
}
