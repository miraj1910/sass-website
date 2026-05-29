import { Resend } from "resend";

let client: Resend | null = null;

export function getEmailClient(): Resend {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  client = new Resend(apiKey);
  return client;
}

export function resetEmailClient() {
  client = null;
}
