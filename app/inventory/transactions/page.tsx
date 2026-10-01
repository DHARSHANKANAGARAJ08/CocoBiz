"use client";

import React, { useEffect, useState } from "react";
import { ReceiptText, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/utils";

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [productFilter, setProductFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/inventory/transactions?product=${productFilter}&transactionType=${typeFilter}`
      );
      const json = await res.json();
      if (json.success) setTransactions(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [productFilter, typeFilter]);

  return (
    <div className="flex flex-col w-full pb-16 bg-surface min-h-screen">
      <div className="px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Master Inventory Ledger
            </h1>
            <p className="text-sm text-on-surface-variant">
              Immutable transaction log of all inbound harvests, purchases, processing conversions, and customer dispatches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-outline-variant/20"
          >
            <option value="ALL">All Products</option>
            <option value="COCONUT">Coconut</option>
            <option value="HUSK">Husk</option>
            <option value="COPRA">Copra</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-outline-variant/20"
          >
            <option value="ALL">All Event Types</option>
            <option value="OPENING_STOCK">Opening Stock</option>
            <option value="HARVEST">Harvest</option>
            <option value="PURCHASE">Purchase</option>
            <option value="SALE">Sale</option>
            <option value="HUSK_REMOVAL">Husk Removal</option>
            <option value="COPRA_PROCESSING">Copra Processing</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      <div className="px-8">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(46,50,48,0.04)] border border-outline-variant/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-headline tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">Date & Time</th>
                  <th className="py-4 px-6 font-semibold">Product</th>
                  <th className="py-4 px-6 font-semibold">Event Type</th>
                  <th className="py-4 px-6 font-semibold text-center">Direction</th>
                  <th className="py-4 px-6 font-semibold text-right">Quantity</th>
                  <th className="py-4 px-6 font-semibold">Reference Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-outline">{formatDate(tx.date)}</td>
                    <td className="py-4 px-6 font-bold text-xs text-on-surface">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] ${
                          tx.product === "COCONUT"
                            ? "bg-primary/10 text-primary"
                            : tx.product === "HUSK"
                            ? "bg-tertiary-container/30 text-on-tertiary-container"
                            : "bg-secondary-container text-on-secondary-container"
                        }`}
                      >
                        {tx.product}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-mono">{tx.transactionType}</td>
                    <td className="py-4 px-6 text-center">
                      {tx.quantity > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <ArrowUpRight className="w-4 h-4" /> Inflow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                          <ArrowDownRight className="w-4 h-4" /> Outflow
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-bold text-xs ${
                        tx.quantity > 0 ? "text-primary" : "text-error"
                      }`}
                    >
                      {tx.quantity > 0 ? `+${formatNumber(tx.quantity)}` : formatNumber(tx.quantity)}
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {tx.notes || tx.referenceType || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
