"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "May", sales: 480000, expenses: 210000 },
  { month: "Jun", sales: 540000, expenses: 240000 },
  { month: "Jul", sales: 450000, expenses: 190000 },
  { month: "Aug", sales: 610000, expenses: 270000 },
  { month: "Sep", sales: 645000, expenses: 295000 },
  { month: "Oct", sales: 685000, expenses: 210000 },
];

export default function SalesExpensesChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-64 w-full bg-surface-container/30 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6}>
          <XAxis
            dataKey="month"
            stroke="#74796e"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#c4c8bc", opacity: 0.3 }}
          />
          <YAxis
            stroke="#74796e"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v / 1000}k`}
          />
          <Tooltip
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#c4c8bc",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="sales" name="Sales" fill="#4a7c59" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#6b6358" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
