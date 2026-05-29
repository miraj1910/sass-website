"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  label: string;
  value: string;
  change?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function DashboardCard({
  label,
  value,
  change,
  icon: Icon,
  trend = "neutral",
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-zinc-600" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-zinc-100 tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-zinc-500",
            )}
          >
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
