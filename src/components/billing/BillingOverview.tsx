"use client";

import { CreditCard, CalendarDays, Timer, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { formatCents, formatDate, daysUntil, cn } from "@/lib/billing/utils";
import { SubscriptionBadge } from "./SubscriptionBadge";
import type { SubscriptionData, PlanData } from "@/lib/billing/types";

interface BillingOverviewProps {
  subscription: SubscriptionData | null;
  currentPlan: PlanData | null;
  hasCustomer: boolean;
  onManageBilling: () => Promise<void>;
  onUpgrade: (planSlug: string) => void;
  actionLoading: string | null;
}

export function BillingOverview({
  subscription,
  currentPlan,
  hasCustomer,
  onManageBilling,
  onUpgrade,
  actionLoading,
}: BillingOverviewProps) {
  const trialDaysRemaining = subscription?.trialEnd ? daysUntil(subscription.trialEnd) : null;
  const periodDaysRemaining = subscription?.currentPeriodEnd ? daysUntil(subscription.currentPeriodEnd) : null;

  const isTrialing = subscription?.status === "TRIALING";
  const isActive = subscription?.status === "ACTIVE";
  const isPastDue = subscription?.status === "PAST_DUE";
  const isCanceled = subscription?.status === "CANCELED";
  const isPaused = subscription?.status === "PAUSED";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">Current Plan</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Your subscription overview
          </p>
        </div>
        {hasCustomer && (
          <button
            onClick={onManageBilling}
            disabled={actionLoading === "portal"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === "portal" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ExternalLink className="h-3 w-3" />
            )}
            Manage Billing
          </button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h4 className="text-sm font-semibold text-zinc-100">
                  {currentPlan?.name ?? "Free"}
                </h4>
                <SubscriptionBadge subscription={subscription} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {currentPlan?.description ?? "Getting started"}
              </p>
            </div>
            {currentPlan && currentPlan.slug !== "enterprise" && (
              <div className="text-right">
                <div className="text-sm font-semibold text-zinc-100">
                  {currentPlan.monthlyPrice === 0
                    ? "Free"
                    : formatCents(
                        subscription?.billing === "YEARLY"
                          ? currentPlan.yearlyPrice
                          : currentPlan.monthlyPrice,
                        currentPlan.currency,
                      )}
                </div>
                <div className="text-[10px] text-zinc-600">
                  {currentPlan.monthlyPrice > 0 && (
                    <>{subscription?.billing === "YEARLY" ? "per year" : "per month"}</>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subscription?.billing && (
              <div className="rounded-lg bg-zinc-900 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-1">
                  <RefreshCwIcon className="h-3 w-3" />
                  Billing Cycle
                </div>
                <div className="text-xs font-medium text-zinc-300 capitalize">
                  {subscription.billing.toLowerCase()}
                </div>
              </div>
            )}

            {periodDaysRemaining !== null && isActive && (
              <div className="rounded-lg bg-zinc-900 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-1">
                  <CalendarDays className="h-3 w-3" />
                  Renews in
                </div>
                <div className="text-xs font-medium text-zinc-300">
                  {periodDaysRemaining} days
                </div>
              </div>
            )}

            {subscription?.currentPeriodEnd && isActive && (
              <div className="rounded-lg bg-zinc-900 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-1">
                  <CalendarDays className="h-3 w-3" />
                  Renewal Date
                </div>
                <div className="text-xs font-medium text-zinc-300">
                  {formatDate(subscription.currentPeriodEnd)}
                </div>
              </div>
            )}

            {trialDaysRemaining !== null && isTrialing && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 mb-1">
                  <Timer className="h-3 w-3" />
                  Trial
                </div>
                <div className="text-xs font-medium text-amber-400">
                  {trialDaysRemaining} days left
                </div>
              </div>
            )}

            <div className="rounded-lg bg-zinc-900 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-1">
                <CreditCard className="h-3 w-3" />
                Status
              </div>
              <div className={cn(
                "text-xs font-medium capitalize",
                isPastDue ? "text-red-400" : isTrialing ? "text-blue-400" : isActive ? "text-emerald-400" : "text-zinc-400",
              )}>
                {subscription?.status.toLowerCase() ?? "No plan"}
              </div>
            </div>
          </div>
        </div>

        {!hasCustomer && (
          <div className="border-t border-zinc-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-zinc-500">
                You&apos;re currently on the Free plan. Upgrade to unlock premium features.
              </p>
              <button
                onClick={() => onUpgrade("pro")}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-400 transition-colors"
              >
                Upgrade
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
