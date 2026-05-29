"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Plus, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatDate, cn } from "@/lib/billing/utils";
import { TAX_TYPES } from "@/lib/billing/constants";
import { Input } from "@/components/ui/input";
import type { TaxIdData } from "@/lib/billing/types";

interface TaxSectionProps {
  taxIds: TaxIdData[];
  onRefresh: () => Promise<void>;
}

export function TaxSection({ taxIds, onRefresh }: TaxSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("eu_vat");
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/tax-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type, value: value.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to add tax ID");
      }
      setValue("");
      setShowForm(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add tax ID");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/billing/tax-ids/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      await onRefresh();
    } catch {
      setError("Failed to delete tax ID");
    }
  };

  const selectedTaxType = TAX_TYPES.find((t) => t.value === type);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-semibold text-zinc-100">Tax Information</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Manage VAT, GST, and other tax identifiers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Tax ID
        </button>
      </div>

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
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  Tax Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {TAX_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                  {selectedTaxType?.placeholder ?? "Tax ID"}
                </label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={selectedTaxType?.placeholder ?? "Tax ID number"}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding || !value.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
                >
                  {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {taxIds.length > 0 ? (
        <div className="space-y-2">
          {taxIds.map((taxId) => (
            <div
              key={taxId.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                <Receipt className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-300 uppercase">
                    {taxId.type.replace("_", " ")}
                  </span>
                  {taxId.isVerified ? (
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400 border border-amber-500/20">
                      <XCircle className="h-2.5 w-2.5" />
                      Pending
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{taxId.value}</div>
              </div>
              <button
                onClick={() => handleDelete(taxId.id)}
                className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Remove tax ID"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 p-6 text-center">
          <Receipt className="mx-auto h-6 w-6 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-500">No tax IDs added</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            Add VAT, GST, or other tax IDs for compliance.
          </p>
        </div>
      )}
    </div>
  );
}
