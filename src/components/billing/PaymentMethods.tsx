"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, AlertCircle } from "lucide-react";
import { PaymentMethodCard } from "./PaymentMethodCard";
import type { PaymentMethodData } from "@/lib/billing/types";

interface PaymentMethodsProps {
  methods: PaymentMethodData[];
  onRefresh: () => Promise<void>;
}

export function PaymentMethods({ methods, onRefresh }: PaymentMethodsProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/billing/payment-methods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await onRefresh();
    } catch {
      setError("Failed to update payment method");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/billing/payment-methods/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await onRefresh();
    } catch {
      setError("Failed to delete payment method");
    }
  };

  const handleAddCard = async () => {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to open portal" }));
        throw new Error(body.error ?? "Failed to open portal");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch {
      setError("Failed to open billing portal. Please try again.");
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">Payment Methods</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Manage your saved payment methods
          </p>
        </div>
        <button
          onClick={handleAddCard}
          disabled={adding}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          {adding ? "Opening..." : "Add Card"}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5"
        >
          <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
          <span className="text-[11px] text-red-400">{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {methods.length > 0 ? (
          <div className="space-y-2">
            {methods.map((method, idx) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <PaymentMethodCard
                  method={method}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 p-6 text-center">
            <CreditCard className="mx-auto h-6 w-6 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-500">No payment methods saved</p>
            <p className="text-[10px] text-zinc-600 mt-1">
              Add a card to enable automatic billing.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
