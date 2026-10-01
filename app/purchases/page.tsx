"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Calendar,
  CreditCard,
  Sprout,
  X,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: "",
    farmId: "",
    coconutType: "WITH_HUSK",
    quantity: 2000,
    pricePerCoconut: 28,
    paymentStatus: "UNPAID",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchases");
      const json = await res.json();
      if (json.success) setPurchases(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [oRes, fRes] = await Promise.all([fetch("/api/farm-owners"), fetch("/api/farms")]);
      const [oJson, fJson] = await Promise.all([oRes.json(), fRes.json()]);
      if (oJson.success) {
        setOwners(oJson.data);
        if (oJson.data.length > 0 && !formData.ownerId) {
          setFormData((p) => ({ ...p, ownerId: oJson.data[0].id }));
        }
      }
      if (fJson.success) setFarms(fJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPurchases();
    loadDependencies();
  }, []);

  const availableFarms = farms.filter((f) => !formData.ownerId || f.ownerId === formData.ownerId);

  useEffect(() => {
    if (availableFarms.length > 0) {
      setFormData((p) => ({ ...p, farmId: availableFarms[0].id }));
    }
  }, [formData.ownerId, farms]);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to save purchase.");
      } else {
        setShowAddModal(false);
        fetchPurchases();
      }
    } catch (e) {
      setFormError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalProcuredNuts = purchases.reduce((s, p) => s + p.quantity, 0);
  const totalProcuredVal = purchases.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Coconut Procurement & Purchases
            </h1>
            <p className="text-sm text-on-surface-variant">
              Direct spot purchases, bulk farm procurement, and settlement records.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Coconuts Procured</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(totalProcuredNuts)}
            </h3>
            <p className="text-xs text-primary font-medium mt-0.5">Added to stock ledger</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Procurement Expenditure</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatCurrency(totalProcuredVal)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Total direct purchase commitments</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <CreditCard className="w-6 h-6" />
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
                  <th className="py-4 px-6 font-semibold">Purchase Code & Date</th>
                  <th className="py-4 px-6 font-semibold">Farm Owner</th>
                  <th className="py-4 px-6 font-semibold">Farm</th>
                  <th className="py-4 px-6 font-semibold">Coconut Type</th>
                  <th className="py-4 px-6 font-semibold text-center">Quantity</th>
                  <th className="py-4 px-6 font-semibold text-right">Price / Nut</th>
                  <th className="py-4 px-6 font-semibold text-right">Total Amount</th>
                  <th className="py-4 px-6 font-semibold text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {p.purchaseCode}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(p.purchaseDate)}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-xs text-on-surface">{p.owner?.name}</td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">{p.farm?.name}</td>
                    <td className="py-4 px-6 text-xs font-medium">
                      <span className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface">
                        {p.coconutType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-primary">
                      {formatNumber(p.quantity)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-xs">
                      ₹{p.pricePerCoconut}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-xs text-on-surface">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === "PAID"
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : p.paymentStatus === "PARTIALLY_PAID"
                            ? "bg-tertiary-container/30 text-on-tertiary-container"
                            : "bg-error-container/40 text-on-error-container"
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: New Purchase */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Record Coconut Purchase</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePurchase} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Farm Owner *
                </label>
                <select
                  required
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Farm *</label>
                <select
                  required
                  value={formData.farmId}
                  onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  {availableFarms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Coconut Type
                  </label>
                  <select
                    value={formData.coconutType}
                    onChange={(e) => setFormData({ ...formData, coconutType: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="WITH_HUSK">With Husk</option>
                    <option value="WITHOUT_HUSK">Without Husk</option>
                    <option value="COPRA_GRADE">Copra Grade (Dry)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Quantity (Nuts) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Price per Nut (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min={1}
                    value={formData.pricePerCoconut}
                    onChange={(e) => setFormData({ ...formData, pricePerCoconut: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Total Cost:</span>
                <span className="font-headline font-bold text-lg text-primary">
                  {formatCurrency(formData.quantity * formData.pricePerCoconut)}
                </span>
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
                  {submitting ? "Saving..." : "Save Purchase & Credit Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
