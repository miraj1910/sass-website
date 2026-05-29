"use client";

import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const notifications = [
  { id: "billing", label: "Billing updates", desc: "Invoices, payments, and subscription changes" },
  { id: "team", label: "Team activity", desc: "Member joins, leaves, and role changes" },
  { id: "security", label: "Security alerts", desc: "New sign-ins, password changes, and API key usage" },
  { id: "product", label: "Product updates", desc: "New features, changelog, and maintenance" },
  { id: "weekly", label: "Weekly digest", desc: "Weekly summary of workspace activity" },
];

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-100">Notifications</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Configure what notifications you receive</p>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={n.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-100">{n.label}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{n.desc}</p>
              </div>
              <Switch checked />
            </div>
            {i < notifications.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </div>
    </div>
  );
}
