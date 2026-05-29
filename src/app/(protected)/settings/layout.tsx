"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Shield, Bell, Users as UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { label: "General", href: "/settings", icon: Settings },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Team", href: "/settings/team", icon: UsersIcon },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage your workspace settings</p>
      </div>

      <div className="flex gap-8">
        <nav className="hidden md:flex flex-col gap-0.5 w-44 shrink-0">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0 max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
