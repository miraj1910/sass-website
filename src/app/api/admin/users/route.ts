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
    const role = url.searchParams.get("role") ?? "";

    const where = {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
      ...(role ? { role: role as "ADMIN" | "MEMBER" } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          team: { select: { name: true, id: true } },
          _count: { select: { accounts: true, apiKeys: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const authResponse = (await import("@/lib/rbac")).authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "admin.users");
  }
}
