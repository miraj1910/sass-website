"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PricingCard } from "@/components/billing/PricingCard";
import { PricingToggle } from "@/components/billing/PricingToggle";
import { FeatureMatrix } from "@/components/billing/FeatureMatrix";
import { EnterpriseForm } from "@/components/billing/EnterpriseForm";
import { DEFAULT_PLANS } from "@/lib/billing/plans";
import { formatCents } from "@/lib/billing/utils";
import type { PlanData, BillingInterval } from "@/lib/billing/types";

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [planLoading, setPlanLoading] = useState<string | null>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  const allFeatures = [
    "API calls/month",
    "Analytics dashboard",
    "Data retention",
    "Team members",
    "Support level",
    "Advanced analytics",
    "Custom integrations",
    "Priority support",
    "Team collaboration",
    "API access",
    "Usage analytics",
    "Custom reports",
  ];

  const handleSelectPlan = async (plan: PlanData) => {
    if (plan.slug === "enterprise") {
      setEnterpriseOpen(true);
      return;
    }

    setPlanLoading(plan.slug);
    try {
      const priceId = interval === "yearly" ? `price_${plan.slug}_yearly` : `price_${plan.slug}_monthly`;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceId,
          planSlug: plan.slug,
          billing: interval.toUpperCase(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Checkout failed" }));
        throw new Error(body.error ?? "Checkout failed");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setPlanLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 mb-4">
          <Sparkles className="h-3 w-3 text-blue-400" />
          <span className="text-[10px] font-medium text-blue-400">Simple, transparent pricing</span>
        </div>
        <h1 className="text-lg font-semibold text-zinc-100">
          Choose the right plan for your team
        </h1>
        <p className="mt-1.5 text-xs text-zinc-500 max-w-md mx-auto">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
        <div className="mt-6 flex items-center justify-center">
          <PricingToggle interval={interval} onChange={setInterval} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {DEFAULT_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            interval={interval}
            isSelected={false}
            onSelect={handleSelectPlan}
            onEnterpriseClick={() => setEnterpriseOpen(true)}
            loading={planLoading === plan.slug}
          />
        ))}
      </div>

      {interval === "yearly" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-16 text-center"
        >
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-400 font-medium">
              Save up to 20% with annual billing
            </p>
            <p className="text-[11px] text-emerald-500/60 mt-1">
              {formatCents(DEFAULT_PLANS[1].monthlyPrice * 12 - DEFAULT_PLANS[1].yearlyPrice)} savings on Pro plan
            </p>
          </div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-sm font-semibold text-zinc-100">
            Compare plans in detail
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            See exactly what&apos;s included in each plan
          </p>
        </div>
        <FeatureMatrix plans={DEFAULT_PLANS} allFeatures={allFeatures} />
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-sm font-semibold text-zinc-100 mb-2">
          Need something custom?
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          We offer custom pricing for large teams and enterprises.
        </p>
        <button
          onClick={() => setEnterpriseOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Talk to Sales
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <EnterpriseForm
        open={enterpriseOpen}
        onClose={() => setEnterpriseOpen(false)}
      />
    </div>
  );
}
