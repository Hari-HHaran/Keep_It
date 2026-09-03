"use client";

import React, { useState } from "react";
import { AppState, BankAccount, Transaction } from "@/lib/types";
import { 
  Building2, 
  Smartphone, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  RefreshCw, 
  ShieldCheck,
  Calendar,
  CreditCard,
  FileText
} from "lucide-react";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | null;
  state: AppState;
  onOpenAddTransaction: () => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  state,
  onOpenAddTransaction,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen || !account) return null;

  const isWallet = account.accountType === "wallet";

  // Filter transactions specifically for this account
  const accountTransactions = (state.transactions || []).filter((tx) => {
    if (tx.accountId && tx.accountId === account.id) return true;
    if (tx.source) {
      const src = tx.source.toLowerCase();
      const bName = account.bankName.toLowerCase();
      if (src.includes(bName) || bName.includes(src)) return true;
      if (isWallet && (src.includes("paynow") || src.includes("paylah") || src.includes("wallet"))) return true;
    }
    return false;
  });

  const filteredTxs = filterCategory === "All"
    ? accountTransactions
    : accountTransactions.filter((tx) => tx.category === filterCategory);

  const totalInflows = accountTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((s, tx) => s + tx.amount, 0);

  const totalOutflows = accountTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fadeIn backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#FFFDF8] rounded-t-[32px] sm:rounded-[32px] border border-[#E0D4BF] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#0F4635] text-[#FBF6EC] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8A02C] text-[#1B1815] flex items-center justify-center font-bold font-display shadow-sm">
                {isWallet ? <Smartphone className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base text-[#FBF6EC] leading-tight">
                    {account.bankName}
                  </h3>
                  <span className="text-[9px] font-mono-custom uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#DDE8E1] text-[#0F4635]">
                    {isWallet ? "Wallet" : "SGFinDex"}
                  </span>
                </div>
                <div className="text-xs text-[#8FB3A3] mt-0.5 flex items-center gap-1.5 font-mono-custom">
                  <span>{account.accountNumber}</span>
                  <span>•</span>
                  <span>Synced {account.lastSynced || "Just now"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF6EC] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Balance Banner */}
          <div className="mt-4 pt-4 border-t border-[#8FB3A3]/20 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-mono-custom uppercase tracking-wider text-[#8FB3A3]">
                Available Liquid Balance
              </div>
              <div className="font-display font-black text-3xl tracking-tight text-[#FBF6EC]">
                S${account.balance.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FBF6EC] transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#E8A02C]" : ""}`} />
              <span>{isSyncing ? "Syncing…" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBF6EC] border-b border-[#EDE4D6]">
          <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0F4635] uppercase tracking-wider">
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#0F4635]" /> Total Inflows
            </div>
            <div className="font-display font-bold text-base text-[#0F4635] mt-1">
              +S${totalInflows.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B2543C] uppercase tracking-wider">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D7442A]" /> Total Outflows
            </div>
            <div className="font-display font-bold text-base text-[#D7442A] mt-1">
              −S${totalOutflows.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Account Ledger Activity */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-[#1B1815]">
              Account Transactions ({accountTransactions.length})
            </h4>
            <button
              onClick={() => {
                onClose();
                onOpenAddTransaction();
              }}
              className="text-xs font-semibold text-[#0F4635] flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Transaction
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs no-scrollbar">
            {["All", "Groceries", "Hawker & Dining", "Pocket Money", "Utilities", "Other"].map((cat) => (
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

          {/* Transactions List */}
          <div className="space-y-1.5">
            {filteredTxs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-dashed border-[#D6C9B4] text-center text-xs text-[#8A8075] space-y-2">
                <p>No transactions logged specifically for {account.bankName} yet.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddTransaction();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log first entry
                </button>
              </div>
            ) : (
              filteredTxs.map((tx) => {
                const isExpense = tx.amount < 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] flex items-center justify-between gap-3 shadow-xs hover:bg-[#F9F4EB] transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono-custom font-bold text-[10px] shrink-0 ${
                        isExpense ? "bg-[#EDE4D6] text-[#584F45]" : "bg-[#DDE8E1] text-[#0F4635]"
                      }`}>
                        {isExpense ? "−" : "+"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1B1815] truncate">
                          {tx.description}
                        </div>
                        <div className="text-[10px] text-[#8A8075] truncate">
                          {tx.category} • {tx.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-display font-bold text-xs ${
                        isExpense ? "text-[#1B1815]" : "text-[#0F4635]"
                      }`}>
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

        {/* Footer */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#EDE4D6] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#0F4635] font-semibold">
            <ShieldCheck className="w-4 h-4" /> Singpass SGFinDex Live Feed
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs hover:bg-[#0A3227] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
