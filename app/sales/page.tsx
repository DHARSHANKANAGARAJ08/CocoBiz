"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeDollarSign, Plus, X, UserCheck, Layers, Archive, Sprout } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryBalances, setInventoryBalances] = useState<any>({ COCONUT: 0, HUSK: 0, COPRA: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    product: "COCONUT",
    quantity: 1000,
    unitPrice: 32,
    paymentStatus: "PAID",
    paymentMethod: "BANK_TRANSFER",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes, iRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/customers"),
        fetch("/api/inventory"),
      ]);
      const [sJson, cJson, iJson] = await Promise.all([sRes.json(), cRes.json(), iRes.json()]);
      if (sJson.success) setSales(sJson.data);
      if (cJson.success) {
        setCustomers(cJson.data);
        if (cJson.data.length > 0 && !formData.customerId) {
          setFormData((p) => ({ ...p, customerId: cJson.data[0].id }));
        }
      }
      if (iJson.success) setInventoryBalances(iJson.data.balances);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentAvailableStock = inventoryBalances[formData.product] || 0;

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to record sale.");
      } else {
        setShowAddModal(false);
        fetchData();
      }
    } catch (e) {
      setFormError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSalesRevenue = sales.reduce((s, item) => s + item.totalAmount, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Sales & Dispatch Management
            </h1>
            <p className="text-sm text-on-surface-variant">
              Issue sales invoices for whole coconuts, fiber husks, and dried copra shipments.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary-container/80 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Manage Customers</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="px-8 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Sales Revenue</span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-4xl font-headline font-bold text-primary">
                {formatCurrency(totalSalesRevenue)}
              </h2>
            </div>
            <p className="text-xs text-outline mt-1">
              Generated from {sales.length} customer sales orders
            </p>
          </div>

          {/* Quick Stock Indicator */}
          <div className="flex items-center gap-4 text-xs font-medium bg-surface-container p-3 rounded-xl border border-outline-variant/15">
            <div>
              <span className="text-outline block">Coconuts</span>
              <span className="font-bold text-on-surface">
                {formatNumber(inventoryBalances.COCONUT)}
              </span>
            </div>
            <div className="border-l border-outline-variant/20 pl-4">
              <span className="text-outline block">Husks</span>
              <span className="font-bold text-on-surface">
                {formatNumber(inventoryBalances.HUSK)} kg
              </span>
            </div>
            <div className="border-l border-outline-variant/20 pl-4">
              <span className="text-outline block">Copra</span>
              <span className="font-bold text-on-surface">
                {formatNumber(inventoryBalances.COPRA)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Invoice No & Date</th>
                  <th className="py-4 px-6 font-semibold">Customer</th>
                  <th className="py-4 px-6 font-semibold">Product</th>
                  <th className="py-4 px-6 font-semibold text-center">Quantity</th>
                  <th className="py-4 px-6 font-semibold text-right">Unit Price</th>
                  <th className="py-4 px-6 font-semibold text-right">Total Revenue</th>
                  <th className="py-4 px-6 font-semibold text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {s.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(s.saleDate)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-xs text-on-surface">{s.customer?.name}</div>
                      <div className="text-[10px] text-outline">{s.customer?.businessName}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] ${
                          s.product === "COCONUT"
                            ? "bg-primary/10 text-primary"
                            : s.product === "HUSK"
                            ? "bg-tertiary-container/30 text-on-tertiary-container"
                            : "bg-secondary-container text-on-secondary-container"
                        }`}
                      >
                        {s.product}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-on-surface">
                      {formatNumber(s.quantity)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-xs">₹{s.unitPrice}</td>
                    <td className="py-4 px-6 text-right font-bold text-xs text-primary">
                      {formatCurrency(s.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.paymentStatus === "PAID"
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : s.paymentStatus === "PARTIALLY_PAID"
                            ? "bg-tertiary-container/30 text-on-tertiary-container"
                            : "bg-error-container/40 text-on-error-container"
                        }`}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Record Sale */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Create Sales Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-outline rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordSale} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.businessName ? `(${c.businessName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Product to Sell *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => {
                      const prod = e.target.value;
                      let defaultPrice = 32;
                      if (prod === "HUSK") defaultPrice = 5.2;
                      if (prod === "COPRA") defaultPrice = 145;
                      setFormData({ ...formData, product: prod, unitPrice: defaultPrice });
                    }}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-semibold"
                  >
                    <option value="COCONUT">Raw Coconut (Nuts)</option>
                    <option value="HUSK">Coconut Husk (kg/count)</option>
                    <option value="COPRA">Dried Copra (kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Quantity to Sell *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={currentAvailableStock}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <span className="text-[10px] text-outline mt-0.5 block">
                    Available in stock: {formatNumber(currentAvailableStock)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Invoice Total:</span>
                <span className="font-headline font-bold text-lg text-primary">
                  {formatCurrency(formData.quantity * formData.unitPrice)}
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
                  {submitting ? "Invoicing..." : "Issue Invoice & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
