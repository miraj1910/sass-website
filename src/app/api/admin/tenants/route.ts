import { NextResponse } from "next/server";
import { authErrorResponse, requireRole } from "@/lib/rbac";
import { serverError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", {}, request);

    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId");

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          _count: { select: { members: true, metrics: true } },
          customer: {
            select: {
              stripeCustomerId: true,
              subscriptions: {
                select: { status: true, currentPeriodEnd: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json({ team });
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { members: true, metrics: true } },
        customer: {
          select: {
            subscriptions: {
              select: { status: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ teams, total: teams.length });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "admin.tenants.GET");
  }
}
