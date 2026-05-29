import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET() {
  const start = Date.now();
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        usageLimits: true,
        addOns: { where: { isActive: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    logTiming("billing.plans", start);
    return NextResponse.json({ plans });
  } catch (error) {
    return serverError(error, "billing.plans");
  }
}
