"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { UsageMeter } from "./UsageMeter";
import { UsageChart } from "./UsageChart";
import { getMetricLabel } from "@/lib/billing/utils";
import type { UsageMetricSummary, UsageRecordData } from "@/lib/billing/types";

interface UsageOverviewProps {
  usage: UsageMetricSummary[];
  records: UsageRecordData[];
}

export function UsageOverview({ usage, records }: UsageOverviewProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const activeMetric = selectedMetric ?? usage[0]?.metric ?? null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-zinc-100">Usage</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Current billing period usage and limits
        </p>
      </div>

      {usage.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <Activity className="mx-auto h-6 w-6 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-500">
            No usage data available. Start using the platform to see metrics.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {usage.map((u) => (
            <UsageMeter
              key={u.metric}
              metric={u.metric}
              label={getMetricLabel(u.metric)}
              used={u.used}
              limit={u.limit}
              percentage={u.percentage}
              overagePrice={u.overagePrice}
              isHardLimit={u.isHardLimit}
              projectedMonthly={(u as unknown as { projectedMonthly?: number }).projectedMonthly}
            />
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] font-medium text-zinc-400">Usage Trend</span>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <UsageChart
              records={records}
              metric={activeMetric ?? ""}
              limit={usage.find((u) => u.metric === activeMetric)?.limit}
            />
          </div>
        </div>
      )}

      {usage.some((u) => u.percentage >= 80) && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-400">
                Approaching usage limits
              </p>
              <p className="text-[11px] text-amber-500/70 mt-0.5">
                You&apos;re close to your plan limits on some metrics. Consider upgrading to avoid overage charges.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
