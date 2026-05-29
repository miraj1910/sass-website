"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Building2, ScrollText, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const adminNav = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Teams", href: "/admin/teams", icon: Building2 },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

type Stats = {
  totalUsers: number;
  totalTeams: number;
  newUsers: number;
  newTeams: number;
  recentActivity: number;
};

export default function AdminPage() {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Admin</h2>
        <p className="text-sm text-zinc-500 mt-1">System administration and management</p>
      </div>

      <nav className="flex items-center gap-1 border-b border-zinc-800 pb-0">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
                active
                  ? "border-zinc-100 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Users" value={stats?.totalUsers.toLocaleString() ?? "—"} icon={Users} />
        <DashboardCard label="Total Teams" value={stats?.totalTeams.toLocaleString() ?? "—"} icon={Building2} />
        <DashboardCard label="New Users (30d)" value={stats?.newUsers.toLocaleString() ?? "—"} icon={Activity} />
        <DashboardCard label="Events (30d)" value={stats?.recentActivity.toLocaleString() ?? "—"} icon={ScrollText} />
      </div>

      <div className="rounded-lg border border-zinc-800 p-6">
        <h3 className="text-sm font-medium text-zinc-100 mb-2">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/users"
            className="rounded-lg border border-zinc-800 px-4 py-3 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/20 transition-colors"
          >
            <Users className="h-4 w-4 mb-2 text-zinc-500" />
            Manage Users
          </Link>
          <Link
            href="/admin/teams"
            className="rounded-lg border border-zinc-800 px-4 py-3 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/20 transition-colors"
          >
            <Building2 className="h-4 w-4 mb-2 text-zinc-500" />
            Manage Teams
          </Link>
          <Link
            href="/admin/logs"
            className="rounded-lg border border-zinc-800 px-4 py-3 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/20 transition-colors"
          >
            <ScrollText className="h-4 w-4 mb-2 text-zinc-500" />
            View Audit Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
