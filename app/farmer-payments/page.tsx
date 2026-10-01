"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
  Building,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function FarmerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: "",
    amount: 10000,
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
    isAdvance: false,
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/farmer-payments");
      const json = await res.json();
      if (json.success) setPayments(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/farm-owners");
      const json = await res.json();
      if (json.success) {
        setOwners(json.data);
        if (json.data.length > 0 && !formData.ownerId) {
          setFormData((p) => ({ ...p, ownerId: json.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchOwners();
  }, []);

  const selectedOwner = owners.find((o) => o.id === formData.ownerId);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/farmer-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Payment failed.");
      } else {
        setShowAddModal(false);
        fetchPayments();
        fetchOwners();
      }
    } catch (e) {
      setFormError("Server error processing payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container shadow-sm">
            <CreditCard className="w-6 h-6 text-tertiary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Farmer Settlements & Payments
            </h1>
            <p className="text-sm text-on-surface-variant">
              Track outstanding grower dues, record bank transfers, UPI and cash disbursements.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Disbursements</span>
            <h3 className="text-3xl font-headline font-bold text-primary mt-1">
              {formatCurrency(totalPaid)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Paid out across all palm owners</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Transactions</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {payments.length}
            </h3>
            <p className="text-xs text-outline mt-0.5">Payment receipts issued</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <CheckCircle2 className="w-6 h-6" />
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
                  <th className="py-4 px-6 font-semibold">Payment ID & Date</th>
                  <th className="py-4 px-6 font-semibold">Farm Owner</th>
                  <th className="py-4 px-6 font-semibold">Method</th>
                  <th className="py-4 px-6 font-semibold">Ref / UTR Number</th>
                  <th className="py-4 px-6 font-semibold text-right">Amount (₹)</th>
                  <th className="py-4 px-6 font-semibold text-center">Type</th>
                  <th className="py-4 px-6 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {p.paymentCode}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(p.paymentDate)}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-xs text-on-surface">
                      {p.owner?.name}
                      <span className="block text-[10px] text-outline">
                        {p.owner?.village}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-surface-container font-medium text-on-surface">
                        {p.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-outline">
                      {p.referenceNumber || "-"}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-xs text-primary">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {p.isAdvance ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-container/30 text-on-tertiary-container">
                          Advance
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
                          Settlement
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-outline">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Record Payment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Disburse Farmer Payment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
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
                      {o.name} - Outstanding: {formatCurrency(o.outstandingBalance)}
                    </option>
                  ))}
                </select>
                {selectedOwner && (
                  <div className="mt-2 p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Outstanding Balance:</span>
                    <span className="font-bold text-error">
                      {formatCurrency(selectedOwner.outstandingBalance)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-bold text-primary"
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
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Reference / Transaction No.
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none font-mono"
                  placeholder="e.g. UTR1029384729"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="advanceCheck"
                  checked={formData.isAdvance}
                  onChange={(e) => setFormData({ ...formData, isAdvance: e.target.checked })}
                  className="rounded text-primary focus:ring-primary/40"
                />
                <label htmlFor="advanceCheck" className="text-xs font-semibold text-on-surface">
                  Mark as Advance Payment (Overrides outstanding cap)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="Harvest settlement batch #..."
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
                  {submitting ? "Processing..." : "Confirm & Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
