"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ArrowDownRight, ArrowUpRight, Flame, RefreshCw, X } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

export default function CopraInventoryPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState(50);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/transactions?product=COPRA");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        const bal = json.data.reduce((sum: number, t: any) => sum + t.quantity, 0);
        setBalance(Math.max(0, bal));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "COPRA", quantity: adjustQty, notes: adjustNotes }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Adjustment failed.");
      } else {
        setShowAdjustModal(false);
        setAdjustNotes("");
        fetchData();
      }
    } catch (e) {
      setError("Server error.");
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container shadow-sm">
            <Archive className="w-6 h-6 text-tertiary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Copra Inventory (Dried Kernel)
            </h1>
            <p className="text-sm text-on-surface-variant">
              Track kiln-dried and sun-cured copra reserve ready for dispatch to commercial edible oil extraction mills.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary-container/80 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stock Adjustment</span>
          </button>
          <Link
            href="/processing/copra-processing"
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Flame className="w-4 h-4" />
            <span>Process Copra</span>
          </Link>
        </div>
      </div>

      {/* Stock Highlight Card */}
      <div className="px-8 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Current Available Stock</span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-4xl font-headline font-bold text-on-surface">
                {formatNumber(balance)}
              </h2>
              <span className="text-base text-outline font-semibold">Kilograms (kg)</span>
            </div>
            <p className="text-xs text-primary font-medium mt-1">Grade-A dry copra reserve</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Transaction Type</th>
                  <th className="py-4 px-6 font-semibold text-center">Movement</th>
                  <th className="py-4 px-6 font-semibold text-right">Quantity (kg)</th>
                  <th className="py-4 px-6 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-outline">{formatDate(tx.date)}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-on-surface">
                      <span className="px-2 py-0.5 rounded-lg bg-surface-container font-mono text-[11px]">
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {tx.quantity > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <ArrowUpRight className="w-4 h-4" /> Inflow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                          <ArrowDownRight className="w-4 h-4" /> Outflow
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-bold text-xs ${
                        tx.quantity > 0 ? "text-primary" : "text-error"
                      }`}
                    >
                      {tx.quantity > 0 ? `+${formatNumber(tx.quantity)}` : formatNumber(tx.quantity)}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {tx.notes || tx.referenceType || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Adjustment */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Copra Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 text-outline rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Moisture shrinkage or bag count audit..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
