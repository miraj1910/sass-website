"use client";

import { cn } from "@/lib/billing/utils";
import { SUBSCRIPTION_STATUS_LABELS, SUBSCRIPTION_STATUS_COLORS } from "@/lib/billing/types";
import type { SubscriptionData } from "@/lib/billing/types";

interface SubscriptionBadgeProps {
  subscription: SubscriptionData | null;
  className?: string;
}

export function SubscriptionBadge({ subscription, className }: SubscriptionBadgeProps) {
  if (!subscription) {
    return (
      <span className={cn("inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-500", className)}>
        No Plan
      </span>
    );
  }

  const status = subscription.status;
  const label = SUBSCRIPTION_STATUS_LABELS[status] ?? status;
  const color = SUBSCRIPTION_STATUS_COLORS[status] ?? "text-zinc-500";

  return (
    <span className={cn("inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-medium", color, className)}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", color.replace("text-", "bg-"))} />
      {label}
      {status === "PAST_DUE" && (
        <span className="ml-1 text-[9px] text-amber-400">Action needed</span>
      )}
    </span>
  );
}
