"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Mail, Shield, User, AlertCircle, Loader2 } from "lucide-react";
import { formatDate, cn } from "@/lib/billing/utils";
import { Input } from "@/components/ui/input";
import type { SeatData } from "@/lib/billing/types";
import { MAX_SEATS_BY_PLAN } from "@/lib/billing/constants";

interface SeatManagerProps {
  seats: SeatData[];
  planSlug?: string;
  onRefresh: () => Promise<void>;
}

export function SeatManager({ seats, planSlug = "free", onRefresh }: SeatManagerProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSeats = seats.filter((s) => s.status === "ACTIVE");
  const invitedSeats = seats.filter((s) => s.status === "INVITED");
  const maxSeats = MAX_SEATS_BY_PLAN[planSlug] ?? Infinity;
  const seatLimitReached = activeSeats.length >= maxSeats;

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to invite");
      }
      setEmail("");
      setShowInvite(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (seatId: string) => {
    try {
      const res = await fetch(`/api/billing/seats/${seatId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove");
      await onRefresh();
    } catch {
      setError("Failed to remove team member");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">Team Seats</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {activeSeats.length}{maxSeats < Infinity ? ` / ${maxSeats}` : ""} seats used
            {invitedSeats.length > 0 && ` (${invitedSeats.length} pending)`}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          disabled={seatLimitReached}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={seatLimitReached ? "Seat limit reached" : "Invite member"}
        >
          <Plus className="h-3 w-3" />
          Invite
        </button>
      </div>

      {seatLimitReached && (
        <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] text-amber-400">
            Seat limit reached. Upgrade your plan to add more members.
          </span>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-[11px] text-red-400"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowInvite(false); setError(null); }}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !email.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {seats.length > 0 ? (
        <div className="space-y-1.5">
          {seats.map((seat, idx) => (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-2.5"
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                seat.status === "ACTIVE" ? "bg-emerald-500/10" : "bg-zinc-800",
              )}>
                {seat.user?.image ? (
                  <img src={seat.user.image} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <User className="h-3.5 w-3.5 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-300">
                    {seat.user?.name ?? seat.email ?? "Unknown"}
                  </span>
                  {seat.role === "ADMIN" && (
                    <Shield className="h-3 w-3 text-amber-500" />
                  )}
                  <span className={cn(
                    "rounded px-1 py-0.5 text-[9px] font-medium",
                    seat.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400",
                  )}>
                    {seat.status === "ACTIVE" ? "Active" : "Invited"}
                  </span>
                </div>
                {seat.user?.email && (
                  <div className="text-[10px] text-zinc-600">{seat.user.email}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-600 capitalize">{seat.role.toLowerCase()}</span>
                <button
                  onClick={() => handleRemove(seat.id)}
                  className="rounded-lg p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 p-6 text-center">
          <Users className="mx-auto h-6 w-6 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-500">No team members yet</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            Invite your team to collaborate.
          </p>
        </div>
      )}
    </div>
  );
}
