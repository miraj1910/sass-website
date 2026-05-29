import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { serverError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    await requireRole("ADMIN", {}, request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const search = url.searchParams.get("search") ?? "";

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, metrics: true, invoices: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.team.count({ where }),
    ]);

    return NextResponse.json({
      teams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const authResponse = (await import("@/lib/rbac")).authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "admin.teams");
  }
}
