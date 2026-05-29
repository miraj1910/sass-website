import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    const teamId = user.teamId;

    if (!teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 120, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const range = searchParams.get("range");

    const where: Prisma.MetricWhereInput = {
      teamId,
    };

    if (key) {
      where.key = key;
    }

    if (range) {
      const days = parseInt(range);
      if (!isNaN(days) && days > 0) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        where.recordedAt = {
          gte: date,
        };
      }
    }

    const metrics = await prisma.metric.findMany({
      where,
      orderBy: {
        recordedAt: "desc",
      },
    });

    logTiming("metrics.GET", start);
    return NextResponse.json(metrics);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "metrics.GET");
  }
}
