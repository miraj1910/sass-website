import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = { teamId: user.teamId };
    if (status) where.status = status;
    if (search) where.number = { contains: search, mode: "insensitive" };

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    logTiming("billing.invoices", start);
    return NextResponse.json({ invoices });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.invoices");
  }
}
