"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  User as UserIcon,
  ChevronRight,
  Sprout,
  Users,
  BookmarkCheck,
  Tractor,
  BadgeDollarSign,
  Receipt,
  X,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageTitle = () => {
    if (!pathname || pathname === "/dashboard") return "Dashboard";
    const segment = pathname.split("/")[1] || "";
    return segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-8 border-b border-outline-variant/15">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
          <Sprout className="w-3.5 h-3.5 text-primary" />
          <span>CocoBiz</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="font-semibold text-on-surface">{getPageTitle()}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search owners, bookings, sales..."
            className="bg-surface-container-low text-on-surface text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 w-64 border border-outline-variant/30 placeholder:text-outline transition-all"
          />
        </div>

        {/* Quick Add Menu */}
        <div className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="bg-primary text-on-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-headline uppercase tracking-wider text-outline font-semibold border-b border-outline-variant/10">
                Quick Actions
              </div>
              <div className="space-y-0.5 mt-1">
                <Link
                  href="/farm-owners?action=new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <Users className="w-4 h-4 text-primary" />
                  <span>New Farm Owner</span>
                </Link>
                <Link
                  href="/tree-bookings?action=new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <BookmarkCheck className="w-4 h-4 text-tertiary" />
                  <span>New Tree Booking</span>
                </Link>
                <Link
                  href="/harvest-records?action=new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <Tractor className="w-4 h-4 text-primary" />
                  <span>Record Harvest</span>
                </Link>
                <Link
                  href="/sales?action=new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <BadgeDollarSign className="w-4 h-4 text-primary" />
                  <span>Record Sale</span>
                </Link>
                <Link
                  href="/farmer-payments?action=new"
                  onClick={() => setQuickAddOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <Receipt className="w-4 h-4 text-error" />
                  <span>Farmer Payment</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-xl hover:bg-surface-container"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse"></span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm font-semibold text-xs cursor-pointer">
          <UserIcon className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
