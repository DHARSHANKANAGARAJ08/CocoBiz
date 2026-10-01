"use client";

import React, { useEffect, useState } from "react";
import {
  Tractor,
  Plus,
  Calendar,
  Sprout,
  CheckCircle2,
  X,
  CreditCard,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function HarvestRecordsPage() {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: "",
    treesHarvested: 100,
    coconutCount: 1200,
    coconutPrice: 28,
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/harvest-records");
      const json = await res.json();
      if (json.success) setHarvests(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/tree-bookings");
      const json = await res.json();
      if (json.success) {
        // Only active/in_progress bookings with remaining trees
        const active = json.data.filter((b: any) => b.treesRemaining > 0);
        setBookings(active);
        if (active.length > 0 && !formData.bookingId) {
          setFormData((p) => ({ ...p, bookingId: active[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHarvests();
    fetchBookings();
  }, []);

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/harvest-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to record harvest.");
      } else {
        setShowAddModal(false);
        fetchHarvests();
        fetchBookings();
      }
    } catch (err) {
      setFormError("Server error recording harvest.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBooking = bookings.find((b) => b.id === formData.bookingId);
  const avgNutsCalc =
    formData.treesHarvested > 0
      ? Math.round((formData.coconutCount / formData.treesHarvested) * 100) / 100
      : 0;
  const totalAmountCalc = formData.coconutCount * formData.coconutPrice;

  const totalHarvestedTrees = harvests.reduce((s, h) => s + h.treesHarvested, 0);
  const totalHarvestedCoconuts = harvests.reduce((s, h) => s + h.coconutCount, 0);
  const totalHarvestValue = harvests.reduce((s, h) => s + h.totalCoconutAmount, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Tree Harvesting Records
            </h1>
            <p className="text-sm text-on-surface-variant">
              Log palm tree harvesting batches, track nut counts per tree, and credit coconut stock to the inventory ledger.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
        >
          <Plus className="w-4 h-4" />
          <span>Record Harvest</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Trees Harvested</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(totalHarvestedTrees)}
            </h3>
            <p className="text-xs text-primary font-medium mt-0.5">Total palm climbs</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <Tractor className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Coconuts Collected</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(totalHarvestedCoconuts)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Raw nuts added to inventory</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
            <Sprout className="w-6 h-6 text-tertiary" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Harvest Value</span>
            <h3 className="text-3xl font-headline font-bold text-primary mt-1">
              {formatCurrency(totalHarvestValue)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Payable to palm owners</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Harvest Records Table */}
      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Harvest ID & Date</th>
                  <th className="py-4 px-6 font-semibold">Farm & Owner</th>
                  <th className="py-4 px-6 font-semibold">Booking Ref</th>
                  <th className="py-4 px-6 font-semibold text-center">Trees Harvested</th>
                  <th className="py-4 px-6 font-semibold text-center">Coconuts Collected</th>
                  <th className="py-4 px-6 font-semibold text-center">Avg / Tree</th>
                  <th className="py-4 px-6 font-semibold text-right">Price / Nut</th>
                  <th className="py-4 px-6 font-semibold text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {harvests.map((h) => (
                  <tr key={h.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {h.harvestCode}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(h.harvestDate)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-xs text-on-surface">{h.farm?.name}</div>
                      <div className="text-[10px] text-outline">Owner: {h.owner?.name}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-outline">
                      {h.booking?.bookingCode}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-on-surface">
                      {formatNumber(h.treesHarvested)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-primary">
                      {formatNumber(h.coconutCount)}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-xs text-tertiary">
                      {h.avgCoconutsPerTree} nuts
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-xs text-on-surface">
                      ₹{h.coconutPrice}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-xs text-primary">
                      {formatCurrency(h.totalCoconutAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Record Harvest */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Record Tree Harvest Batch
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordHarvest} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Select Tree Booking *
                </label>
                <select
                  required
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingCode} - {b.farmName} ({b.ownerName}) [Remaining: {b.treesRemaining} trees]
                    </option>
                  ))}
                </select>
                {selectedBooking && (
                  <p className="text-[11px] text-primary font-medium mt-1">
                    Remaining in contract: {selectedBooking.treesRemaining} trees out of {selectedBooking.totalTreesBooked}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Trees Harvested in this Batch *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedBooking ? selectedBooking.treesRemaining : 9999}
                    value={formData.treesHarvested}
                    onChange={(e) => setFormData({ ...formData, treesHarvested: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Raw Coconuts Collected *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.coconutCount}
                    onChange={(e) => setFormData({ ...formData, coconutCount: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Price per Coconut (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min={1}
                    value={formData.coconutPrice}
                    onChange={(e) => setFormData({ ...formData, coconutPrice: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-outline">Average Yield</span>
                  <span className="text-sm font-bold text-tertiary">
                    {avgNutsCalc} nuts / tree
                  </span>
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Batch Total Payable:</span>
                <span className="font-headline font-bold text-lg text-primary">
                  {formatCurrency(totalAmountCalc)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="North sector, grade 1 nut condition..."
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
                  {submitting ? "Saving..." : "Record & Update Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
