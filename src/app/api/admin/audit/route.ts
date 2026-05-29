import { NextResponse } from "next/server";
import { authErrorResponse, requireRole } from "@/lib/rbac";
import { serverError } from "@/lib/api-utils";
import { getAuditLogs } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const user = await requireRole("ADMIN", {}, request);

    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId") ?? undefined;
    const userId = url.searchParams.get("userId") ?? undefined;
    const action = url.searchParams.get("action") ?? undefined;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
    const offset = Number(url.searchParams.get("offset")) || 0;

    const result = await getAuditLogs({
      teamId: teamId ?? user.teamId ?? undefined,
      userId,
      action,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "admin.audit.GET");
  }
}
