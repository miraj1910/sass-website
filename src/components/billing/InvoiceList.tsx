"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Search, Filter, ChevronDown } from "lucide-react";
import { cn, formatCents, formatDate, getStatusColor, formatDateTime } from "@/lib/billing/utils";
import { INVOICE_STATUS_LABELS } from "@/lib/billing/types";
import type { InvoiceData } from "@/lib/billing/types";

interface InvoiceListProps {
  invoices: InvoiceData[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = invoices;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.number?.toLowerCase().includes(q) ||
          inv.description?.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    return result;
  }, [invoices, search, statusFilter]);

  const statuses = Array.from(new Set(invoices.map((i) => i.status)));

  const handleDownload = async (invoice: InvoiceData) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-zinc-100">Invoices</h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          View and download your billing invoices
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <FileText className="mx-auto h-6 w-6 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-500">No invoices yet</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            Invoices will appear here after your first billing cycle.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <div className="border-b border-zinc-800 bg-zinc-900/50 p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-1.5">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                      statusFilter === s
                        ? "bg-zinc-700 text-zinc-200"
                        : "bg-zinc-800 text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    {INVOICE_STATUS_LABELS[s] ?? s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            <AnimatePresence>
              {filtered.map((invoice, idx) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-300">
                        {invoice.number ?? "Draft"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border",
                          getStatusColor(invoice.status),
                        )}
                      >
                        {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-zinc-600">
                        {formatDate(invoice.createdAt)}
                      </span>
                      {invoice.periodStart && (
                        <span className="text-[10px] text-zinc-600">
                          {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-zinc-300">
                      {formatCents(invoice.total, invoice.currency)}
                    </div>
                    {invoice.status === "PAID" && invoice.paidAt && (
                      <div className="text-[9px] text-zinc-600">
                        Paid {formatDateTime(invoice.paidAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(invoice)}
                      disabled={!invoice.pdfUrl}
                      className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-xs text-zinc-500">
                {search ? "No invoices match your search" : "No invoices found"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
