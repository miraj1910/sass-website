"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  FileText,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Ban,
} from "lucide-react";
import { formatDateTime, formatCents } from "@/lib/billing/utils";
import type { BillingActivityData } from "@/lib/billing/types";

interface BillingActivityProps {
  activity: BillingActivityData[];
}

const actionConfig: Record<string, { icon: React.ElementType; color: string }> = {
  subscription_created: { icon: CheckCircle, color: "text-emerald-500" },
  subscription_updated: { icon: RefreshCw, color: "text-blue-500" },
  subscription_canceled: { icon: Ban, color: "text-zinc-500" },
  payment_succeeded: { icon: CheckCircle, color: "text-emerald-500" },
  payment_failed: { icon: XCircle, color: "text-red-500" },
  payment_retry: { icon: RefreshCw, color: "text-amber-500" },
  invoice_created: { icon: FileText, color: "text-blue-500" },
  invoice_paid: { icon: CheckCircle, color: "text-emerald-500" },
  invoice_overdue: { icon: AlertTriangle, color: "text-red-500" },
  payment_method_added: { icon: CreditCard, color: "text-blue-500" },
  payment_method_removed: { icon: CreditCard, color: "text-zinc-500" },
  seat_invited: { icon: UserPlus, color: "text-blue-500" },
  seat_removed: { icon: UserMinus, color: "text-zinc-500" },
  tax_id_added: { icon: FileText, color: "text-blue-500" },
  tax_id_removed: { icon: FileText, color: "text-zinc-500" },
};

export function BillingActivity({ activity }: BillingActivityProps) {
  const defaultIcon = FileText;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-zinc-100">Activity</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Recent billing and account activity
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-6 text-center">
          <RefreshCw className="mx-auto h-5 w-5 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-500">No recent activity</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
          <div className="space-y-0">
            {activity.map((item, idx) => {
              const config = actionConfig[item.action];
              const Icon = config?.icon ?? defaultIcon;
              const colorClass = config?.color ?? "text-zinc-500";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="relative flex items-start gap-3 pb-3 pl-6"
                >
                  <div className={`absolute left-0 mt-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-zinc-950 ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-zinc-300 capitalize">
                        {item.action.replace(/_/g, " ")}
                      </span>
                      {item.amount != null && (
                        <span className="text-[11px] font-medium text-zinc-300 flex-shrink-0">
                          {formatCents(item.amount, item.currency ?? "usd")}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[9px] text-zinc-700 mt-0.5">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
