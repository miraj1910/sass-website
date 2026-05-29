import type { EmailTemplate, EmailTemplateData } from "./types";
import { sendEmail } from "./service";

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

const HTML_WRAPPER = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .email-card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 32px;
    }
    .email-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .email-logo {
      font-size: 20px;
      font-weight: 700;
      color: #e4e4e7;
      letter-spacing: -0.02em;
    }
    .email-body {
      color: #a1a1aa;
      font-size: 14px;
      line-height: 1.6;
    }
    .email-body h1 {
      color: #e4e4e7;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    .email-body p {
      margin: 0 0 16px 0;
    }
    .email-button {
      display: inline-block;
      padding: 10px 24px;
      background: #e4e4e7;
      color: #09090b;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      margin: 8px 0;
    }
    .email-otp {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      color: #e4e4e7;
      letter-spacing: 8px;
      margin: 24px 0;
      font-family: "SF Mono", Monaco, monospace;
    }
    .email-footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #27272a;
      text-align: center;
      color: #52525b;
      font-size: 12px;
    }
    .email-footer a {
      color: #71717a;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">
      <div class="email-header">
        <div class="email-logo">PulseDesk</div>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p>PulseDesk — Social Media Analytics</p>
        <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

const TEMPLATES: Record<EmailTemplate, string> = {
  welcome: HTML_WRAPPER(`
    <h1>Welcome to PulseDesk, {{name}}!</h1>
    <p>We're thrilled to have you on board. Your workspace <strong>{{workspaceName}}</strong> is ready to go.</p>
    <p>Here's what you can do next:</p>
    <ul>
      <li>Connect your social media accounts</li>
      <li>Invite your team members</li>
      <li>Set up your first analytics dashboard</li>
    </ul>
    {{magicLink}}
    <p style="margin-top: 24px;">If you have any questions, just reply to this email.</p>
    <p>The PulseDesk Team</p>
  `),
  otp: HTML_WRAPPER(`
    <h1>Your verification code</h1>
    {{name}}
    <p>Use the code below to complete your verification. This code expires in {{expiresInMinutes}} minutes.</p>
    <div class="email-otp">{{otp}}</div>
    <p>If you didn't request this code, you can safely ignore this email.</p>
  `),
  "password-reset": HTML_WRAPPER(`
    <h1>Reset your password</h1>
    {{name}}
    <p>We received a request to reset your password. Click the button below to set a new one. This link expires in {{expiresInHours}} hours.</p>
    <p style="text-align: center;">
      <a href="{{resetLink}}" class="email-button">Reset Password</a>
    </p>
    <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
  `),
  notification: HTML_WRAPPER(`
    <h1>{{title}}</h1>
    {{name}}
    <p>{{body}}</p>
    {{cta}}
    <p>The PulseDesk Team</p>
  `),
  contact: HTML_WRAPPER(`
    <h1>New Contact Form Submission</h1>
    <p><strong>From:</strong> {{name}} ({{email}})</p>
    <p><strong>Subject:</strong> {{subject}}</p>
    <hr style="border: none; border-top: 1px solid #27272a; margin: 16px 0;" />
    <p>{{message}}</p>
  `),
};

export function buildEmailContent<T extends EmailTemplate>(
  template: T,
  data: EmailTemplateData[T],
): { subject: string; html: string; text?: string } {
  switch (template) {
    case "welcome": {
      const d = data as EmailTemplateData["welcome"];
      const magicLinkHtml = d.magicLink
        ? `<p style="text-align: center;"><a href="${d.magicLink}" class="email-button">Get Started</a></p>`
        : "";
      return {
        subject: `Welcome to PulseDesk, ${d.name}!`,
        html: renderTemplate(TEMPLATES.welcome, {
          ...d,
          magicLink: magicLinkHtml,
        }),
      };
    }
    case "otp": {
      const d = data as EmailTemplateData["otp"];
      return {
        subject: "Your verification code",
        html: renderTemplate(TEMPLATES.otp, {
          ...d,
          name: d.name ? `<p>Hi ${d.name},</p>` : "",
        }),
      };
    }
    case "password-reset": {
      const d = data as EmailTemplateData["password-reset"];
      return {
        subject: "Reset your password",
        html: renderTemplate(TEMPLATES["password-reset"], {
          ...d,
          name: d.name ? `<p>Hi ${d.name},</p>` : "",
        }),
      };
    }
    case "notification": {
      const d = data as EmailTemplateData["notification"];
      const cta = d.ctaUrl && d.ctaText
        ? `<p style="text-align: center;"><a href="${d.ctaUrl}" class="email-button">${d.ctaText}</a></p>`
        : "";
      return {
        subject: d.title,
        html: renderTemplate(TEMPLATES.notification, {
          ...d,
          name: d.name ? `<p>Hi ${d.name},</p>` : "",
          cta,
        }),
      };
    }
    case "contact": {
      const d = data as EmailTemplateData["contact"];
      return {
        subject: `[Contact Form] ${d.subject ?? "New message"} from ${d.name}`,
        html: renderTemplate(TEMPLATES.contact, d),
      };
    }
  }
}

export async function sendTemplateEmail<T extends EmailTemplate>(
  template: T,
  to: string | string[],
  data: EmailTemplateData[T],
  options?: { replyTo?: string; scheduledAt?: string },
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { subject, html } = buildEmailContent(template, data);

  return sendEmail({
    to,
    subject,
    html,
    replyTo: options?.replyTo,
    scheduledAt: options?.scheduledAt,
    tags: [{ name: "template", value: template }],
  });
}
