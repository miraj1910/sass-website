import { NextResponse, type NextRequest } from "next/server";
import { sendTemplateEmail } from "@/lib/email";
import { rateLimitByUser } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-utils";
import { requireAuth, authErrorResponse } from "@/lib/rbac";

const allowedTemplates = ["welcome", "otp", "password-reset", "notification"] as const;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth({ requireTeam: false }, request);

    const rl = rateLimitByUser(user.id, { maxRequests: 30, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { template, to, data } = body;

    if (!template || !allowedTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Allowed: ${allowedTemplates.join(", ")}` },
        { status: 400 },
      );
    }

    if (!to || (typeof to !== "string" && !Array.isArray(to))) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid template data" }, { status: 400 });
    }

    const result = await sendTemplateEmail(template, to, data);

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ id: result.id });
  } catch (error) {
    const authResponse = authErrorResponse(error);
    if (authResponse) return authResponse;
    return serverError(error, "email.send");
  }
}
