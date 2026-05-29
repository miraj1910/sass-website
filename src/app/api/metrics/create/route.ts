import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { metricCreateSchema } from "@/lib/validations";
import { rateLimitByUser } from "@/lib/rate-limit";
import { badRequest, serverError, logTiming } from "@/lib/api-utils";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    const teamId = user.teamId;

    if (!teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const rl = rateLimitByUser(user.id, { maxRequests: 60, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const json = await request.json();
    const parsed = metricCreateSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest(parsed.error);
    }

    const metric = await prisma.metric.create({
      data: {
        teamId,
        key: parsed.data.key,
        value: parsed.data.value,
        recordedAt: new Date(),
      },
    });

    logTiming("metrics.create", start);
    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "metrics.create");
  }
}
