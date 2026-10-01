"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trees,
  Tractor,
  Sprout,
  Layers,
  Archive,
  CreditCard,
  BadgeDollarSign,
  Receipt,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import SalesExpensesChart from "@/components/dashboard/SalesExpensesChart";
import ProfitTrendChart from "@/components/dashboard/ProfitTrendChart";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    totalOwners: 5,
    totalFarms: 6,
    totalTreesBooked: 2300,
    treesCompleted: 1320,
    treesRemaining: 980,
    treeCompletionRate: 57.4,
    coconutStock: 24580,
    huskStock: 8420,
    copraStock: 2850,
    farmerOutstanding: 248500,
    todayPurchases: 0,
    todaySales: 0,
    todayExpenses: 0,
    todayProfit: 0,
    monthlySales: 685000,
    monthlyExpenses: 210000,
    monthlyProfit: 142500,
  };

  const timeline = data?.timeline || [
    {
      id: "1",
      type: "HARVEST",
      title: "Harvest Record",
      description: "Harvested 1,200 raw coconuts from Sector B",
      reference: "Green Valley Farm #4",
      amount: "1,200 Units",
      status: "Completed",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      type: "PAYMENT",
      title: "Farmer Payment",
      description: "Settled installment for Ramesh Kumar",
      reference: "OWN-1089",
      amount: "₹25,000",
      status: "Processed",
      date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      type: "SALE",
      title: "Market Sale",
      description: "Bulk copra shipment dispatched to oil mill",
      reference: "INV-2024-002",
      amount: "₹1,45,000",
      status: "Paid",
      date: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "4",
      type: "PROCESSING",
      title: "Copra Processing",
      description: "Batch drying completed in Kiln #2",
      reference: "CP-2024-001",
      amount: "500 kg",
      status: "Completed",
      date: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  return (
    <div className="flex flex-col w-full p-8 space-y-8 bg-surface text-on-surface">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.06)] relative overflow-hidden border border-outline-variant/15">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-full tracking-wider uppercase">
              Live Operations
            </span>
            <span className="text-xs text-outline font-body flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Updated live
            </span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-on-surface-variant text-sm">
            Overview of your coconut business performance, inventory reserves, and financial health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-surface-container text-on-surface text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium border border-outline-variant/20 shadow-sm cursor-pointer"
          >
            <option value="month">This Month (October)</option>
            <option value="last-month">Last Month (September)</option>
            <option value="q3">Quarterly (Q3)</option>
            <option value="ytd">Year to Date (2024)</option>
          </select>

          <Link
            href="/harvest-records"
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(46,50,48,0.06)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Trees Booked */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Tree Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
              <Trees className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatNumber(metrics.totalTreesBooked)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Total Booked Trees</p>
            </div>
            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              +12% vs last mo
            </span>
          </div>
        </div>

        {/* Card 2: Trees Completed */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Harvest Progress
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Tractor className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatNumber(metrics.treesCompleted)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {metrics.treeCompletionRate}% Completion Rate
              </p>
            </div>
            <div className="w-20 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.treeCompletionRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Coconut Stock */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Coconut Inventory
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
              <Sprout className="w-5 h-5 text-tertiary" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatNumber(metrics.coconutStock)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Raw Nuts in Stock</p>
            </div>
            <span className="text-xs text-tertiary font-bold bg-tertiary/10 px-2 py-1 rounded-lg">
              Optimal
            </span>
          </div>
        </div>

        {/* Card 4: Husk Stock */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Husk Stock
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatNumber(metrics.huskStock)}{" "}
                <span className="text-sm font-normal text-outline">kg</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Ready for Fiber Processing</p>
            </div>
          </div>
        </div>

        {/* Card 5: Copra Stock */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Copra Stock
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-on-tertiary-container">
              <Archive className="w-5 h-5 text-tertiary" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatNumber(metrics.copraStock)}{" "}
                <span className="text-sm font-normal text-outline">kg</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Dried Kernel Reserve</p>
            </div>
          </div>
        </div>

        {/* Card 6: Farmer Outstanding */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Farmer Outstanding
            </span>
            <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-on-error-container">
              <CreditCard className="w-5 h-5 text-error" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-error">
                {formatCurrency(metrics.farmerOutstanding)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Pending Settlements</p>
            </div>
            <Link
              href="/farmer-payments"
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear Dues
            </Link>
          </div>
        </div>

        {/* Card 7: Total Sales */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Total Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatCurrency(metrics.monthlySales)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Gross Revenue</p>
            </div>
            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              +18.4%
            </span>
          </div>
        </div>

        {/* Card 8: Expenses */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Operating Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-on-surface">
                {formatCurrency(metrics.monthlyExpenses)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Labor & Transport</p>
            </div>
          </div>
        </div>

        {/* Card 9: Net Profit */}
        <div className="bg-surface-container-low p-6 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-headline uppercase tracking-wider text-outline font-semibold">
              Net Profit
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-headline font-bold text-primary">
                {formatCurrency(metrics.monthlyProfit)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">After All Deductions</p>
            </div>
            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              Margin 20.8%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Expenses Chart Card */}
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Sales vs Expenses
              </h2>
              <p className="text-xs text-on-surface-variant">
                Comparative financial performance over the past 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-on-surface">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-on-surface">Expenses</span>
              </div>
            </div>
          </div>
          <SalesExpensesChart />
        </div>

        {/* Tree Booking Progress Ring Card */}
        <div className="bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Tree Booking Status
            </h2>
            <p className="text-xs text-on-surface-variant">
              Completion ratio for seasonal harvesting
            </p>
          </div>
          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.8"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${Math.min(100, metrics.treeCompletionRate)}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.8"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-headline font-bold text-on-surface">
                  {metrics.treeCompletionRate}%
                </span>
                <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">
                  Complete
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/15">
            <div>
              <span className="text-xs text-outline font-medium">Completed</span>
              <p className="text-base font-headline font-bold text-on-surface">
                {formatNumber(metrics.treesCompleted)} Trees
              </p>
            </div>
            <div>
              <span className="text-xs text-outline font-medium">Remaining</span>
              <p className="text-base font-headline font-bold text-on-surface">
                {formatNumber(metrics.treesRemaining)} Trees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Breakdown */}
        <div className="bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Inventory Breakdown
              </h2>
              <p className="text-xs text-on-surface-variant">
                Current valuation and stock distribution
              </p>
            </div>
            <span className="text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
              Total Stock: {formatNumber(metrics.coconutStock + metrics.huskStock + metrics.copraStock)} Units
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface">Coconuts (Raw Units)</span>
                <span className="text-outline">{formatNumber(metrics.coconutStock)} (68.5%)</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "68.5%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface">Husk Stock (kg)</span>
                <span className="text-outline">{formatNumber(metrics.huskStock)} kg (23.5%)</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: "23.5%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface">Copra Stock (kg)</span>
                <span className="text-outline">{formatNumber(metrics.copraStock)} kg (8.0%)</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Profit Trend */}
        <div className="bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">
                Monthly Profit Trend
              </h2>
              <p className="text-xs text-on-surface-variant">
                Net earnings trajectory over 6 months
              </p>
            </div>
            <span className="text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg">
              +14.2% Growth
            </span>
          </div>
          <ProfitTrendChart />
        </div>
      </div>

      {/* Live Recent Activity Timeline Table */}
      <div className="bg-surface-container-low p-8 rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Recent Activity Timeline
            </h2>
            <p className="text-xs text-on-surface-variant">
              Latest harvests, farmer payments, processing runs, and sales transactions
            </p>
          </div>
          <Link
            href="/inventory/transactions"
            className="text-xs font-bold text-primary hover:underline"
          >
            View All Activity
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-headline uppercase tracking-wider text-outline border-b border-outline-variant/15 pb-3">
                <th className="pb-3 font-semibold">Activity Type</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Reference / Party</th>
                <th className="pb-3 font-semibold">Amount / Qty</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {timeline.map((act: any) => (
                <tr key={act.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        act.type === "HARVEST"
                          ? "bg-primary-container text-on-primary-container"
                          : act.type === "PAYMENT"
                          ? "bg-tertiary-container/30 text-on-tertiary-container"
                          : act.type === "SALE"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {act.type === "HARVEST" && <Tractor className="w-4 h-4" />}
                      {act.type === "PAYMENT" && <CreditCard className="w-4 h-4 text-tertiary" />}
                      {act.type === "SALE" && <BadgeDollarSign className="w-4 h-4" />}
                      {act.type === "PROCESSING" && <Archive className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-on-surface text-xs">{act.title}</span>
                  </td>
                  <td className="py-4 text-on-surface-variant text-xs">{act.description}</td>
                  <td className="py-4 text-outline text-xs">{act.reference}</td>
                  <td className="py-4 font-semibold text-on-surface text-xs">{act.amount}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {act.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-outline text-xs">
                    {new Date(act.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
