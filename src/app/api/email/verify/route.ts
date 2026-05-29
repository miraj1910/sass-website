import { NextResponse, type NextRequest } from "next/server";
import { sendTemplateEmail } from "@/lib/email";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-utils";
import { requireAuth, authErrorResponse } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth({ requireTeam: false }, request);

    const rl = rateLimitByUser(user.id, { maxRequests: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { email, type } = body;

    const targetEmail = email ?? user.email;
    if (!targetEmail) {
      return NextResponse.json({ error: "No email address available" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendTemplateEmail("otp", targetEmail, {
      otp,
      expiresInMinutes: 10,
      name: user.name ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "email.verify");
  }
}
