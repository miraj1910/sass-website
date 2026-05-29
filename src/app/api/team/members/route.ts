import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse, requireRole, requireTeamOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError, badRequest, logTiming } from "@/lib/api-utils";
import { teamInviteSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit";
import { eventBus, EVENTS } from "@/lib/event-bus";

export async function GET(request: NextRequest) {
  const start = Date.now();
  try {
    const user = await requireRole(["ADMIN", "MEMBER"], {}, request);

    const members = await prisma.user.findMany({
      where: {
        teamId: user.teamId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: "asc" },
        { name: "asc" },
      ],
    });

    logTiming("team.members.GET", start);
    return NextResponse.json({
      members,
      canManageMembers: user.role === "ADMIN" && user.ownedTeamId === user.teamId,
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "team.members.GET");
  }
}

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireRole("ADMIN", {}, request);
    requireTeamOwner(user);

    const rl = rateLimitByUser(user.id, { maxRequests: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } },
      );
    }

    const json = await request.json();
    const parsed = teamInviteSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest(parsed.error);
    }

    const email = parsed.data.email;

    const invitedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        teamId: true,
      },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User must sign up before they can be added to a team" },
        { status: 404 },
      );
    }

    if (invitedUser.id === user.id) {
      return NextResponse.json(
        { error: "Team owner is already a member" },
        { status: 400 },
      );
    }

    if (invitedUser.teamId && invitedUser.teamId !== user.teamId) {
      return NextResponse.json(
        { error: "User already belongs to another team" },
        { status: 409 },
      );
    }

    if (invitedUser.teamId === user.teamId) {
      return NextResponse.json({
        member: {
          id: invitedUser.id,
          name: invitedUser.name,
          email: invitedUser.email,
          image: invitedUser.image,
          role: invitedUser.role,
          createdAt: invitedUser.createdAt,
        },
      });
    }

    const member = await prisma.user.update({
      where: { id: invitedUser.id },
      data: {
        role: "MEMBER",
        teamId: user.teamId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    auditLog({
      action: "team.member.added",
      resource: "team_member",
      resourceId: member.id,
      teamId: user.teamId!,
      userId: user.id,
      metadata: { invitedEmail: email },
    });

    eventBus.emit(EVENTS.TEAM_MEMBER_ADDED, {
      teamId: user.teamId,
      userId: member.id,
      invitedBy: user.id,
    });

    logTiming("team.members.POST", start);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "team.members.POST");
  }
}
