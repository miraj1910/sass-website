"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Info, AlertTriangle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  type: string;
  link?: string;
  createdAt: string;
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case "success": return <Check className="h-3 w-3 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      case "error": return <X className="h-3 w-3 text-red-400" />;
      default: return <Info className="h-3 w-3 text-zinc-500" />;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-md p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-[8px] font-medium text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            <span className="text-xs font-medium text-zinc-100">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] text-zinc-500">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2.5 border-b border-zinc-800 last:border-0 ${
                    !n.read ? "bg-zinc-900/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-100">{n.title}</p>
                      {n.body && <p className="text-[11px] text-zinc-500 mt-0.5">{n.body}</p>}
                      <p className="text-[10px] text-zinc-600 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
