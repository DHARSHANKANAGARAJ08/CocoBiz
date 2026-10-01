"use client";

import React, { useEffect, useState } from "react";
import { Receipt, Plus, X, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "ELECTRICITY", "MAINTENANCE", "RENT", "PROCESSING",
  "PACKAGING", "FUEL", "OFFICE", "MISCELLANEOUS",
];
const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER"];
const CATEGORY_COLORS: Record<string, string> = {
  ELECTRICITY: "bg-yellow-100 text-yellow-700",
  MAINTENANCE: "bg-blue-100 text-blue-700",
  RENT: "bg-purple-100 text-purple-700",
  PROCESSING: "bg-green-100 text-green-700",
  PACKAGING: "bg-teal-100 text-teal-700",
  FUEL: "bg-orange-100 text-orange-700",
  OFFICE: "bg-indigo-100 text-indigo-700",
  MISCELLANEOUS: "bg-gray-100 text-gray-700",
};

export default function OtherExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "ELECTRICITY",
    description: "",
    amount: "",
    paymentMethod: "CASH",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses?type=other");
      const json = await res.json();
      if (json.success) setExpenses(json.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "other", amount: parseFloat(form.amount) }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Expense recorded successfully!");
        setShowForm(false);
        setForm({ date: new Date().toISOString().split("T")[0], category: "ELECTRICITY", description: "", amount: "", paymentMethod: "CASH", notes: "" });
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Failed to record expense");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  const filtered = filterCategory === "ALL" ? expenses : expenses.filter(e => e.category === filterCategory);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // Stats per category
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
            <Receipt className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Other Expenses</h1>
            <p className="text-sm text-outline">Track operational expenses — electricity, maintenance, rent & more</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">✓ {success}</div>
      )}

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {CATEGORIES.slice(0, 4).map(cat => (
          <div key={cat} className="rounded-2xl bg-surface-container border border-outline-variant/20 p-3.5 shadow-sm">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>{cat.replace(/_/g, " ")}</span>
            <p className="text-lg font-headline font-bold text-on-surface mt-2">{formatCurrency(categoryTotals[cat])}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Expense Records</h2>
            <p className="text-xs text-outline mt-0.5">Total shown: <strong className="text-primary">{formatCurrency(total)}</strong></p>
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs border border-outline-variant/30 rounded-lg px-3 py-1.5 bg-surface text-on-surface focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="p-8 text-center text-outline text-sm">Loading expenses…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-outline text-sm">No expenses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-outline">{e.expenseCode || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${CATEGORY_COLORS[e.category] || "bg-gray-100 text-gray-700"}`}>
                        {e.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface max-w-xs truncate">{e.description}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{e.paymentMethod.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-error">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-outline-variant/20 bg-surface-container-low">
                  <td colSpan={5} className="px-4 py-3 text-sm font-bold text-on-surface text-right">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-error text-base">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-headline font-bold text-on-surface">Add Other Expense</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-outline hover:bg-surface-container-high transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-error bg-error-container/30 rounded-xl p-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-outline uppercase tracking-wide">Description *</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required placeholder="Brief description of the expense"
                  className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Amount (₹) *</label>
                  <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00"
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-outline uppercase tracking-wide">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes..."
                  className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                  {submitting ? "Saving…" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
