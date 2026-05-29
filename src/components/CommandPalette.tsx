"use client";

import { useRouter } from "next/navigation";
import {
  CommandRoot,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Shield,
  Key,
  BarChart3,
  FileText,
  Users,
  Inbox,
  Search,
  DollarSign,
} from "lucide-react";

const navigationGroups = [
  {
    heading: "Navigation",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { id: "inbox", label: "Inbox", href: "/inbox", icon: Inbox },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    heading: "Workspace",
    items: [
      { id: "billing", label: "Billing", href: "/billing", icon: CreditCard },
      { id: "team", label: "Team Members", href: "/settings?tab=team", icon: Users },
      { id: "api-keys", label: "API Keys", href: "/settings?tab=api-keys", icon: Key },
      { id: "pricing", label: "Pricing", href: "/pricing", icon: DollarSign },
    ],
  },
  {
    heading: "Settings",
    items: [
      { id: "settings", label: "Settings", href: "/settings", icon: Settings },
      { id: "admin", label: "Admin", href: "/admin", icon: Shield },
    ],
  },
];

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  function handleSelect(id: string) {
    onClose();
    for (const group of navigationGroups) {
      const item = group.items.find((i) => i.id === id);
      if (item?.href) {
        router.push(item.href);
        return;
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="p-0 gap-0 max-w-lg top-[20%] translate-y-0 border-zinc-800">
        <CommandRoot>
          <CommandInput placeholder="Search pages, actions, and more..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {navigationGroups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item.id)}
                    >
                      <Icon className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandRoot>
      </DialogContent>
    </Dialog>
  );
}
