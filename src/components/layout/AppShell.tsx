"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Topbar } from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import { useCommandPaletteStore, useNavigationStore } from "@/lib/store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSidebarStore } from "@/lib/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarCollapsed = useSidebarStore((s) => s.collapsed);
  const { open, setOpen } = useCommandPaletteStore();
  const addRecentPage = useNavigationStore((s) => s.addRecentPage);

  useEffect(() => {
    addRecentPage(pathname);
  }, [pathname, addRecentPage]);

  useKeyboardShortcuts([
    { key: "k", meta: true, handler: () => setOpen(true) },
    { key: "Escape", handler: () => setOpen(false), enabled: open },
    { key: "g", meta: true, shift: true, handler: () => router.push("/inbox") },
    { key: "1", meta: true, handler: () => router.push("/dashboard") },
    { key: "2", meta: true, handler: () => router.push("/settings") },
    { key: "3", meta: true, handler: () => router.push("/billing") },
  ]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-zinc-950">
        <Sidebar />
        <div
          className={cn(
            "flex flex-col min-h-screen transition-all duration-200 ease-out",
            sidebarCollapsed ? "lg:ml-14" : "lg:ml-52",
          )}
        >
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full px-6 py-8">
              {children}
            </div>
          </main>
        </div>
        <CommandPalette open={open} onClose={() => setOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
