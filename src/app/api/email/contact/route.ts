import { NextResponse, type NextRequest } from "next/server";
import { sendEmail, sanitizeInput } from "@/lib/email/service";
import { rateLimitByIp } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-utils";

function validateContactBody(body: unknown): {
  valid: boolean;
  error?: string;
  data?: { name: string; email: string; message: string; subject?: string };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const raw = body as Record<string, unknown>;
  const nameRaw = raw.name;
  const emailRaw = raw.email;
  const messageRaw = raw.message;
  const subjectRaw = raw.subject;

  if (!nameRaw || typeof nameRaw !== "string" || nameRaw.trim().length < 1 || nameRaw.length > 100) {
    return { valid: false, error: "Name is required (1-100 characters)" };
  }
  const cleanName: string = nameRaw.trim();

  if (!emailRaw || typeof emailRaw !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return { valid: false, error: "Valid email is required" };
  }
  const cleanEmail: string = emailRaw.trim().toLowerCase();

  if (!messageRaw || typeof messageRaw !== "string" || messageRaw.trim().length < 10 || messageRaw.length > 5000) {
    return { valid: false, error: "Message is required (10-5000 characters)" };
  }
  const cleanMessage: string = messageRaw.trim();

  let cleanSubject: string | undefined;
  if (subjectRaw) {
    if (typeof subjectRaw !== "string" || subjectRaw.length > 200) {
      return { valid: false, error: "Subject must be under 200 characters" };
    }
    cleanSubject = subjectRaw.trim();
  }

  return {
    valid: true,
    data: {
      name: sanitizeInput(cleanName),
      email: cleanEmail,
      message: sanitizeInput(cleanMessage),
      subject: cleanSubject ? sanitizeInput(cleanSubject) : undefined,
    },
  };
}

const SPAM_TRIGGER_WORDS = [
  "seo services", "buy now", "cheap", "click here", "free money",
  "act now", "limited offer", "congratulations", "you won",
];

function isSpam(body: string, name: string): boolean {
  const text = `${name} ${body}`.toLowerCase();
  const linkCount = (text.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) return true;

  return SPAM_TRIGGER_WORDS.some((word) => text.includes(word));
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimitByIp(request, { maxRequests: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateContactBody(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, email, message, subject } = validation.data;

    if (isSpam(message, name)) {
      console.warn(`[Email] Spam detected from ${email}`);
      return NextResponse.json({ error: "Message rejected" }, { status: 400 });
    }

    const adminEmail = process.env.EMAIL_ADMIN ?? "hello@pulsedesk.app";
    const result = await sendEmail({
      to: adminEmail,
      subject: `[Contact] ${subject ?? "New message"} from ${name}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject ?? "N/A"}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
      replyTo: email,
      tags: [{ name: "source", value: "contact-form" }],
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    return serverError(error, "email.contact");
  }
}
