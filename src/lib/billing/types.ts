export type BillingInterval = "monthly" | "yearly";

export interface PlanData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number;
  sortOrder: number;
  isActive: boolean;
  isRecommended: boolean;
  features: PlanFeatureData[];
  usageLimits: UsageLimitData[];
  addOns: AddOnData[];
}

export interface PlanFeatureData {
  id: string;
  feature: string;
  included: boolean;
  value: string | null;
  sortOrder: number;
}

export interface UsageLimitData {
  id: string;
  metric: string;
  limit: number;
  overagePrice: number;
  overageCurrency: string;
  isHardLimit: boolean;
  description: string | null;
}

export interface AddOnData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: "FLAT" | "PER_UNIT";
  isActive: boolean;
}

export interface SubscriptionData {
  id: string;
  stripeSubscriptionId: string;
  planId: string | null;
  plan: PlanData | null;
  status: string;
  billing: "MONTHLY" | "YEARLY";
  quantity: number;
  trialStart: string | null;
  trialEnd: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  endedAt: string | null;
  pauseCollection: boolean;
  pauseResumesAt: string | null;
  defaultPaymentMethod: string | null;
}

export interface InvoiceData {
  id: string;
  stripeInvoiceId: string;
  number: string | null;
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  status: string;
  description: string | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string | null;
  tax: number;
  subtotal: number;
  total: number;
  createdAt: string;
}

export interface PaymentMethodData {
  id: string;
  stripePaymentMethodId: string;
  type: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  billingDetails: Record<string, unknown> | null;
  createdAt: string;
}

export interface TaxIdData {
  id: string;
  stripeTaxIdId: string;
  type: string;
  value: string;
  country: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface UsageRecordData {
  id: string;
  metric: string;
  amount: number;
  recordedAt: string;
}

export interface SeatData {
  id: string;
  userId: string | null;
  email: string | null;
  role: string;
  status: string;
  invitedAt: string;
  acceptedAt: string | null;
  user?: { name: string | null; email: string | null; image: string | null } | null;
}

export interface BillingActivityData {
  id: string;
  action: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  createdAt: string;
}

export interface BillingSummary {
  hasCustomer: boolean;
  stripeCustomerId: string | null;
  subscription: SubscriptionData | null;
  currentPlan: PlanData | null;
  invoices: InvoiceData[];
  paymentMethods: PaymentMethodData[];
  taxIds: TaxIdData[];
  seats: SeatData[];
  usage: UsageMetricSummary[];
  activity: BillingActivityData[];
}

export interface UsageMetricSummary {
  metric: string;
  label: string;
  used: number;
  limit: number;
  percentage: number;
  overagePrice: number;
  isHardLimit: boolean;
}

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  TRIALING: "Trial",
  ACTIVE: "Active",
  PAST_DUE: "Past Due",
  UNPAID: "Unpaid",
  CANCELED: "Canceled",
  PAUSED: "Paused",
  INCOMPLETE: "Incomplete",
  INCOMPLETE_EXPIRED: "Expired",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  TRIALING: "text-blue-500",
  ACTIVE: "text-emerald-500",
  PAST_DUE: "text-amber-500",
  UNPAID: "text-red-500",
  CANCELED: "text-zinc-500",
  PAUSED: "text-zinc-500",
  INCOMPLETE: "text-amber-500",
  INCOMPLETE_EXPIRED: "text-red-500",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PENDING: "Pending",
  PAID: "Paid",
  UNCOLLECTIBLE: "Uncollectible",
  VOID: "Void",
  DELETED: "Deleted",
  MARKED_UNCOLLECTIBLE: "Marked Uncollectible",
};

export const USAGE_METRICS = [
  { key: "api_calls", label: "API Calls", unit: "requests" },
  { key: "ai_tokens", label: "AI Tokens", unit: "tokens" },
  { key: "storage", label: "Storage", unit: "GB" },
  { key: "bandwidth", label: "Bandwidth", unit: "GB" },
  { key: "team_members", label: "Team Members", unit: "seats" },
  { key: "compute_hours", label: "Compute Hours", unit: "hours" },
] as const;
