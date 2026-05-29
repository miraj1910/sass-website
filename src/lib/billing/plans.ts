import type { PlanData, PlanFeatureData, UsageLimitData, AddOnData } from "./types";

const freeFeatures: PlanFeatureData[] = [
  { id: "f1", feature: "Up to 1,000 API calls/month", included: true, value: "1,000", sortOrder: 0 },
  { id: "f2", feature: "Basic analytics dashboard", included: true, value: null, sortOrder: 1 },
  { id: "f3", feature: "7-day data retention", included: true, value: "7 days", sortOrder: 2 },
  { id: "f4", feature: "Single team member", included: true, value: "1 seat", sortOrder: 3 },
  { id: "f5", feature: "Community support", included: true, value: null, sortOrder: 4 },
  { id: "f6", feature: "Advanced analytics", included: false, value: null, sortOrder: 5 },
  { id: "f7", feature: "Custom integrations", included: false, value: null, sortOrder: 6 },
  { id: "f8", feature: "Priority support", included: false, value: null, sortOrder: 7 },
  { id: "f9", feature: "Team collaboration", included: false, value: null, sortOrder: 8 },
  { id: "f10", feature: "API access", included: true, value: null, sortOrder: 9 },
  { id: "f11", feature: "Usage analytics", included: false, value: null, sortOrder: 10 },
  { id: "f12", feature: "Custom reports", included: false, value: null, sortOrder: 11 },
];

const proFeatures: PlanFeatureData[] = [
  { id: "p1", feature: "Up to 100,000 API calls/month", included: true, value: "100,000", sortOrder: 0 },
  { id: "p2", feature: "Advanced analytics dashboard", included: true, value: null, sortOrder: 1 },
  { id: "p3", feature: "90-day data retention", included: true, value: "90 days", sortOrder: 2 },
  { id: "p4", feature: "Up to 10 team members", included: true, value: "10 seats", sortOrder: 3 },
  { id: "p5", feature: "Email & chat support", included: true, value: null, sortOrder: 4 },
  { id: "p6", feature: "Advanced analytics", included: true, value: null, sortOrder: 5 },
  { id: "p7", feature: "Custom integrations", included: false, value: null, sortOrder: 6 },
  { id: "p8", feature: "Priority support", included: false, value: null, sortOrder: 7 },
  { id: "p9", feature: "Team collaboration", included: true, value: null, sortOrder: 8 },
  { id: "p10", feature: "API access", included: true, value: null, sortOrder: 9 },
  { id: "p11", feature: "Usage analytics", included: true, value: null, sortOrder: 10 },
  { id: "p12", feature: "Custom reports", included: false, value: null, sortOrder: 11 },
];

const enterpriseFeatures: PlanFeatureData[] = [
  { id: "e1", feature: "Unlimited API calls", included: true, value: "Unlimited", sortOrder: 0 },
  { id: "e2", feature: "Enterprise analytics dashboard", included: true, value: null, sortOrder: 1 },
  { id: "e3", feature: "Unlimited data retention", included: true, value: "Unlimited", sortOrder: 2 },
  { id: "e4", feature: "Unlimited team members", included: true, value: "Unlimited", sortOrder: 3 },
  { id: "e5", feature: "Dedicated support", included: true, value: null, sortOrder: 4 },
  { id: "e6", feature: "Advanced analytics", included: true, value: null, sortOrder: 5 },
  { id: "e7", feature: "Custom integrations", included: true, value: null, sortOrder: 6 },
  { id: "e8", feature: "Priority support", included: true, value: null, sortOrder: 7 },
  { id: "e9", feature: "Team collaboration", included: true, value: null, sortOrder: 8 },
  { id: "e10", feature: "API access", included: true, value: null, sortOrder: 9 },
  { id: "e11", feature: "Usage analytics", included: true, value: null, sortOrder: 10 },
  { id: "e12", feature: "Custom reports", included: true, value: null, sortOrder: 11 },
];

const freeUsageLimits: UsageLimitData[] = [
  { id: "ul1", metric: "api_calls", limit: 1000, overagePrice: 0.02, overageCurrency: "usd", isHardLimit: false, description: "Per additional 1,000 calls" },
  { id: "ul2", metric: "storage", limit: 1, overagePrice: 0.10, overageCurrency: "usd", isHardLimit: false, description: "Per GB over limit" },
  { id: "ul3", metric: "team_members", limit: 1, overagePrice: 0, overageCurrency: "usd", isHardLimit: true, description: "Upgrade to Pro for more seats" },
];

const proUsageLimits: UsageLimitData[] = [
  { id: "ul4", metric: "api_calls", limit: 100000, overagePrice: 0.01, overageCurrency: "usd", isHardLimit: false, description: "Per additional 1,000 calls" },
  { id: "ul5", metric: "ai_tokens", limit: 500000, overagePrice: 0.002, overageCurrency: "usd", isHardLimit: false, description: "Per 1,000 tokens over limit" },
  { id: "ul6", metric: "storage", limit: 10, overagePrice: 0.05, overageCurrency: "usd", isHardLimit: false, description: "Per GB over limit" },
  { id: "ul7", metric: "bandwidth", limit: 100, overagePrice: 0.03, overageCurrency: "usd", isHardLimit: false, description: "Per GB over limit" },
  { id: "ul8", metric: "team_members", limit: 10, overagePrice: 1500, overageCurrency: "usd", isHardLimit: false, description: "$15/seat/month for additional seats" },
  { id: "ul9", metric: "compute_hours", limit: 100, overagePrice: 0.50, overageCurrency: "usd", isHardLimit: false, description: "Per additional hour" },
];

const enterpriseUsageLimits: UsageLimitData[] = [
  { id: "ul10", metric: "api_calls", limit: 999999999, overagePrice: 0.005, overageCurrency: "usd", isHardLimit: false, description: "Custom pricing" },
  { id: "ul11", metric: "storage", limit: 1000, overagePrice: 0.02, overageCurrency: "usd", isHardLimit: false, description: "Per GB over limit" },
  { id: "ul12", metric: "team_members", limit: 999999, overagePrice: 0, overageCurrency: "usd", isHardLimit: false, description: "Included" },
];

const proAddOns: AddOnData[] = [
  { id: "ao1", name: "Extra API Calls", description: "50,000 additional API calls", price: 500, currency: "usd", type: "PER_UNIT", isActive: true },
  { id: "ao2", name: "Additional Storage", description: "10 GB additional storage", price: 500, currency: "usd", type: "PER_UNIT", isActive: true },
  { id: "ao3", name: "Extra Team Seats", description: "5 additional team seats", price: 7500, currency: "usd", type: "PER_UNIT", isActive: true },
];

export const DEFAULT_PLANS: PlanData[] = [
  {
    id: "plan_free",
    name: "Free",
    slug: "free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "usd",
    trialDays: 0,
    sortOrder: 0,
    isActive: true,
    isRecommended: false,
    features: freeFeatures,
    usageLimits: freeUsageLimits,
    addOns: [],
  },
  {
    id: "plan_pro",
    name: "Pro",
    slug: "pro",
    description: "For growing teams",
    monthlyPrice: 2900,
    yearlyPrice: 29000,
    currency: "usd",
    trialDays: 14,
    sortOrder: 1,
    isActive: true,
    isRecommended: true,
    features: proFeatures,
    usageLimits: proUsageLimits,
    addOns: proAddOns,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "For large organizations",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "usd",
    trialDays: 30,
    sortOrder: 2,
    isActive: true,
    isRecommended: false,
    features: enterpriseFeatures,
    usageLimits: enterpriseUsageLimits,
    addOns: [],
  },
];
