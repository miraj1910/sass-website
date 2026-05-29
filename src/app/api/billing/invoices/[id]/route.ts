import { NextResponse } from "next/server";
import { authErrorResponse, requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { serverError, logTiming } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = Date.now();
  try {
    const user = await requireAuth({}, _request);
    if (!user.teamId) {
      return NextResponse.json({ error: "Team required" }, { status: 428 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, teamId: user.teamId },
      include: { taxRecords: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    logTiming("billing.invoice.single", start);
    return NextResponse.json({ invoice });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "billing.invoice.single");
  }
}
