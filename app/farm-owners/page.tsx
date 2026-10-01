"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Trees,
  Sprout,
  CreditCard,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  Building,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function FarmOwnersPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewOwner, setViewOwner] = useState<any | null>(null);
  const [editOwner, setEditOwner] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    village: "",
    taluk: "",
    district: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    notes: "",
    status: "ACTIVE",
  });
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/farm-owners?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setOwners(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [search, statusFilter]);

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/farm-owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to create farm owner.");
      } else {
        setShowAddModal(false);
        setFormData({
          name: "",
          phone: "",
          alternatePhone: "",
          village: "",
          taluk: "",
          district: "",
          bankName: "",
          accountNumber: "",
          ifsc: "",
          notes: "",
          status: "ACTIVE",
        });
        fetchOwners();
      }
    } catch (err: any) {
      setFormError("Server error while saving farm owner.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOwner) return;
    setFormError("");
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/farm-owners/${editOwner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editOwner),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || "Failed to update owner.");
      } else {
        setEditOwner(null);
        fetchOwners();
      }
    } catch (err) {
      setFormError("Server error updating owner.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteOwner = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete farm owner "${name}"?`)) return;
    try {
      const res = await fetch(`/api/farm-owners/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchOwners();
      } else {
        alert(json.error || "Could not delete farm owner.");
      }
    } catch (err) {
      alert("Error deleting owner.");
    }
  };

  // Metrics summary
  const totalOwners = owners.length;
  const totalTreesBooked = owners.reduce((s, o) => s + (o.treesBooked || 0), 0);
  const totalFarms = owners.reduce((s, o) => s + (o.farmsCount || 0), 0);
  const totalBalanceOwed = owners.reduce((s, o) => s + (o.outstandingBalance || 0), 0);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      {/* Top Action & Filter Bar */}
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Farm Owners Management
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage landowners, track booked trees, and monitor outstanding financial balances.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-xl text-sm font-semibold pr-8 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer border border-outline-variant/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Farm Owner</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Total Owners
            </span>
            <span className="p-2 rounded-xl bg-primary-container text-on-primary-container">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-headline font-bold text-on-surface mb-1">
              {formatNumber(totalOwners)}
            </div>
            <div className="text-xs text-primary font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Registered suppliers
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Trees Booked
            </span>
            <span className="p-2 rounded-xl bg-tertiary-container text-on-tertiary-container">
              <Trees className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-headline font-bold text-on-surface mb-1">
              {formatNumber(totalTreesBooked)}
            </div>
            <div className="text-xs text-tertiary font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active harvest contracts
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Active Farms
            </span>
            <span className="p-2 rounded-xl bg-primary-container text-on-primary-container">
              <Trees className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-headline font-bold text-on-surface mb-1">
              {formatNumber(totalFarms)}
            </div>
            <div className="text-xs text-on-surface-variant">Across regional villages</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Total Balance Owed
            </span>
            <span className="p-2 rounded-xl bg-error-container text-on-error-container">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-headline font-bold text-error mb-1">
              {formatCurrency(totalBalanceOwed)}
            </div>
            <div className="text-xs text-error font-medium">Pending farmer settlements</div>
          </div>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          {/* Table Header/Controls */}
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex items-center w-full md:w-80">
                <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, village..."
                  className="bg-surface-container-low text-on-surface text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 w-full border border-outline-variant/20 placeholder:text-outline"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-xs text-outline font-medium">
                Showing {owners.length} registered owners
              </span>
            </div>
          </div>

          {/* Table Component */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Owner Name & Avatar</th>
                  <th className="py-4 px-6 font-semibold">Phone</th>
                  <th className="py-4 px-6 font-semibold">Village</th>
                  <th className="py-4 px-6 font-semibold text-center">Farms Count</th>
                  <th className="py-4 px-6 font-semibold text-center">Trees Booked</th>
                  <th className="py-4 px-6 font-semibold text-center">Trees Completed</th>
                  <th className="py-4 px-6 font-semibold text-right">Outstanding Balance (₹)</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {owners.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-outline text-sm">
                      No farm owners found. Click &quot;Add Farm Owner&quot; to register your first farmer.
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => {
                    const initials = owner.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <tr key={owner.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-headline font-bold flex items-center justify-center text-xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface text-xs">{owner.name}</div>
                              <div className="text-[10px] text-outline font-mono">
                                ID: {owner.ownerCode || owner.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant font-mono text-xs">
                          {owner.phone}
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-xs">{owner.village}</td>
                        <td className="py-4 px-6 text-center font-semibold text-on-surface text-xs">
                          {owner.farmsCount}
                        </td>
                        <td className="py-4 px-6 text-center text-on-surface text-xs">
                          {formatNumber(owner.treesBooked)}
                        </td>
                        <td className="py-4 px-6 text-center text-primary font-semibold text-xs">
                          {formatNumber(owner.treesCompleted)}
                        </td>
                        <td
                          className={`py-4 px-6 text-right font-semibold text-xs ${
                            owner.outstandingBalance > 0 ? "text-error" : "text-on-surface-variant"
                          }`}
                        >
                          {formatCurrency(owner.outstandingBalance)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              owner.status === "ACTIVE"
                                ? "bg-primary-fixed text-on-primary-fixed"
                                : "bg-surface-variant text-on-surface-variant"
                            }`}
                          >
                            {owner.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewOwner(owner)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditOwner(owner)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                              title="Edit Owner"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOwner(owner.id, owner.name)}
                              className="p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add Farm Owner */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Add New Farm Owner</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOwner} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Ramesh Kumar"
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
                    placeholder="+91 98450 12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Village *
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
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Taluk</label>
                  <input
                    type="text"
                    value={formData.taluk}
                    onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Pollachi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="e.g. Coimbatore"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="State Bank of India"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="A/C No."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  placeholder="Additional palm variety or contract terms..."
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
                  disabled={formSubmitting}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? "Saving..." : "Save Farm Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Owner Profile */}
      {viewOwner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-headline font-bold flex items-center justify-center text-sm">
                  {viewOwner.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">{viewOwner.name}</h3>
                  <p className="text-xs text-outline">{viewOwner.ownerCode || viewOwner.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewOwner(null)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <span className="text-[10px] uppercase font-semibold text-outline">Total Supplies</span>
                  <p className="text-xl font-headline font-bold text-on-surface mt-1">
                    {formatCurrency(viewOwner.totalPurchases || 0)}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <span className="text-[10px] uppercase font-semibold text-outline">Total Paid</span>
                  <p className="text-xl font-headline font-bold text-primary mt-1">
                    {formatCurrency(viewOwner.totalPaid || 0)}
                  </p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15">
                  <span className="text-[10px] uppercase font-semibold text-outline">
                    Outstanding Balance
                  </span>
                  <p className="text-xl font-headline font-bold text-error mt-1">
                    {formatCurrency(viewOwner.outstandingBalance || 0)}
                  </p>
                </div>
              </div>

              {/* Contact & Location Details */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/15 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Phone:</span>
                  <span>{viewOwner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Location:</span>
                  <span>
                    {viewOwner.village}, {viewOwner.taluk || ""}, {viewOwner.district || ""}
                  </span>
                </div>
                {viewOwner.bankName && (
                  <div className="flex items-center gap-2 text-on-surface">
                    <Building className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Bank:</span>
                    <span>
                      {viewOwner.bankName} - A/C: {viewOwner.accountNumber} (IFSC: {viewOwner.ifsc})
                    </span>
                  </div>
                )}
                {viewOwner.notes && (
                  <p className="text-outline pt-2 border-t border-outline-variant/15">
                    {viewOwner.notes}
                  </p>
                )}
              </div>

              {/* Tree Status */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase">Tree Booking Ratio</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {formatNumber(viewOwner.treesCompleted || 0)} of{" "}
                    {formatNumber(viewOwner.treesBooked || 0)} trees completed
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-lg">
                  {viewOwner.farmsCount || 0} Registered Farms
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-container flex justify-end gap-3 border-t border-outline-variant/15">
              <button
                onClick={() => setViewOwner(null)}
                className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Farm Owner */}
      {editOwner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-surface-container flex items-center justify-between border-b border-outline-variant/15">
              <h3 className="font-headline font-bold text-lg text-on-surface">Edit Farm Owner</h3>
              <button
                onClick={() => setEditOwner(null)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateOwner} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editOwner.name}
                    onChange={(e) => setEditOwner({ ...editOwner, name: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editOwner.phone}
                    onChange={(e) => setEditOwner({ ...editOwner, phone: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={editOwner.village}
                    onChange={(e) => setEditOwner({ ...editOwner, village: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Status</label>
                  <select
                    value={editOwner.status}
                    onChange={(e) => setEditOwner({ ...editOwner, status: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Taluk</label>
                  <input
                    type="text"
                    value={editOwner.taluk || ""}
                    onChange={(e) => setEditOwner({ ...editOwner, taluk: e.target.value })}
                    className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editOwner.notes || ""}
                  onChange={(e) => setEditOwner({ ...editOwner, notes: e.target.value })}
                  className="w-full bg-surface-container-low text-xs rounded-xl p-2.5 border border-outline-variant/30 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setEditOwner(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? "Updating..." : "Update Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
