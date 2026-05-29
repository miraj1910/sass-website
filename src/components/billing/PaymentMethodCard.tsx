"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Check, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/billing/utils";
import type { PaymentMethodData } from "@/lib/billing/types";

interface PaymentMethodCardProps {
  method: PaymentMethodData;
  onSetDefault: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const brandIcons: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
};

export function PaymentMethodCard({ method, onSetDefault, onDelete }: PaymentMethodCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDelete = async () => {
    setActionLoading(true);
    await onDelete(method.id);
    setActionLoading(false);
    setConfirming(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-all",
        method.isDefault
          ? "border-blue-500/30 bg-blue-500/5"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
        <CreditCard className="h-4 w-4 text-zinc-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300 capitalize">
            {method.brand ?? "Card"}
          </span>
          {method.isDefault && (
            <span className="inline-flex items-center gap-0.5 rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-400 border border-blue-500/20">
              <Star className="h-2.5 w-2.5" />
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-zinc-500">
            •••• {method.last4}
          </span>
          {method.expMonth && method.expYear && (
            <span className="text-[10px] text-zinc-600">
              Expires {method.expMonth}/{method.expYear}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {!method.isDefault && (
          <button
            onClick={() => onSetDefault(method.id)}
            disabled={actionLoading}
            className="rounded-lg px-2 py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Set default
          </button>
        )}

        <AnimatePresence>
          {confirming ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1"
            >
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-lg px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg px-2 py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove payment method"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
