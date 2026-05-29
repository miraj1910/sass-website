"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { UsageRecordData } from "@/lib/billing/types";

interface UsageChartProps {
  records: UsageRecordData[];
  metric: string;
  limit?: number;
}

export function UsageChart({ records, metric, limit }: UsageChartProps) {
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    const sorted = [...records]
      .filter((r) => r.metric === metric)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    for (const r of sorted) {
      const day = new Date(r.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped.set(day, (grouped.get(day) ?? 0) + r.amount);
    }

    return Array.from(grouped.entries()).map(([date, value]) => ({
      date,
      value: Math.round(value * 100) / 100,
    }));
  }, [records, metric]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-zinc-600">
        No usage data available
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#71717a" }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#e4e4e7",
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          {limit && (
            <CartesianGrid
              horizontalPoints={[limit]}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
