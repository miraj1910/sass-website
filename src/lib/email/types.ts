export type EmailPayload = {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  scheduledAt?: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export type EmailTemplate = "welcome" | "otp" | "password-reset" | "notification" | "contact";

export type EmailTemplateData = {
  welcome: {
    name: string;
    workspaceName?: string;
    magicLink?: string;
  };
  otp: {
    otp: string;
    expiresInMinutes: number;
    name?: string;
  };
  "password-reset": {
    resetLink: string;
    name?: string;
    expiresInHours: number;
  };
  notification: {
    title: string;
    body: string;
    ctaUrl?: string;
    ctaText?: string;
    name?: string;
  };
  contact: {
    name: string;
    email: string;
    message: string;
    subject?: string;
  };
};
