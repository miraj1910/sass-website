"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import {
  LayoutDashboard as Dashboard,
  Shield,
  Settings,
  CreditCard,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Dashboard },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Billing", href: "/billing", icon: CreditCard },
  { title: "Pricing", href: "/pricing", icon: DollarSign },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const visibleSidebarItems = session?.user?.role === "ADMIN"
    ? [...sidebarItems, { title: "Admin", href: "/admin", icon: Shield }]
    : sidebarItems;

  const width = collapsed ? "w-14" : "w-52";

  return (
    <motion.aside
      layout
      className={`hidden lg:flex lg:flex-col ${width} lg:border-r lg:border-zinc-800 lg:bg-zinc-950 lg:fixed lg:inset-y-0 transition-all duration-200 ease-out`}
    >
      <div className="flex h-12 items-center justify-between px-3 border-b border-zinc-800">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-semibold text-zinc-100"
            >
              pulsedesk
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3">
        {visibleSidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
              }`}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-2 py-2">
        <div className={`flex items-center gap-2.5 px-2.5 py-1.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-300 shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-zinc-100 truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {session?.user?.email ?? ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors mt-1 ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sign out"
        >
          <LogOut className="h-3 w-3 shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
