import { DISCOUNT_PERCENTAGE } from "./constants";

export function formatCents(cents: number, currency: string = "usd"): string {
  const value = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function formatCentsCompact(cents: number, currency: string = "usd"): string {
  const value = cents / 100;
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return formatCents(cents, currency);
}

export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyIfMonthly = monthlyPrice * 12;
  return yearlyIfMonthly - yearlyPrice;
}

export function getYearlySavingsPercent(monthlyPrice: number, yearlyPrice: number): number {
  if (monthlyPrice === 0) return 0;
  const yearlyIfMonthly = monthlyPrice * 12;
  return Math.round((1 - yearlyPrice / yearlyIfMonthly) * 100);
}

export function getDiscountedYearlyPrice(monthlyPrice: number): number {
  return monthlyPrice * 12 * (1 - DISCOUNT_PERCENTAGE.YEARLY / 100);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    trialing: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    past_due: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    unpaid: "text-red-500 bg-red-500/10 border-red-500/20",
    canceled: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    paused: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    incomplete: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    incomplete_expired: "text-red-500 bg-red-500/10 border-red-500/20",
    paid: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    open: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    void: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    uncollectible: "text-red-500 bg-red-500/10 border-red-500/20",
  };
  return colors[status.toLowerCase()] ?? "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
}

export function getMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    api_calls: "API Calls",
    ai_tokens: "AI Tokens",
    storage: "Storage",
    bandwidth: "Bandwidth",
    team_members: "Team Members",
    compute_hours: "Compute Hours",
  };
  return labels[metric] ?? metric;
}

export function getMetricUnit(metric: string): string {
  const units: Record<string, string> = {
    api_calls: "requests",
    ai_tokens: "tokens",
    storage: "GB",
    bandwidth: "GB",
    team_members: "seats",
    compute_hours: "hours",
  };
  return units[metric] ?? "";
}

export function formatMetricValue(value: number, metric: string): string {
  const unit = getMetricUnit(metric);
  if (metric === "api_calls" || metric === "ai_tokens") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${unit}`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k ${unit}`;
    return `${Math.round(value).toLocaleString()} ${unit}`;
  }
  if (["storage", "bandwidth"].includes(metric)) {
    return `${value.toFixed(2)} ${unit}`;
  }
  return `${Math.round(value)} ${unit}`;
}
