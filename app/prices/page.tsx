"use client";

import React, { useEffect, useState } from "react";
import { Tag, Plus, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PRODUCTS = ["COCONUT", "HUSK", "COPRA"];
const COCONUT_TYPES = ["WITH_HUSK", "WITHOUT_HUSK", "DRIED", "WET"];
const HUSK_TYPES = ["RAW_HUSK", "DRIED_HUSK", "HUSK_FIBER"];
const COPRA_TYPES = ["DRIED_COPRA", "WET_COPRA", "BALL_COPRA"];
const UNITS = ["per nut", "per kg", "per ton", "per batch"];

const PRODUCT_COLORS: Record<string, string> = {
  COCONUT: "text-emerald-700 bg-emerald-50 border-emerald-200",
  HUSK: "text-amber-700 bg-amber-50 border-amber-200",
  COPRA: "text-orange-700 bg-orange-50 border-orange-200",
};

export default function PricesPage() {
  const [data, setData] = useState<{ latest: any[]; history: any[] }>({ latest: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterProduct, setFilterProduct] = useState("ALL");
  const [form, setForm] = useState({
    product: "COCONUT",
    type: "WITH_HUSK",
    unit: "per nut",
    price: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prices");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getTypes = (product: string) => {
    if (product === "COCONUT") return COCONUT_TYPES;
    if (product === "HUSK") return HUSK_TYPES;
    return COPRA_TYPES;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Price recorded successfully!");
        setShowForm(false);
        setForm({ product: "COCONUT", type: "WITH_HUSK", unit: "per nut", price: "", notes: "" });
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(json.error || "Failed to record price");
      }
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  };

  const filtered = data.history.filter(p => filterProduct === "ALL" || p.product === filterProduct);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
            <Tag className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Daily Prices</h1>
            <p className="text-sm text-outline">Manage market price rates for coconut, husk and copra</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record Price
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          ✓ {success}
        </div>
      )}

      {/* Current Prices Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-outline uppercase tracking-wide mb-3">Current Market Rates</h2>
        {data.latest.length === 0 ? (
          <div className="rounded-2xl bg-surface-container p-6 text-center text-outline text-sm">
            No prices recorded yet. Add your first price entry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.latest.map((p) => (
              <div key={p.id} className="rounded-2xl bg-surface-container border border-outline-variant/20 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${PRODUCT_COLORS[p.product] || "text-outline bg-surface-container-high border-outline-variant"}`}>
                    {p.product}
                  </span>
                  <span className="text-xs text-outline">{formatDate(p.date)}</span>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">{p.type.replace(/_/g, " ")}</p>
                <p className="text-2xl font-headline font-bold text-primary mt-1">
                  {formatCurrency(p.price)}
                </p>
                <p className="text-xs text-outline mt-0.5">{p.unit}</p>
                {p.notes && <p className="text-xs text-outline mt-2 italic">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-on-surface">Price History</h2>
          <select
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            className="text-xs border border-outline-variant/30 rounded-lg px-3 py-1.5 bg-surface text-on-surface focus:outline-none"
          >
            <option value="ALL">All Products</option>
            {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="p-8 text-center text-outline text-sm">Loading price data…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-outline text-sm">No price history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-low">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant">{formatDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${PRODUCT_COLORS[p.product] || ""}`}>
                        {p.product}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface">{p.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{p.unit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs italic">{p.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-headline font-bold text-on-surface">Record Market Price</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-outline hover:bg-surface-container-high transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-error bg-error-container/30 rounded-xl p-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Product *</label>
                  <select
                    value={form.product}
                    onChange={e => setForm({ ...form, product: e.target.value, type: getTypes(e.target.value)[0] })}
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {getTypes(form.product).map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    required
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Unit *</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-outline uppercase tracking-wide">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional market notes..."
                  className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
                  {submitting ? "Saving…" : "Save Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
