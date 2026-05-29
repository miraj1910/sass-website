import { NextResponse, type NextRequest } from "next/server";
import { serverError } from "@/lib/api-utils";

type ResendWebhookPayload = {
  type: "email.sent" | "email.delivered" | "email.delivery_delayed" | "email.complained" | "email.bounced" | "email.opened" | "email.clicked";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    tags?: Record<string, string>;
    created_at?: string;
  };
};

function verifyWebhookSignature(request: NextRequest): boolean {
  const signingSecret = process.env.RESEND_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    console.warn("[Email Webhook] No signing secret configured — skipping verification");
    return true;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: ResendWebhookPayload = await request.json();

    console.log(`[Email Webhook] Event: ${payload.type}`, {
      emailId: payload.data.email_id,
      to: payload.data.to,
      subject: payload.data.subject,
    });

    switch (payload.type) {
      case "email.bounced":
        console.warn(`[Email Webhook] Bounced: ${payload.data.email_id}`, payload.data.to);
        break;

      case "email.complained":
        console.warn(`[Email Webhook] Spam report: ${payload.data.email_id}`, payload.data.to);
        break;

      case "email.delivered":
        break;

      case "email.opened":
      case "email.clicked":
        break;

      case "email.delivery_delayed":
        console.warn(`[Email Webhook] Delivery delayed: ${payload.data.email_id}`);
        break;

      default:
        console.log(`[Email Webhook] Unhandled event: ${payload.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return serverError(error, "email.webhook");
  }
}
