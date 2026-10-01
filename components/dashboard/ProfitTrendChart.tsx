"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "May", profit: 95000 },
  { month: "Jun", profit: 110000 },
  { month: "Jul", profit: 105000 },
  { month: "Aug", profit: 125000 },
  { month: "Sep", profit: 135000 },
  { month: "Oct", profit: 142500 },
];

export default function ProfitTrendChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-40 w-full bg-surface-container/30 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4a7c59" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            stroke="#74796e"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#c4c8bc", opacity: 0.3 }}
          />
          <YAxis
            stroke="#74796e"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v / 1000}k`}
          />
          <Tooltip
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Net Profit"]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#c4c8bc",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#4a7c59"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#profitGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
