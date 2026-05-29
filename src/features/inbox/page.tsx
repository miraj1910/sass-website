"use client";

import { motion } from "framer-motion";
import { Inbox, Mail, Paperclip } from "lucide-react";

const items = [
  {
    id: "1",
    from: "Stripe",
    subject: "Invoice PAID_001234 approved",
    preview: "Your invoice for the monthly subscription has been paid successfully.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    from: "System",
    subject: "New team member joined",
    preview: "Alice Johnson has accepted your invitation and joined the workspace.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    from: "Billing",
    subject: "Subscription upgraded to Pro",
    preview: "Your workspace has been upgraded to the Pro plan. New features are now available.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    from: "Security",
    subject: "New login from San Francisco, CA",
    preview: "A new sign-in was detected from an unrecognized device.",
    time: "1d ago",
    unread: false,
  },
];

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Inbox</h2>
        <p className="text-sm text-zinc-500 mt-1">Notifications and updates</p>
      </div>

      <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/20 cursor-pointer transition-colors"
          >
            <div className="mt-0.5">
              {item.unread ? (
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-transparent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-100">{item.from}</span>
                {item.unread && (
                  <span className="text-[10px] text-blue-400 font-medium">New</span>
                )}
              </div>
              <p className="text-sm text-zinc-300 truncate">{item.subject}</p>
              <p className="text-xs text-zinc-600 truncate mt-0.5">{item.preview}</p>
            </div>
            <span className="text-[10px] text-zinc-600 shrink-0 mt-1">{item.time}</span>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="h-8 w-8 text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">No notifications yet</p>
          <p className="text-xs text-zinc-600 mt-1">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}
