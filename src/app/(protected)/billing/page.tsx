"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { UsageOverview } from "@/components/billing/UsageOverview";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { PaymentMethods } from "@/components/billing/PaymentMethods";
import { TaxSection } from "@/components/billing/TaxSection";
import { SeatManager } from "@/components/billing/SeatManager";
import { BillingActivity } from "@/components/billing/BillingActivity";
import { BillingSkeleton } from "@/components/billing/BillingSkeleton";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/summary", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load billing data");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePortal = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to open billing portal");
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Failed to open billing portal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckout = async (priceId: string) => {
    setActionLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId }),
      });
      if (!res.ok) throw new Error("Failed to start checkout");
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Failed to start checkout");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = (planSlug: string) => {
    window.location.href = `/pricing?plan=${planSlug}`;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-sm font-medium text-zinc-100">Billing</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your subscription and billing</p>
        </div>
        <BillingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-sm font-medium text-zinc-100">Billing</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your subscription and billing</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-2 text-xs text-red-400 underline hover:text-red-300">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const subscription = data?.subscription ?? null;
  const currentPlan = data?.subscription?.plan ?? null;
  const hasCustomer = data?.hasCustomer ?? false;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-sm font-medium text-zinc-100">Billing</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your subscription and billing</p>
      </div>

      <div className="space-y-8">
        <BillingOverview
          subscription={subscription}
          currentPlan={currentPlan}
          hasCustomer={hasCustomer}
          onManageBilling={handlePortal}
          onUpgrade={handleUpgrade}
          actionLoading={actionLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsageOverview
            usage={data?.usage ?? []}
            records={data?.usageRecords ?? []}
          />

          <div className="space-y-8">
            <InvoiceList invoices={data?.invoices ?? []} />
          </div>
        </div>

        <PaymentMethods
          methods={data?.paymentMethods ?? []}
          onRefresh={fetchData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TaxSection
            taxIds={data?.taxIds ?? []}
            onRefresh={fetchData}
          />
          <SeatManager
            seats={data?.seats ?? []}
            planSlug={currentPlan?.slug ?? "free"}
            onRefresh={fetchData}
          />
        </div>

        <BillingActivity activity={data?.activity ?? []} />
      </div>
    </div>
  );
}
