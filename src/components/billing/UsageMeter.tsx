"use client";

import { motion } from "framer-motion";
import { cn, formatCents, formatMetricValue } from "@/lib/billing/utils";

interface UsageMeterProps {
  metric: string;
  label: string;
  used: number;
  limit: number;
  percentage: number;
  overagePrice: number;
  isHardLimit: boolean;
  projectedMonthly?: number;
}

export function UsageMeter({
  metric,
  label,
  used,
  limit,
  percentage,
  overagePrice,
  isHardLimit,
  projectedMonthly,
}: UsageMeterProps) {
  const isOverLimit = used > limit;
  const isNearLimit = percentage >= 80 && !isOverLimit;
  const fillColor = isOverLimit
    ? "bg-red-500"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-blue-500";

  const barBg = isOverLimit
    ? "bg-red-500/20"
    : isNearLimit
      ? "bg-amber-500/20"
      : "bg-zinc-800";

  const estimatedOverage = used > limit
    ? formatCents(Math.round((used - limit) * overagePrice), "usd")
    : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">{label}</span>
          {isHardLimit && (
            <span className="rounded bg-zinc-800 px-1 py-0.5 text-[9px] font-medium text-zinc-500">
              Hard cap
            </span>
          )}
        </div>
        <span className="text-[11px] text-zinc-500">
          {formatMetricValue(used, metric)}
          {limit > 0 && limit < 999999999 && (
            <> / {formatMetricValue(limit, metric)}</>
          )}
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: barBg }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("absolute inset-y-0 left-0 rounded-full transition-colors", fillColor)}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          {percentage.toFixed(1)}% used
        </span>
        {projectedMonthly !== undefined && limit > 0 && limit < 999999999 && (
          <span className="text-[10px] text-zinc-600">
            Projected: {formatMetricValue(projectedMonthly, metric)}
          </span>
        )}
      </div>

      {estimatedOverage && (
        <div className="mt-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 font-medium">
              Estimated overage
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">
              {estimatedOverage}
            </span>
          </div>
        </div>
      )}

      {isHardLimit && isOverLimit && (
        <div className="mt-2 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1.5">
          <span className="text-[10px] text-red-400 font-medium">
            Hard limit reached. Upgrade your plan to continue.
          </span>
        </div>
      )}
    </div>
  );
}
