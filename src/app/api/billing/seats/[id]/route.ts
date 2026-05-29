import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth, requireTeamOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { serverError, logTiming } from "@/lib/api-utils";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, _request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    requireTeamOwner(user);

    const { id } = await params;

    const seat = await prisma.seat.findFirst({
      where: { id, teamId: user.teamId },
    });

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }

    await prisma.seat.update({
      where: { id },
      data: { status: "REMOVED" },
    });

    logTiming("billing.seats.delete", start);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.seats.delete");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    requireTeamOwner(user);

    const { id } = await params;
    const { role } = await request.json();

    const seat = await prisma.seat.findFirst({
      where: { id, teamId: user.teamId },
    });

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }

    const updated = await prisma.seat.update({
      where: { id },
      data: { role },
      include: { user: { select: { name: true, email: true, image: true } } },
    });

    logTiming("billing.seats.update", start);
    return NextResponse.json({ seat: updated });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.seats.update");
  }
}
