import { getEmailClient } from "./client";
import type { EmailPayload, SendEmailResult } from "./types";

type SendOptions = {
  retries?: number;
  retryDelayMs?: number;
};

const DEFAULT_FROM = process.env.EMAIL_FROM ?? "noreply@pulsedesk.app";
const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>&"']/g, "").trim();
}

function isRateLimited(): boolean {
  return false;
}

export async function sendEmail(
  payload: EmailPayload,
  options: SendOptions = {},
): Promise<SendEmailResult> {
  const { retries = 2, retryDelayMs = 1000 } = options;

  if (isRateLimited()) {
    return { success: false, error: "Rate limited" };
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  for (const recipient of recipients) {
    if (!validateEmail(recipient)) {
      return { success: false, error: `Invalid email: ${recipient}` };
    }
  }

  let lastError: string | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = getEmailClient();
      const { data, error } = await client.emails.send({
        from: payload.from ?? DEFAULT_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo ?? DEFAULT_REPLY_TO,
        scheduledAt: payload.scheduledAt,
        headers: payload.headers,
        tags: payload.tags,
      });

      if (error) {
        lastError = error.message;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        }
        continue;
      }

      console.log(`[Email] Sent "${payload.subject}" to ${payload.to} (id: ${data?.id})`);

      return { success: true, id: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      lastError = message;

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
        continue;
      }
    }
  }

  console.error(`[Email] Failed to send "${payload.subject}" to ${payload.to}: ${lastError}`);
  return { success: false, error: lastError };
}

export { sanitizeInput, validateEmail };
