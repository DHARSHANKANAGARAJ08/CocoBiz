"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, X, Phone, Briefcase, CreditCard } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    jobRole: "Lead Tree Harvester",
    salaryType: "DAILY",
    salaryAmount: 850,
    status: "ACTIVE",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workers");
      const json = await res.json();
      if (json.success) setWorkers(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to create worker.");
      } else {
        setShowAddModal(false);
        fetchWorkers();
      }
    } catch (e) {
      setFormError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Workforce Management
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage harvesters, peelers, drying kiln operators, drivers, and supervisors.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/salary"
            className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary-container/80 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Salary Disbursements</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {workers.map((w) => (
          <div
            key={w.id}
            className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono text-outline font-semibold">
                    {w.workerCode}
                  </span>
                  <h3 className="font-headline font-bold text-lg text-on-surface mt-0.5">
                    {w.name}
                  </h3>
                  <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" /> {w.jobRole}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed">
                  {w.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-on-surface-variant py-3 border-t border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {w.phone}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-outline">Compensation:</span>
                  <span className="font-bold text-on-surface">
                    ₹{w.salaryAmount} / {w.salaryType.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs">
                <span className="text-outline">Lifetime Paid:</span>
                <span className="font-bold text-primary">{formatCurrency(w.totalSalaryPaid)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Register New Worker</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-outline rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorker} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Worker Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Murugan S"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="+91 97890 12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Job Role *</label>
                <select
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  <option value="Lead Tree Harvester">Lead Tree Harvester (Climber)</option>
                  <option value="Peeler & De-husker">Peeler & De-husker</option>
                  <option value="Kiln & Processing Operator">Kiln & Processing Operator</option>
                  <option value="Transport Driver">Transport Driver</option>
                  <option value="Yard Supervisor">Yard Supervisor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Wage Frequency *
                  </label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="DAILY">Daily Wage</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="PER_TASK">Per Task / Piece Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Wage Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.salaryAmount}
                    onChange={(e) => setFormData({ ...formData, salaryAmount: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
