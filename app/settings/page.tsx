"use client";

import React, { useState } from "react";
import { Settings, Database, Building2, Bell, Shield, Info, Check, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("business");
  const [saved, setSaved] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "CocoBiz – Coconut Trading Co.",
    ownerName: "Admin",
    phone: "",
    address: "",
    gstin: "",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    fiscalYearStart: "April",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "system", label: "System", icon: Settings },
    { id: "database", label: "Database", icon: Database },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
          <Settings className="w-5 h-5 text-on-primary-container" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">System Settings</h1>
          <p className="text-sm text-outline">Configure CocoBiz system preferences and business information</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-2 space-y-1">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeSection === s.id
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Business Info */}
          {activeSection === "business" && (
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm">
              <h2 className="text-base font-headline font-bold text-on-surface mb-5">Business Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">Business Name</label>
                    <input
                      type="text"
                      value={businessInfo.businessName}
                      onChange={e => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">Owner Name</label>
                    <input
                      type="text"
                      value={businessInfo.ownerName}
                      onChange={e => setBusinessInfo({ ...businessInfo, ownerName: e.target.value })}
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">Phone</label>
                    <input
                      type="text"
                      value={businessInfo.phone}
                      onChange={e => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">GSTIN</label>
                    <input
                      type="text"
                      value={businessInfo.gstin}
                      onChange={e => setBusinessInfo({ ...businessInfo, gstin: e.target.value })}
                      placeholder="22AAAAA0000A1Z5"
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-outline uppercase tracking-wide">Business Address</label>
                  <textarea
                    value={businessInfo.address}
                    onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    rows={2}
                    placeholder="123 Market Road, Village, District, State - 600001"
                    className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">Currency</label>
                    <select
                      value={businessInfo.currency}
                      onChange={e => setBusinessInfo({ ...businessInfo, currency: e.target.value })}
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="INR">INR (₹) – Indian Rupee</option>
                      <option value="USD">USD ($) – US Dollar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-outline uppercase tracking-wide">Fiscal Year Start</label>
                    <select
                      value={businessInfo.fiscalYearStart}
                      onChange={e => setBusinessInfo({ ...businessInfo, fiscalYearStart: e.target.value })}
                      className="mt-1 w-full border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {["January", "April", "July", "October"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  >
                    {saved ? <Check className="w-4 h-4" /> : null}
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeSection === "system" && (
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-headline font-bold text-on-surface mb-5">System Preferences</h2>
              {[
                { title: "Inventory Auto-Deduction", desc: "Automatically deduct inventory when a sale is recorded", checked: true },
                { title: "Low Stock Alerts", desc: "Show warnings when inventory falls below threshold", checked: true },
                { title: "Farmer Payment Reminders", desc: "Highlight outstanding balances on the dashboard", checked: true },
                { title: "Auto-generate Codes", desc: "Automatically generate unique codes for all records", checked: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-outline-variant/20">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{pref.title}</p>
                    <p className="text-xs text-outline mt-0.5">{pref.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer ${pref.checked ? "bg-primary" : "bg-outline-variant"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.checked ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Database Info */}
          {activeSection === "database" && (
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-headline font-bold text-on-surface mb-5">Database & Storage</h2>
              <div className="p-4 rounded-xl bg-surface border border-outline-variant/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-outline">Database Engine</span>
                  <span className="font-semibold text-on-surface">SQLite (via Prisma ORM)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-outline">Database File</span>
                  <span className="font-mono text-on-surface text-xs">prisma/dev.db</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-outline">ORM Version</span>
                  <span className="font-semibold text-on-surface">Prisma 6.x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-outline">Environment</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">DEVELOPMENT</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">
                  <strong>Tip:</strong> To migrate to MySQL for production, update the <code className="font-mono bg-amber-100 px-1 rounded">DATABASE_URL</code> in your <code className="font-mono bg-amber-100 px-1 rounded">.env</code> file and run <code className="font-mono bg-amber-100 px-1 rounded">npx prisma db push</code>.
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <RefreshCw className="w-4 h-4" /> Sync Schema
              </button>
            </div>
          )}

          {/* About */}
          {activeSection === "about" && (
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center">
                  <span className="text-2xl font-headline font-black text-on-primary">🥥</span>
                </div>
                <div>
                  <h2 className="text-xl font-headline font-bold text-on-surface">CocoBiz</h2>
                  <p className="text-sm text-outline">Coconut Business Management System</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-semibold mt-1 inline-block">v1.0.0</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["Platform", "Next.js 15 + TypeScript"],
                  ["Database", "Prisma ORM + SQLite"],
                  ["UI Framework", "Tailwind CSS"],
                  ["Charts", "Recharts"],
                  ["Icons", "Lucide React"],
                  ["Validation", "Zod"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between p-3 rounded-xl bg-surface border border-outline-variant/15">
                    <span className="text-outline">{k}</span>
                    <span className="font-semibold text-on-surface">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl bg-primary-container/20 border border-primary/10 text-xs text-on-surface-variant">
                CocoBiz is a full-stack ERP designed specifically for coconut trading businesses — from farm procurement to processing, sales, and financial reporting.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
