"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  Plus,
  Tractor,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function TreeBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    ownerId: "",
    farmId: "",
    totalTreesBooked: 500,
    pricePerTree: 35,
    expectedHarvestDate: "",
    notes: "",
    status: "BOOKED",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tree-bookings?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [fRes, oRes] = await Promise.all([fetch("/api/farms"), fetch("/api/farm-owners")]);
      const [fJson, oJson] = await Promise.all([fRes.json(), oRes.json()]);
      if (fJson.success) setFarms(fJson.data);
      if (oJson.success) {
        setOwners(oJson.data);
        if (oJson.data.length > 0 && !formData.ownerId) {
          setFormData((p) => ({ ...p, ownerId: oJson.data[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  useEffect(() => {
    loadDependencies();
  }, []);

  // Filter farms by selected owner
  const availableFarms = farms.filter((f) => !formData.ownerId || f.ownerId === formData.ownerId);

  useEffect(() => {
    if (availableFarms.length > 0) {
      setFormData((p) => ({ ...p, farmId: availableFarms[0].id }));
    }
  }, [formData.ownerId, farms]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/tree-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to create tree booking.");
      } else {
        setShowAddModal(false);
        fetchBookings();
      }
    } catch (err) {
      setFormError("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalBooked = bookings.reduce((s, b) => s + b.totalTreesBooked, 0);
  const totalCompleted = bookings.reduce((s, b) => s + b.treesCompleted, 0);
  const totalRemaining = bookings.reduce((s, b) => s + b.treesRemaining, 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container shadow-sm">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Tree Bookings Module
            </h1>
            <p className="text-sm text-on-surface-variant">
              Reserve palm trees for harvesting cycles, monitor harvest quotas, and enforce booking caps.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer border border-outline-variant/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>New Tree Booking</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Total Booked</span>
            <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">
              {formatNumber(totalBooked)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Trees under contract</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
            <BookmarkCheck className="w-6 h-6 text-tertiary" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Harvested / Done</span>
            <h3 className="text-3xl font-headline font-bold text-primary mt-1">
              {formatNumber(totalCompleted)}
            </h3>
            <p className="text-xs text-primary font-medium mt-0.5">Completed palms</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container">
            <Tractor className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-outline">Pending Harvest</span>
            <h3 className="text-3xl font-headline font-bold text-error mt-1">
              {formatNumber(totalRemaining)}
            </h3>
            <p className="text-xs text-outline mt-0.5">Trees awaiting team dispatch</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-error-container/40 flex items-center justify-center text-on-error-container">
            <Clock className="w-6 h-6 text-error" />
          </div>
        </div>
      </div>

      {/* Bookings List / Table */}
      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Booking Code & Date</th>
                  <th className="py-4 px-6 font-semibold">Farm Owner</th>
                  <th className="py-4 px-6 font-semibold">Farm Location</th>
                  <th className="py-4 px-6 font-semibold text-center">Booked Trees</th>
                  <th className="py-4 px-6 font-semibold text-center">Harvested</th>
                  <th className="py-4 px-6 font-semibold text-center">Remaining</th>
                  <th className="py-4 px-6 font-semibold">Progress Bar</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-xs text-on-surface">
                        {b.bookingCode}
                      </div>
                      <div className="text-[10px] text-outline">{formatDate(b.bookingDate)}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-xs text-on-surface">
                      {b.ownerName}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">{b.farmName}</td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-on-surface">
                      {formatNumber(b.totalTreesBooked)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-primary">
                      {formatNumber(b.treesCompleted)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-xs text-error">
                      {formatNumber(b.treesRemaining)}
                    </td>
                    <td className="py-4 px-6 w-44">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, b.completionPercentage)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-on-surface whitespace-nowrap">
                          {b.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "COMPLETED"
                            ? "bg-primary-fixed text-on-primary-fixed"
                            : b.status === "IN_PROGRESS"
                            ? "bg-tertiary-container/40 text-on-tertiary-container"
                            : "bg-surface-variant text-on-surface-variant"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/harvest-records?bookingId=${b.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                      >
                        <Tractor className="w-3.5 h-3.5" />
                        <span>Harvest</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: New Tree Booking */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Book Trees for Harvest</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
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
                      {f.name} ({f.totalTrees} total trees)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Total Trees to Book *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalTreesBooked}
                    onChange={(e) => setFormData({ ...formData, totalTreesBooked: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Price per Tree (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pricePerTree}
                    onChange={(e) => setFormData({ ...formData, pricePerTree: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Expected Harvest Date
                </label>
                <input
                  type="date"
                  value={formData.expectedHarvestDate}
                  onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
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
                  {submitting ? "Booking..." : "Create Tree Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
