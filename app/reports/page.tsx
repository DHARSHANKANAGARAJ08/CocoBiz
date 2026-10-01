"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Sprout, Layers, Archive, Users, Truck, Receipt,
  FileText, Download, Calendar, ChevronRight
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const PERIODS = [
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
  { label: "Custom", value: "custom" },
];

const REPORT_TABS = [
  { id: "pnl", label: "P&L Summary", icon: BarChart3 },
  { id: "sales", label: "Sales", icon: DollarSign },
  { id: "purchases", label: "Purchases", icon: Sprout },
  { id: "farmer-balance", label: "Farmer Balance", icon: Users },
  { id: "farm-trees", label: "Farm Yield", icon: Sprout },
  { id: "salaries", label: "Salary Ledger", icon: Users },
  { id: "transport", label: "Transport", icon: Truck },
  { id: "other-expenses", label: "Other Expenses", icon: Receipt },
];

const PIE_COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#E91E63", "#9C27B0", "#00BCD4"];

function getDateRange(period: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start.toISOString().split("T")[0], endDate: now.toISOString().split("T")[0] };
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    return { startDate: start.toISOString().split("T")[0], endDate: now.toISOString().split("T")[0] };
  }
  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: start.toISOString().split("T")[0], endDate: now.toISOString().split("T")[0] };
  }
  return {};
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("pnl");
  const [period, setPeriod] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setData(null);
    try {
      let params = new URLSearchParams({ type: activeTab });
      const range = period === "custom"
        ? { startDate: customStart, endDate: customEnd }
        : getDateRange(period);
      if (range.startDate) params.set("startDate", range.startDate);
      if (range.endDate) params.set("endDate", range.endDate);
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [activeTab, period]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

  const pnl = data?.summary;

  const expenseBreakdown = pnl ? [
    { name: "Procurement", value: pnl.cogs },
    { name: "Salaries", value: pnl.workerSalary },
    { name: "Transport", value: pnl.transportCost },
    { name: "Processing", value: pnl.processingCost },
    { name: "Other", value: pnl.otherCost },
  ].filter(e => e.value > 0) : [];

  const revenueBreakdown = pnl ? [
    { name: "Coconut Sales", value: pnl.coconutSales },
    { name: "Husk Sales", value: pnl.huskSales },
    { name: "Copra Sales", value: pnl.copraSales },
  ].filter(e => e.value > 0) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Reports & Analytics</h1>
            <p className="text-sm text-outline">Profit & Loss, Sales, Inventory and operational insights</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <Download className="w-4 h-4" /> Print / Export
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p.value
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {p.label}
          </button>
        ))}
        {period === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="border border-outline-variant/40 rounded-xl px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <span className="text-outline text-sm">to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="border border-outline-variant/40 rounded-xl px-3 py-2 text-sm bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={fetchReport} className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold">Apply</button>
          </div>
        )}
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 p-1 bg-surface-container rounded-2xl">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="text-center p-16 text-outline text-sm">Generating report…</div>
      )}

      {/* P&L Summary Report */}
      {!loading && activeTab === "pnl" && pnl && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: pnl.revenue, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
              { label: "Cost of Goods", value: pnl.cogs, icon: TrendingDown, color: "text-red-500 bg-red-50" },
              { label: "Gross Profit", value: pnl.grossProfit, icon: DollarSign, color: "text-blue-600 bg-blue-50" },
              { label: "Net Profit", value: pnl.netProfit, icon: BarChart3, color: pnl.netProfit >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-surface-container border border-outline-variant/20 p-4 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-outline font-medium uppercase tracking-wide">{m.label}</p>
                <p className={`text-2xl font-headline font-bold mt-1 ${m.value < 0 ? "text-error" : "text-on-surface"}`}>
                  {formatCurrency(m.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Operating Expenses Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-on-surface mb-4">Revenue Breakdown</h3>
              {revenueBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {revenueBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-outline text-center py-8">No sales data for this period.</p>
              )}
            </div>
            <div className="rounded-2xl bg-surface-container border border-outline-variant/20 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-on-surface mb-4">Expense Distribution</h3>
              {expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={expenseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0ebe4" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Bar dataKey="value" fill="#6A9A72" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-outline text-center py-8">No expense data for this period.</p>
              )}
            </div>
          </div>

          {/* Detailed P&L Ledger */}
          <div className="rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/15">
              <h3 className="text-sm font-semibold text-on-surface">Profit & Loss Statement</h3>
            </div>
            <div className="p-4 space-y-1 text-sm">
              <PnLRow label="Total Revenue" value={pnl.revenue} highlight />
              <PnLRow label="  Coconut Sales" value={pnl.coconutSales} indent />
              <PnLRow label="  Husk Sales" value={pnl.huskSales} indent />
              <PnLRow label="  Copra Sales" value={pnl.copraSales} indent />
              <div className="border-t border-outline-variant/15 my-2" />
              <PnLRow label="Cost of Goods Sold (Procurement)" value={pnl.cogs} negative />
              <PnLRow label="GROSS PROFIT" value={pnl.grossProfit} bold />
              <div className="border-t border-outline-variant/15 my-2" />
              <PnLRow label="Operating Expenses" value={pnl.operatingExpenses} negative />
              <PnLRow label="  Worker Salaries" value={pnl.workerSalary} indent negative />
              <PnLRow label="  Transport Costs" value={pnl.transportCost} indent negative />
              <PnLRow label="  Processing Costs" value={pnl.processingCost} indent negative />
              <PnLRow label="  Other Expenses" value={pnl.otherCost} indent negative />
              <div className="border-t-2 border-outline-variant/30 my-2" />
              <PnLRow label="NET PROFIT" value={pnl.netProfit} bold highlight profit={pnl.netProfit >= 0} />
              <div className="mt-4 p-3 rounded-xl bg-surface-container-high/60 text-xs text-outline">
                Net Margin: <strong className={pnl.netMargin >= 0 ? "text-emerald-600" : "text-red-600"}>{pnl.netMargin}%</strong>
                &nbsp;|&nbsp; {pnl.breakdowns?.salesCount || data?.breakdowns?.salesCount || 0} Sales Transactions
                &nbsp;|&nbsp; {data?.breakdowns?.purchasesCount || 0} Procurement Transactions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generic List Reports */}
      {!loading && activeTab !== "pnl" && data && (
        <GenericReport type={activeTab} data={Array.isArray(data) ? data : []} formatDate={formatDate} />
      )}

      {!loading && !data && (
        <div className="text-center p-16 text-outline text-sm">No data available for the selected period.</div>
      )}
    </div>
  );
}

function PnLRow({ label, value, indent, negative, bold, highlight, profit }: any) {
  return (
    <div className={`flex justify-between py-1.5 px-3 rounded-lg ${highlight ? (profit !== undefined ? (profit ? "bg-emerald-50" : "bg-red-50") : "bg-primary-container/20") : ""}`}>
      <span className={`${indent ? "pl-4 text-on-surface-variant" : ""} ${bold ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
      <span className={`font-${bold ? "bold" : "medium"} ${negative ? "text-error" : profit !== undefined ? (profit ? "text-emerald-600" : "text-error") : "text-on-surface"}`}>
        {negative ? "– " : ""}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function GenericReport({ type, data, formatDate }: { type: string; data: any[]; formatDate: (d: string) => string }) {
  if (data.length === 0) {
    return <div className="text-center p-16 text-outline text-sm">No data found for this period.</div>;
  }

  const renderRow = (item: any) => {
    switch (type) {
      case "sales":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.invoiceNumber || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.saleDate)}</td>
            <td className="px-4 py-3 text-on-surface">{item.customer?.name || "—"}</td>
            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{item.product}</span></td>
            <td className="px-4 py-3 text-on-surface-variant text-right">{formatNumber(item.quantity)}</td>
            <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatCurrency(item.totalAmount)}</td>
          </>
        );
      case "purchases":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.purchaseCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.purchaseDate)}</td>
            <td className="px-4 py-3 text-on-surface">{item.owner?.name || "—"}</td>
            <td className="px-4 py-3 text-on-surface">{item.farm?.name || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-right">{formatNumber(item.quantity)}</td>
            <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(item.totalAmount)}</td>
          </>
        );
      case "farmer-balance":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.ownerCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface font-medium">{item.name}</td>
            <td className="px-4 py-3 text-on-surface-variant">{item.village}</td>
            <td className="px-4 py-3 text-right">{formatCurrency(item.totalPurchases)}</td>
            <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(item.totalPaid)}</td>
            <td className="px-4 py-3 text-right font-bold text-error">{formatCurrency(item.outstanding)}</td>
          </>
        );
      case "farm-trees":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.farmCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface font-medium">{item.name}</td>
            <td className="px-4 py-3 text-on-surface-variant">{item.ownerName}</td>
            <td className="px-4 py-3 text-right">{formatNumber(item.totalTrees)}</td>
            <td className="px-4 py-3 text-right">{formatNumber(item.treesBooked)}</td>
            <td className="px-4 py-3 text-right text-emerald-600">{formatNumber(item.treesCompleted)}</td>
            <td className="px-4 py-3 text-right font-semibold">{formatNumber(item.coconutsCollected)}</td>
            <td className="px-4 py-3 text-right text-outline">{item.averageYield?.toFixed(1)}</td>
          </>
        );
      case "salaries":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.paymentCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.paymentDate)}</td>
            <td className="px-4 py-3 text-on-surface">{item.worker?.name || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant">{item.salaryPeriod}</td>
            <td className="px-4 py-3 text-on-surface-variant">{item.paymentMethod?.replace(/_/g, " ")}</td>
            <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(item.amount)}</td>
          </>
        );
      case "transport":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.expenseCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.date)}</td>
            <td className="px-4 py-3 text-on-surface">{item.vehicleNumber}</td>
            <td className="px-4 py-3 text-on-surface-variant">{item.fromLocation} → {item.toLocation}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{item.purpose}</td>
            <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(item.amount)}</td>
          </>
        );
      case "other-expenses":
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono text-outline">{item.expenseCode || "—"}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.date)}</td>
            <td className="px-4 py-3"><span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{item.category?.replace(/_/g, " ")}</span></td>
            <td className="px-4 py-3 text-on-surface">{item.description}</td>
            <td className="px-4 py-3 text-on-surface-variant text-xs">{item.paymentMethod?.replace(/_/g, " ")}</td>
            <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(item.amount)}</td>
          </>
        );
      default:
        return <td className="px-4 py-3" colSpan={6}>{JSON.stringify(item)}</td>;
    }
  };

  const headers: Record<string, string[]> = {
    sales: ["Invoice", "Date", "Customer", "Product", "Qty", "Amount"],
    purchases: ["Code", "Date", "Owner", "Farm", "Qty", "Amount"],
    "farmer-balance": ["Code", "Name", "Village", "Total Purchased", "Total Paid", "Outstanding"],
    "farm-trees": ["Code", "Farm", "Owner", "Total Trees", "Booked", "Completed", "Coconuts", "Avg Yield"],
    salaries: ["Code", "Date", "Worker", "Period", "Method", "Amount"],
    transport: ["Code", "Date", "Vehicle", "Route", "Purpose", "Amount"],
    "other-expenses": ["Code", "Date", "Category", "Description", "Method", "Amount"],
  };

  const totalAmount = data.reduce((s, i) => s + (i.totalAmount || i.amount || i.outstanding || 0), 0);

  return (
    <div className="rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-outline-variant/15 flex items-center justify-between">
        <p className="text-sm font-semibold text-on-surface">{data.length} records</p>
        {totalAmount > 0 && <p className="text-sm font-semibold text-primary">Total: {formatCurrency(totalAmount)}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low">
              {(headers[type] || []).map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-outline uppercase tracking-wide last:text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {data.map((item, i) => (
              <tr key={item.id || i} className="hover:bg-surface-container-high/50 transition-colors">
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
