"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Tractor, Plus, X, Receipt } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function TransportExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNumber: "TN 38 BX 4412",
    driverName: "Karthik R",
    transportType: "PICKUP_TRUCK",
    fromLocation: "Pollachi Heritage Farm",
    toLocation: "CocoBiz Main Processing Yard",
    purpose: "Harvest Nut Hauling",
    amount: 2500,
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses?type=transport");
      const json = await res.json();
      if (json.success) setExpenses(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "transport" }),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to record transport expense.");
      } else {
        setShowAddModal(false);
        fetchExpenses();
      }
    } catch (e) {
      setFormError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalTransportCost = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Logistics & Transport Expenses
            </h1>
            <p className="text-sm text-on-surface-variant">
              Hauling nuts from groves, tractor yard trips, and customer freight costs. Included in P&L.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/expenses/other"
            className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary-container/80 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Other Operating Expenses</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Trip</span>
          </button>
        </div>
      </div>

      <div className="px-8 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Hauling Costs</span>
            <h2 className="text-4xl font-headline font-bold text-on-surface mt-1">
              {formatCurrency(totalTransportCost)}
            </h2>
            <p className="text-xs text-outline mt-1">Across {expenses.length} freight trips</p>
          </div>
        </div>
      </div>

      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Expense ID & Date</th>
                  <th className="py-4 px-6 font-semibold">Vehicle & Driver</th>
                  <th className="py-4 px-6 font-semibold">Type</th>
                  <th className="py-4 px-6 font-semibold">Route (From → To)</th>
                  <th className="py-4 px-6 font-semibold">Purpose</th>
                  <th className="py-4 px-6 font-semibold text-right">Freight Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {e.expenseCode}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(e.date)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-xs text-on-surface">{e.vehicleNumber}</div>
                      <div className="text-[10px] text-outline">Driver: {e.driverName || "-"}</div>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-outline">{e.transportType}</td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {e.fromLocation} → {e.toLocation}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium">{e.purpose}</td>
                    <td className="py-4 px-6 text-right font-bold text-xs text-error">
                      {formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Record Freight / Transport Trip
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-outline rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordExpense} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono"
                    placeholder="e.g. TN 38 BX 4412"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Ramesh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.transportType}
                    onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="PICKUP_TRUCK">Pickup Truck</option>
                    <option value="TRACTOR">Tractor / Trailer</option>
                    <option value="LORRY">Lorry / Heavy Truck</option>
                    <option value="AUTO">Auto / Goods Carrier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Freight Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-bold text-error"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Origin *</label>
                  <input
                    type="text"
                    required
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Green Valley Farm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Destination *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. CocoBiz Sorting Yard"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Trip Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Hauling 12,000 harvested coconuts"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Record Transport Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
