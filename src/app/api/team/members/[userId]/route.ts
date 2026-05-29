import { NextResponse } from "next/server";
import { authErrorResponse, requireRole, requireTeamOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, logTiming } from "@/lib/api-utils";
import { auditLog } from "@/lib/audit";
import { eventBus, EVENTS } from "@/lib/event-bus";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireRole("ADMIN", {}, _request);
    requireTeamOwner(user);

    const rl = rateLimitByUser(user.id, { maxRequests: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const { userId } = await context.params;

    if (userId === user.id) {
      return NextResponse.json(
        { error: "Team owner cannot remove themselves" },
        { status: 400 },
      );
    }

    const member = await prisma.user.findFirst({
      where: {
        id: userId,
        teamId: user.teamId,
      },
      select: {
        id: true,
        role: true,
        ownedTeam: {
          select: { id: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 },
      );
    }

    if (member.ownedTeam?.id === user.teamId) {
      return NextResponse.json(
        { error: "Team owner cannot be removed" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: member.id },
      data: {
        role: "MEMBER",
        teamId: null,
      },
    });

    auditLog({
      action: "team.member.removed",
      resource: "team_member",
      resourceId: member.id,
      teamId: user.teamId!,
      userId: user.id,
    });

    eventBus.emit(EVENTS.TEAM_MEMBER_REMOVED, {
      teamId: user.teamId,
      userId: member.id,
      removedBy: user.id,
    });

    logTiming("team.members.DELETE", start);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "team.members.DELETE");
  }
}
