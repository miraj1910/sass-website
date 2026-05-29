import { NextResponse, type NextRequest } from "next/server";
import { inspectAuthRequest } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const diagnostics = await inspectAuthRequest(request);
  if (process.env.AUTH_DEBUG !== "true") {
    return NextResponse.json({
      ok: diagnostics.getToken.success || diagnostics.getServerSession.success,
    });
  }

  return NextResponse.json({
    ok: diagnostics.getToken.success || diagnostics.getServerSession.success,
    diagnostics,
  });
}
