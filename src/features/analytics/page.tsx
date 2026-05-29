"use client";

import { BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const metrics = [
  { label: "API Calls", value: "234.5K", change: "+18.2%", trend: "up" as const },
  { label: "Error Rate", value: "0.02%", change: "-0.01%", trend: "down" as const },
  { label: "Avg Response", value: "124ms", change: "-12ms", trend: "down" as const },
  { label: "Uptime", value: "99.98%", change: "+0.02%", trend: "up" as const },
];

const topEndpoints = [
  { path: "/api/metrics", calls: "45.2K", p95: "89ms", errors: "0.01%" },
  { path: "/api/billing/summary", calls: "32.1K", p95: "145ms", errors: "0.03%" },
  { path: "/api/team/members", calls: "18.7K", p95: "67ms", errors: "0.00%" },
  { path: "/api/keys", calls: "12.4K", p95: "52ms", errors: "0.00%" },
  { path: "/api/notifications", calls: "8.9K", p95: "93ms", errors: "0.02%" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Analytics</h2>
        <p className="text-sm text-zinc-500 mt-1">Usage and performance metrics</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <DashboardCard key={m.label} {...m} />
        ))}
      </div>

      <div className="rounded-lg border border-zinc-800">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="text-xs font-medium text-zinc-100">Top Endpoints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Calls</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">P95</th>
                <th className="px-4 py-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Errors</th>
              </tr>
            </thead>
            <tbody>
              {topEndpoints.map((ep) => (
                <tr key={ep.path} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-2.5 text-xs font-mono text-zinc-300">{ep.path}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-400">{ep.calls}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-400">{ep.p95}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-400">{ep.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
