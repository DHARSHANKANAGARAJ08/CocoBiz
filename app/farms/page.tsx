"use client";

import React, { useEffect, useState } from "react";
import {
  Trees,
  Plus,
  Search,
  MapPin,
  Tractor,
  CheckCircle2,
  X,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function FarmsPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ownerId: "",
    location: "",
    village: "",
    taluk: "",
    district: "",
    totalTrees: 500,
    notes: "",
    status: "ACTIVE",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/farms?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) setFarms(json.data);
    } catch (err) {
      console.error(err);
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
          setFormData((prev) => ({ ...prev, ownerId: json.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [search]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to create farm.");
      } else {
        setShowAddModal(false);
        fetchFarms();
      }
    } catch (err) {
      setFormError("Server error saving farm.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Farms Management
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage coconut groves, palm tree census, and harvesting productivity across locations.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Farm</span>
        </button>
      </div>

      {/* Farms Grid / Table */}
      <div className="px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farm name, owner, village..."
              className="w-full bg-surface-container-low text-xs rounded-xl pl-9 pr-4 py-2.5 border border-outline-variant/20 focus:ring-2 focus:ring-primary/40 focus:outline-none placeholder:text-outline"
            />
          </div>
          <span className="text-xs text-outline font-medium">
            {farms.length} Active Farm Locations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-outline font-semibold">
                      {farm.farmCode}
                    </span>
                    <h3 className="font-headline font-bold text-lg text-on-surface leading-tight mt-0.5">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
                      <span>Owner:</span> {farm.ownerName}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      farm.status === "ACTIVE"
                        ? "bg-primary-fixed text-on-primary-fixed"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {farm.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-outline mb-4">
                  <MapPin className="w-3.5 h-3.5 text-outline" />
                  <span>
                    {farm.village}, {farm.district || ""}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-outline-variant/15 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline">Total Trees</span>
                    <p className="text-base font-headline font-bold text-on-surface">
                      {formatNumber(farm.totalTrees)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline">Booked</span>
                    <p className="text-base font-headline font-bold text-tertiary">
                      {formatNumber(farm.treesBooked)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline">Harvested</span>
                    <p className="text-base font-headline font-bold text-primary">
                      {formatNumber(farm.treesCompleted)}
                    </p>
                  </div>
                </div>

                {/* Yield Stats */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-outline">Completion Rate</span>
                    <span className="text-primary font-bold">{farm.completionRate}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, farm.completionRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>Yield: {formatNumber(farm.totalHarvestedCoconuts)} nuts</span>
                    <span className="font-semibold text-tertiary">
                      ~{farm.avgCoconutsPerTree} nuts/tree
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Farm */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Register New Farm</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFarm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Green Valley Farm #5"
                />
              </div>

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
                      {o.name} ({o.ownerCode} - {o.village})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Total Palm Trees *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalTrees}
                    onChange={(e) => setFormData({ ...formData, totalTrees: Number(e.target.value) })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Village / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Pollachi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Specific Location / Landmarks
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="e.g. Sector 4, Near Irrigation Canal"
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
                  {submitting ? "Saving..." : "Save Farm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
