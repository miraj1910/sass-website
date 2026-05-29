export { sendEmail } from "./service";
export { sendTemplateEmail, buildEmailContent } from "./templates";
export { getEmailClient } from "./client";
export type {
  EmailPayload,
  SendEmailResult,
  EmailTemplate,
  EmailTemplateData,
} from "./types";
