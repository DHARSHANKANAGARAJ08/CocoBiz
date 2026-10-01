"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trees,
  BookmarkCheck,
  Tractor,
  ShoppingCart,
  CreditCard,
  Sprout,
  Layers,
  Archive,
  ReceiptText,
  Scissors,
  Flame,
  BadgeDollarSign,
  UserCheck,
  Receipt,
  Tag,
  BarChart3,
  Settings,
  User,
  LogOut,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Farm Management",
    items: [
      { name: "Farm Owners", href: "/farm-owners", icon: Users },
      { name: "Farms", href: "/farms", icon: Trees },
      { name: "Tree Bookings", href: "/tree-bookings", icon: BookmarkCheck },
      { name: "Harvest Records", href: "/harvest-records", icon: Tractor },
    ],
  },
  {
    title: "Procurement",
    items: [
      { name: "Purchases", href: "/purchases", icon: ShoppingCart },
      { name: "Farmer Payments", href: "/farmer-payments", icon: CreditCard },
    ],
  },
  {
    title: "Inventory",
    items: [
      { name: "Coconut", href: "/inventory/coconut", icon: Sprout },
      { name: "Husk", href: "/inventory/husk", icon: Layers },
      { name: "Copra", href: "/inventory/copra", icon: Archive },
      { name: "Transactions", href: "/inventory/transactions", icon: ReceiptText },
    ],
  },
  {
    title: "Processing",
    items: [
      { name: "Husk Removal", href: "/processing/husk-removal", icon: Scissors },
      { name: "Copra Processing", href: "/processing/copra-processing", icon: Flame },
    ],
  },
  {
    title: "Sales & CRM",
    items: [
      { name: "Sales", href: "/sales", icon: BadgeDollarSign },
      { name: "Customers", href: "/customers", icon: UserCheck },
    ],
  },
  {
    title: "Workforce",
    items: [
      { name: "Workers", href: "/workers", icon: Users },
      { name: "Worker Salary", href: "/salary", icon: CreditCard },
    ],
  },
  {
    title: "Expenses",
    items: [
      { name: "Transport Expenses", href: "/expenses/transport", icon: Tractor },
      { name: "Other Expenses", href: "/expenses/other", icon: Receipt },
    ],
  },
  {
    title: "Pricing",
    items: [
      { name: "Daily Prices", href: "/prices", icon: Tag },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      { name: "Reports & P&L", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [
      { name: "System Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col pt-6 pb-6 overflow-y-auto border-r border-outline-variant/20 shadow-[0_4px_20px_rgba(46,50,48,0.02)]">
      {/* Brand Logo & Name */}
      <div className="px-6 mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-headline font-bold tracking-tight text-primary block leading-none">
              CocoBiz
            </span>
            <span className="text-[10px] font-body text-outline font-medium tracking-wide uppercase">
              Coconut ERP
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-4 text-sm">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-headline uppercase tracking-wider text-outline font-semibold">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-150 text-xs font-medium ${
                    isActive
                      ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mr-3 shrink-0 ${
                      isActive ? "text-on-primary-container" : "text-outline"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer Card */}
      <div className="mt-4 px-4 pt-4 border-t border-outline-variant/15">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">Admin</p>
              <p className="text-[10px] text-outline truncate">admin@cocobiz.com</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Logout"
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
