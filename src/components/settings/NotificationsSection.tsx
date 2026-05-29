"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

type NotificationPref = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};

const defaultPrefs: NotificationPref[] = [
  { key: "billing", label: "Billing updates", description: "Invoices, payment failures, subscription changes", enabled: true },
  { key: "team", label: "Team activity", description: "Member joins, leaves, role changes", enabled: true },
  { key: "metrics", label: "Metric alerts", description: "Usage thresholds, anomaly detection", enabled: false },
  { key: "product", label: "Product updates", description: "New features, changelog, maintenance", enabled: true },
  { key: "security", label: "Security alerts", description: "Login from new device, API key usage", enabled: true },
];

export default function NotificationsSection() {
  const [prefs, setPrefs] = useState(defaultPrefs);

  const toggle = (key: string) => {
    setPrefs((p) => p.map((pref) => (pref.key === key ? { ...pref, enabled: !pref.enabled } : pref)));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-3.5 w-3.5 text-zinc-500" />
        <h2 className="text-xs font-medium text-zinc-100">Notification Preferences</h2>
      </div>
      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
        {prefs.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-zinc-100">{pref.label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{pref.description}</p>
            </div>
            <button
              onClick={() => toggle(pref.key)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                pref.enabled ? "bg-emerald-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  pref.enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
