"use client";

import React, { useState } from "react";
import { AppState, BankAccount, Transaction } from "@/lib/types";
import { Building2, Smartphone, Receipt, ArrowUpRight, ArrowDownLeft, X, Filter } from "lucide-react";

interface RecentTransactionsProps {
  state: AppState;
  onOpenReceiptOcr: () => void;
  onOpenAddTransaction: () => void;
  activeAccountFilter?: string;
  onSelectAccountFilter?: (acc: string) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  state,
  onOpenReceiptOcr,
  onOpenAddTransaction,
  activeAccountFilter: propActiveFilter,
  onSelectAccountFilter: propOnSelectFilter,
}) => {
  const [localAccountFilter, setLocalAccountFilter] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const activeAccount = propActiveFilter !== undefined ? propActiveFilter : localAccountFilter;
  const setAccountFilter = (acc: string) => {
    setLocalAccountFilter(acc);
    propOnSelectFilter?.(acc);
  };

  const accounts = state.bankAccounts || [];
  const accountOptions = [
    "All",
    ...accounts.map((a) => a.bankName),
    "Cash Receipt",
  ];

  // Filter by Account
  let transactions = state.transactions || [];
  if (activeAccount !== "All") {
    transactions = transactions.filter(
      (tx) =>
        (tx.source && tx.source.toLowerCase().includes(activeAccount.toLowerCase())) ||
        activeAccount.toLowerCase().includes(tx.source?.toLowerCase() || "")
    );
  }

  // Filter by Category
  if (filterCategory !== "All") {
    transactions = transactions.filter((tx) => tx.category === filterCategory);
  }

  // Stats for the active account
  const selectedBankAccount = accounts.find((a) => a.bankName === activeAccount);
  const accountInflows = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((s, tx) => s + tx.amount, 0);
  const accountOutflows = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-bold text-sm text-[#1B1815]">
          {activeAccount === "All" ? "Ledger activity" : `${activeAccount} Ledger`}
        </h2>
        <button
          onClick={onOpenAddTransaction}
          className="text-xs font-semibold text-[#0F4635] hover:underline"
        >
          + Add Entry
        </button>
      </div>

      {/* Account Selector Tabs (Only shown if 2 or more accounts exist) */}
      {accounts.length > 1 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {accountOptions.map((acc) => {
            const isSelected = activeAccount === acc;
            return (
              <button
                key={acc}
                onClick={() => setAccountFilter(acc)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0F4635] text-[#FBF6EC] shadow-xs"
                    : "bg-[#FFFDF8] text-[#6B6259] border border-[#E0D4BF] hover:bg-[#F5F1E7]"
                }`}
              >
                <span>{acc}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Single Account Stat Card if an individual account is active */}
      {activeAccount !== "All" && selectedBankAccount && (
        <div className="p-4 rounded-2xl bg-[#0F4635] text-[#FBF6EC] shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#8FB3A3] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#E8A02C]" />
              <span>{selectedBankAccount.bankName}</span>
              <span className="text-[10px] text-[#8FB3A3] font-mono-custom">({selectedBankAccount.accountNumber})</span>
            </div>
            <button
              onClick={() => setAccountFilter("All")}
              className="px-2.5 py-1 rounded-full bg-[#1B3A30] hover:bg-[#254F42] text-[10px] font-bold text-[#E8A02C] flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" /> Show All
            </button>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-[#8FB3A3]/20">
            <div>
              <div className="text-[10px] font-mono-custom uppercase tracking-wider text-[#8FB3A3]">
                Account Balance
              </div>
              <div className="text-2xl font-black font-display">
                S${selectedBankAccount.balance.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex gap-4 text-right text-xs">
              <div>
                <div className="text-[9px] text-[#8FB3A3]">Inflows</div>
                <div className="font-bold text-[#8FB3A3]">+S${accountInflows.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#8FB3A3]">Outflows</div>
                <div className="font-bold text-[#E58A72]">−S${accountOutflows.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs no-scrollbar">
        {["All", "Pocket Money", "Groceries", "Hawker & Dining", "Utilities", "Gig Payout", "Other"].map((cat) => (
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
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8A8075]">
            No transactions found for {activeAccount}.
          </div>
        ) : (
          transactions.map((tx) => {
            const isExpense = tx.amount < 0;
            const isGig = tx.category === "Gig Payout";
            const isPocketMoney = tx.category === "Pocket Money";

            return (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl hover:bg-[#F5F1E7] transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
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
                      <span className="font-semibold text-[#0F4635]">{tx.source}</span> • {tx.category} • {tx.date}
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
          })
        )}
      </div>
    </div>
  );
};
