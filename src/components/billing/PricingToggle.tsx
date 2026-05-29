"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/billing/utils";
import type { BillingInterval } from "@/lib/billing/types";

interface PricingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function PricingToggle({ interval, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange("monthly")}
        className={cn(
          "text-xs font-medium transition-colors",
          interval === "monthly" ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-400",
        )}
      >
        Monthly
      </button>

      <button
        onClick={() => onChange(interval === "monthly" ? "yearly" : "monthly")}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors hover:bg-zinc-700"
      >
        <motion.div
          layout
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow-sm",
            interval === "yearly" ? "ml-[22px]" : "ml-1",
          )}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>

      <button
        onClick={() => onChange("yearly")}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium transition-colors",
          interval === "yearly" ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-400",
        )}
      >
        Yearly
        {interval === "yearly" && (
          <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 border border-emerald-500/20">
            Save 20%
          </span>
        )}
      </button>
    </div>
  );
}
