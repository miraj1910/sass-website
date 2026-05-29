export const PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const DEFAULT_CURRENCY = "usd";

export const TRIAL_DAYS_FREE = 0;
export const TRIAL_DAYS_PRO = 14;
export const TRIAL_DAYS_ENTERPRISE = 30;

export const BILLING_ERRORS = {
  NO_TEAM: "Team required",
  NO_CUSTOMER: "No billing customer found",
  NO_SUBSCRIPTION: "No active subscription",
  PAYMENT_FAILED: "Payment failed",
  INVOICE_PENDING: "Invoice is still pending",
  TAX_ID_EXISTS: "Tax ID already exists",
  SEAT_LIMIT_REACHED: "Seat limit reached for your plan",
  PLAN_NOT_FOUND: "Plan not found",
  INVALID_CYCLE: "Invalid billing cycle",
} as const;

export const DISCOUNT_PERCENTAGE = {
  YEARLY: 20,
} as const;

export const TAX_TYPES = [
  { value: "eu_vat", label: "EU VAT", placeholder: "EU VAT number" },
  { value: "us_ein", label: "US EIN", placeholder: "US Employer ID" },
  { value: "gb_vat", label: "UK VAT", placeholder: "UK VAT number" },
  { value: "ca_bn", label: "Canada BN", placeholder: "Canada Business Number" },
  { value: "au_abn", label: "Australia ABN", placeholder: "Australia ABN" },
  { value: "jp_cn", label: "Japan CN", placeholder: "Japan Corporate Number" },
] as const;

export const MAX_SEATS_BY_PLAN: Record<string, number | null> = {
  free: 1,
  pro: 10,
  enterprise: null,
};
