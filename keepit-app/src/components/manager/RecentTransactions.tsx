"use client";

import React, { useState } from "react";
import { AppState, Transaction } from "@/lib/types";

interface RecentTransactionsProps {
  state: AppState;
  onOpenReceiptOcr: () => void;
  onOpenAddTransaction: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  state,
  onOpenReceiptOcr,
  onOpenAddTransaction,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const filteredTransactions = filterCategory === "All"
    ? state.transactions
    : state.transactions.filter((tx) => tx.category === filterCategory);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-bold text-sm text-[#1B1815]">
          Ledger activity
        </h2>
        <button
          onClick={onOpenAddTransaction}
          className="text-xs font-semibold text-[#0F4635] hover:underline"
        >
          + Add Entry
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
        {["All", "Pocket Money", "Groceries", "Hawker & Dining", "Utilities"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition ${
              filterCategory === cat
                ? "bg-[#0F4635] text-[#FBF6EC]"
                : "bg-[#FFFDF8] text-[#6B6259] border border-[#E0D4BF] hover:bg-[#F5F1E7]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transaction List styled to match Screen 02 & 09 */}
      <div className="rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] p-2 space-y-1 shadow-sm">
        {filteredTransactions.map((tx) => {
          const isExpense = tx.amount < 0;
          const isGig = tx.category === "Gig Payout";
          const isPocketMoney = tx.category === "Pocket Money";

          return (
            <div
              key={tx.id}
              className="p-2.5 rounded-xl hover:bg-[#F5F1E7] transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Category Chip Badge matching Mockup */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-custom font-bold text-[10px] shrink-0 ${
                    isGig || isPocketMoney
                      ? "bg-[#DDE8E1] text-[#0F4635]"
                      : tx.source === "Cash Receipt"
                      ? "bg-[#F5EAD6] text-[#9A7420]"
                      : "bg-[#EDE4D6] text-[#584F45]"
                  }`}
                >
                  {isGig ? "GIG" : isPocketMoney ? "PN" : tx.source === "Cash Receipt" ? "$" : "BANK"}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1B1815] truncate">
                    {tx.description}
                  </div>
                  <div className="text-[10px] text-[#8A8075] truncate">
                    {tx.source} • {tx.category} • {tx.date}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`font-display font-bold text-xs ${
                    isExpense ? "text-[#1B1815]" : "text-[#0F4635]"
                  }`}
                >
                  {isExpense ? "−" : "+"}S${Math.abs(tx.amount).toFixed(2)}
                </div>
                {tx.opportunityCostNote && (
                  <div className="text-[9px] text-[#D7442A] font-semibold">
                    CDC eligible
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
