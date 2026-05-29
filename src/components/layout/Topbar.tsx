"use client";

import {
  usePathname,
  useParams,
} from "next/navigation";
import {
  PanelLeft,
  Search,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarStore } from "@/lib/store";
import { useCommandPaletteStore } from "@/lib/store";
import { useSession, signOut } from "next-auth/react";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/analytics": "Analytics",
  "/billing": "Billing",
  "/settings": "Settings",
  "/pricing": "Pricing",
  "/admin": "Admin",
  "/onboarding": "Onboarding",
};

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const openPalette = useCommandPaletteStore((s) => s.setOpen);

  const title = routeTitles[pathname] ?? "PulseDesk";

  function handleToggle() {
    toggleSidebar();
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="hidden lg:inline-flex h-7 w-7"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </Button>
        <h1 className="text-sm font-medium text-zinc-100">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openPalette(true)}
          className="hidden sm:inline-flex h-7 gap-1.5 text-zinc-500 text-xs"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-4 rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5 text-[10px] font-mono text-zinc-600">
            ⌘K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:hidden"
          onClick={() => openPalette(true)}
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" aria-label="User menu">
              <Avatar className="h-6 w-6">
                {session?.user?.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
                )}
                <AvatarFallback>
                  {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-zinc-100">{session?.user?.name ?? "User"}</p>
                <p className="text-[11px] font-normal text-zinc-500">{session?.user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
