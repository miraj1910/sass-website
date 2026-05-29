"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  CreditCard,
  DollarSign,
  Shield,
  BarChart3,
  Inbox,
  Users,
  Key,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  admin?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Inbox", href: "/inbox", icon: Inbox },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Workspace",
    items: [
      { title: "Team", href: "/settings?tab=team", icon: Users },
      { title: "Billing", href: "/billing", icon: CreditCard },
      { title: "Pricing", href: "/pricing", icon: DollarSign },
      { title: "API Keys", href: "/settings?tab=api-keys", icon: Key },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Admin", href: "/admin", icon: Shield, admin: true },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const toggleCollapse = useCallback(() => setCollapsed((c) => !c), []);

  const isActive = useCallback(
    (href: string) => {
      if (href === pathname) return true;
      if (href !== "/" && pathname.startsWith(href)) return true;
      if (href.includes("?")) {
        const [base] = href.split("?");
        if (pathname === base) return true;
      }
      return false;
    },
    [pathname],
  );

  return (
    <motion.aside
      layout
      className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 border-r border-zinc-800 bg-zinc-950",
        collapsed ? "w-14" : "w-52",
      )}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex h-12 items-center justify-between px-3 border-b border-zinc-800">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="text-sm font-semibold tracking-tight text-zinc-100"
            >
              pulsedesk
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={toggleCollapse}
          className="rounded-md p-1 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.admin || isAdmin,
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="px-2.5 mb-1 text-[10px] font-medium text-zinc-600 uppercase tracking-widest"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors relative group",
                        active
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40",
                      )}
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
                            className="flex-1 truncate"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !collapsed && (
                        <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                      {collapsed && active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-zinc-100" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-2 py-2">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-6 w-6 shrink-0">
            {session?.user?.image && (
              <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
            )}
            <AvatarFallback className="text-[9px]">
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[11px] font-medium text-zinc-100 truncate leading-tight">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate leading-tight">
                  {session?.user?.email ?? ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/40 transition-colors mt-1",
            collapsed && "justify-center",
          )}
          title="Sign out"
        >
          <svg
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
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
