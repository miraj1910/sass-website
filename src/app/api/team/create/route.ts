import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { teamCreateSchema } from "@/lib/validations";
import { badRequest, serverError, logTiming } from "@/lib/api-utils";
import { auditLog } from "@/lib/audit";
import { eventBus, EVENTS } from "@/lib/event-bus";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const user = await requireAuth({ requireTeam: false }, request);

    if (user.teamId) {
      return NextResponse.json(
        { error: "User already belongs to a team" },
        { status: 409 }
      );
    }

    const json = await request.json();
    const parsed = teamCreateSchema.safeParse(json);
    if (!parsed.success) {
      return badRequest(parsed.error);
    }

    const name = parsed.data.name;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingTeam = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team name already exists" },
        { status: 400 }
      );
    }

    const [team] = await prisma.$transaction(async (tx) => {
      const createdTeam = await tx.team.create({
        data: {
          name,
          slug,
          ownerId: user.id,
        },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { role: "ADMIN", teamId: createdTeam.id },
      });
      return [createdTeam];
    });

    auditLog({
      action: "team.created",
      resource: "team",
      resourceId: team.id,
      teamId: team.id,
      userId: user.id,
    });

    eventBus.emit(EVENTS.TEAM_CREATED, {
      teamId: team.id,
      userId: user.id,
      name: team.name,
    });

    logTiming("team.create", start);
    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
      }
    }, { status: 201 });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "team.create");
  }
}
