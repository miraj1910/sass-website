"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { BarChart3, Users, DollarSign, Activity } from "lucide-react";

const stats: { label: string; value: string; change: string; icon: typeof DollarSign; trend: "up" | "down" }[] = [
  { label: "Monthly Revenue", value: "$12,450", change: "+12.5%", icon: DollarSign, trend: "up" },
  { label: "Active Users", value: "1,234", change: "+8.2%", icon: Users, trend: "up" },
  { label: "Engagement", value: "87.3%", change: "+3.1%", icon: Activity, trend: "up" },
  { label: "Total Metrics", value: "45,678", change: "+22.4%", icon: BarChart3, trend: "up" },
];

const recentActivity = [
  { id: "1", action: "New signup", user: "alice@example.com", time: "2m ago" },
  { id: "2", action: "Subscription upgraded", user: "bob@example.com", time: "15m ago" },
  { id: "3", action: "API key created", user: "charlie@example.com", time: "1h ago" },
  { id: "4", action: "Invoice paid", user: "dave@example.com", time: "2h ago" },
  { id: "5", action: "Team member invited", user: "eve@example.com", time: "3h ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Overview</h2>
        <p className="text-sm text-zinc-500 mt-1">Your workspace at a glance</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 p-4">
          <h3 className="text-xs font-medium text-zinc-100 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-300">{item.action}</p>
                  <p className="text-[11px] text-zinc-600">{item.user}</p>
                </div>
                <span className="text-[10px] text-zinc-600">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 p-4">
          <h3 className="text-xs font-medium text-zinc-100 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left rounded-md px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors">
              Invite team member
            </button>
            <button className="w-full text-left rounded-md px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors">
              Create API key
            </button>
            <button className="w-full text-left rounded-md px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors">
              View billing
            </button>
            <button className="w-full text-left rounded-md px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors">
              View analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
