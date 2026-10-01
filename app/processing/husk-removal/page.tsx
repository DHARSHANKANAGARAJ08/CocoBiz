"use client";

import React, { useEffect, useState } from "react";
import { Scissors, Plus, X, Sprout, Layers } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

export default function HuskRemovalPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [coconutStock, setCoconutStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    coconutQtyUsed: 1000,
    huskGenerated: 1000,
    huskWeightKg: 320,
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, iRes] = await Promise.all([
        fetch("/api/processing/husk-removal"),
        fetch("/api/inventory"),
      ]);
      const [bJson, iJson] = await Promise.all([bRes.json(), iRes.json()]);
      if (bJson.success) setBatches(bJson.data);
      if (iJson.success) setCoconutStock(iJson.data.balances.COCONUT);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/processing/husk-removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to process husk removal.");
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

  const totalNutsPeeled = batches.reduce((s, b) => s + b.coconutQtyUsed, 0);
  const totalHusksProduced = batches.reduce((s, b) => s + b.huskGenerated, 0);
  const totalHuskKg = batches.reduce((s, b) => s + b.huskWeightKg, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Husk Removal Operations
            </h1>
            <p className="text-sm text-on-surface-variant">
              Peeling machinery batches: deducts raw nuts and credits usable coconut fiber husks into inventory.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
        >
          <Plus className="w-4 h-4" />
          <span>New De-Husking Batch</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Available Raw Nuts</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(coconutStock)}
            </h3>
            <p className="text-xs text-primary font-medium mt-0.5">Ready for processing</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
            <Sprout className="w-6 h-6 text-tertiary" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Coconuts Peeled</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(totalNutsPeeled)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Processed nuts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Husks Harvested</span>
            <h3 className="text-3xl font-headline font-bold text-tertiary mt-1">
              {formatNumber(totalHusksProduced)}{" "}
              <span className="text-sm font-normal text-outline">({formatNumber(totalHuskKg)} kg)</span>
            </h3>
            <p className="text-xs text-outline mt-0.5">Fiber yield</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Layers className="w-6 h-6" />
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
                  <th className="py-4 px-6 font-semibold">Batch Code & Date</th>
                  <th className="py-4 px-6 font-semibold text-center">Coconuts Used</th>
                  <th className="py-4 px-6 font-semibold text-center">Husks Generated</th>
                  <th className="py-4 px-6 font-semibold text-center">Husk Weight (kg)</th>
                  <th className="py-4 px-6 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">{b.batchCode}</div>
                      <div className="text-[10px] text-outline">{formatDate(b.date)}</div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-error">
                      -{formatNumber(b.coconutQtyUsed)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-primary">
                      +{formatNumber(b.huskGenerated)}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-xs text-on-surface">
                      {b.huskWeightKg} kg
                    </td>
                    <td className="py-4 px-6 text-xs text-outline">{b.notes || "-"}</td>
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
              <h3 className="font-headline font-bold text-lg text-on-surface">Execute De-Husking Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-outline rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRunBatch} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Available Coconut Stock:</span>
                <span className="font-bold text-primary">{formatNumber(coconutStock)} nuts</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Coconuts to Peel *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={coconutStock}
                    value={formData.coconutQtyUsed}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        coconutQtyUsed: val,
                        huskGenerated: val,
                        huskWeightKg: Math.round(val * 0.32),
                      });
                    }}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Husks Generated *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.huskGenerated}
                    onChange={(e) => setFormData({ ...formData, huskGenerated: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Total Husk Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.huskWeightKg}
                  onChange={(e) => setFormData({ ...formData, huskWeightKg: Number(e.target.value) })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Yard batch #4 peeling shift..."
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
                  {submitting ? "Processing..." : "Process Batch & Update Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
