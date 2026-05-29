"use client";

import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/billing/utils";
import type { PlanData } from "@/lib/billing/types";

interface FeatureMatrixProps {
  plans: PlanData[];
  allFeatures: string[];
}

export function FeatureMatrix({ plans, allFeatures }: FeatureMatrixProps) {
  const getFeatureStatus = (plan: PlanData, featureName: string) => {
    const feat = plan.features.find((f) => f.feature === featureName || f.id === featureName);
    return feat;
  };

  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] gap-px bg-zinc-800 rounded-lg overflow-hidden">
          <div className="bg-zinc-900/50 px-4 py-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Feature</span>
          </div>
          {sortedPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "px-4 py-3 text-center",
                plan.isRecommended ? "bg-blue-500/5" : "bg-zinc-900/50",
              )}
            >
              <span className="text-xs font-semibold text-zinc-300">{plan.name}</span>
            </div>
          ))}

          {allFeatures.map((feature, idx) => {
            const key = `feature-${idx}`;
            return (
              <div key={key} className="contents">
                <div className="bg-zinc-900/30 px-4 py-2.5">
                  <span className="text-xs text-zinc-400">{feature}</span>
                </div>
                {sortedPlans.map((plan) => {
                  const feat = getFeatureStatus(plan, feature);
                  return (
                    <div
                      key={`${plan.id}-${idx}`}
                      className={cn(
                        "px-4 py-2.5 flex items-center justify-center",
                        plan.isRecommended ? "bg-blue-500/5" : "bg-zinc-900/30",
                      )}
                    >
                      {feat?.included ? (
                        feat.value ? (
                          <span className="text-xs text-zinc-300 font-medium">{feat.value}</span>
                        ) : (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )
                      ) : (
                        <X className="h-4 w-4 text-zinc-700" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
