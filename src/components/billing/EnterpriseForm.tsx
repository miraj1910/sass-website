"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EnterpriseFormProps {
  open: boolean;
  onClose: () => void;
}

export function EnterpriseForm({ open, onClose }: EnterpriseFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">Thank you!</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Our sales team will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-zinc-100">Enterprise Plan</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Tell us about your needs and we&apos;ll create a custom plan.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                        Name
                      </label>
                      <Input
                        required
                        placeholder="John Smith"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                        Company
                      </label>
                      <Input
                        required
                        placeholder="Acme Inc."
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                      Email
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="john@acme.com"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                      Team size
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="50"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                      What are you looking for?
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your requirements, expected usage, and any custom needs..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    {loading ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
