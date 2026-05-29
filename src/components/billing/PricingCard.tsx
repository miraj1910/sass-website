"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { cn, formatCents, getYearlySavingsPercent } from "@/lib/billing/utils";
import type { PlanData, BillingInterval } from "@/lib/billing/types";

interface PricingCardProps {
  plan: PlanData;
  interval: BillingInterval;
  isSelected: boolean;
  onSelect: (plan: PlanData) => void;
  onEnterpriseClick?: () => void;
  loading?: boolean;
}

export function PricingCard({
  plan,
  interval,
  isSelected,
  onSelect,
  onEnterpriseClick,
  loading,
}: PricingCardProps) {
  const isEnterprise = plan.slug === "enterprise";
  const price = isEnterprise ? null : interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const savingsPercent = interval === "yearly" && plan.monthlyPrice > 0
    ? getYearlySavingsPercent(plan.monthlyPrice, plan.yearlyPrice)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: plan.sortOrder * 0.1 }}
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all duration-300",
        plan.isRecommended
          ? "border-blue-500/40 bg-zinc-900 shadow-xl shadow-blue-500/5 scale-[1.02] z-10"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
        isSelected && "ring-2 ring-blue-500",
      )}
    >
      {plan.isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
            <Sparkles className="h-3 w-3" />
            Recommended
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">{plan.name}</h3>
          <p className="mt-1 text-xs text-zinc-500">{plan.description}</p>
        </div>

        {isEnterprise ? (
          <div className="mb-6">
            <div className="text-3xl font-bold tracking-tight text-zinc-100">
              Custom
            </div>
            <p className="mt-1 text-xs text-zinc-500">Tailored to your needs</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-zinc-100">
                {price === 0 ? "Free" : formatCents(price!)}
              </span>
              {price !== 0 && (
                <span className="text-xs text-zinc-500">
                  /{interval === "monthly" ? "mo" : "yr"}
                </span>
              )}
            </div>
            {savingsPercent > 0 && interval === "yearly" && (
              <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                Save {savingsPercent}%
              </div>
            )}
            {plan.trialDays > 0 && (
              <p className="mt-1.5 text-[10px] text-zinc-500">
                {plan.trialDays}-day free trial
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => isEnterprise ? onEnterpriseClick?.() : onSelect(plan)}
          disabled={loading}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200",
            plan.isRecommended
              ? "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20"
              : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
            loading && "opacity-50 cursor-not-allowed",
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {isEnterprise ? "Contact Sales" : isSelected ? "Current Plan" : plan.monthlyPrice === 0 ? "Get Started" : "Subscribe"}
              {!isSelected && <ArrowRight className="h-3 w-3" />}
            </span>
          )}
        </button>

        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-2.5">
                <Check
                  className={cn(
                    "h-3.5 w-3.5 mt-0.5 flex-shrink-0",
                    feature.included ? "text-emerald-500" : "text-zinc-700",
                  )}
                />
                <span
                  className={cn(
                    "text-xs leading-relaxed",
                    feature.included ? "text-zinc-300" : "text-zinc-600",
                  )}
                >
                  {feature.value ?? feature.feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {plan.usageLimits.length > 0 && (
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">
              Usage limits
            </p>
            <div className="space-y-1.5">
              {plan.usageLimits.map((limit) => (
                <div key={limit.id} className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">{limit.description ?? limit.metric}</span>
                  <span className="text-zinc-300">
                    {limit.isHardLimit ? "Hard cap" : limit.overagePrice > 0 ? `$${limit.overagePrice}/unit` : "Included"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
