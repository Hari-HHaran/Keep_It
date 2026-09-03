"use client";

import React, { useState } from "react";
import { AppState, BankAccount } from "@/lib/types";
import { 
  Building2, 
  Smartphone, 
  Receipt, 
  ChevronDown, 
  ChevronUp, 
  Camera, 
  Plus, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface LinkedAccountsListProps {
  state: AppState;
  onOpenAddTransaction: () => void;
  onOpenReceiptOcr: () => void;
  onSelectAccount?: (account: BankAccount) => void;
}

export const LinkedAccountsList: React.FC<LinkedAccountsListProps> = ({
  state,
  onOpenAddTransaction,
  onOpenReceiptOcr,
  onSelectAccount,
}) => {
  const [isBankExpanded, setIsBankExpanded] = useState(true);
  const [isWalletExpanded, setIsWalletExpanded] = useState(false);

  const bankAccounts = (state.bankAccounts || []).filter(
    (a) => a.accountType === "savings" || a.accountType === "current"
  );
  const walletAccounts = (state.bankAccounts || []).filter((a) => a.accountType === "wallet");

  const totalBankBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const totalWalletBalance = walletAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-bold text-sm text-[#1B1815]">
          Accounts & money sources
        </h2>
        <span className="text-[10px] font-mono-custom font-semibold text-[#0F4635] bg-[#DDE8E1] px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> SGFinDex Live
        </span>
      </div>

      <div className="space-y-2">
        {/* 1. Bank Accounts (Vertical Accordion) */}
        <div className="rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] overflow-hidden shadow-sm transition">
          <div className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-center font-mono-custom font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1B1815]">
                  {bankAccounts.length} bank account{bankAccounts.length !== 1 ? "s" : ""} linked
                </div>
                <div className="text-xs text-[#8A8075]">
                  {bankAccounts.map((b) => b.bankName.split(" ")[0]).join(", ") || "Singpass linked"} • synced live
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="font-display font-bold text-sm text-[#1B1815]">
                  S${totalBankBalance.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-[#8A8075]">Total Liquid</div>
              </div>
              <button 
                onClick={() => setIsBankExpanded(!isBankExpanded)}
                className="text-[#8A8075] p-1 rounded-full bg-[#F5F1E7] hover:bg-[#E0D4BF] transition"
              >
                {isBankExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Vertical Breakdown List */}
          {isBankExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-[#EDE4D6] space-y-2 bg-[#FBF6EC] animate-slideDown">
              <div className="text-[10px] font-mono-custom font-semibold uppercase tracking-wider text-[#8A8075] pt-1">
                Linked Bank Accounts • Tap to view ledger
              </div>

              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => onSelectAccount?.(account)}
                  className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#E0D4BF] hover:border-[#0F4635] cursor-pointer flex items-center justify-between shadow-xs transition group hover:bg-[#F9F4EB]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-[#DDE8E1] group-hover:bg-[#0F4635] group-hover:text-white flex items-center justify-center text-[10px] font-mono-custom font-bold text-[#0F4635] transition shrink-0">
                      {account.bankName.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1B1815] group-hover:text-[#0F4635] truncate">
                        {account.bankName}
                      </div>
                      <div className="text-[10px] text-[#8A8075]">
                        {account.accountNumber} • {account.lastSynced || "Synced"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-display font-bold text-xs text-[#1B1815]">
                        S${account.balance.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-[#0F4635] font-semibold flex items-center justify-end gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8A8075] group-hover:text-[#0F4635] group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))}

              <button
                onClick={() => alert("Simulating SGFinDex Open Banking OAuth link via Singpass.")}
                className="w-full py-2 rounded-xl text-xs font-semibold text-[#0F4635] bg-[#DDE8E1]/60 hover:bg-[#DDE8E1] border border-dashed border-[#0F4635]/30 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#0F4635]" />
                <span>Link Another Bank (SGFinDex)</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. PayNow & PayLah Wallet */}
        <div className="rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] overflow-hidden shadow-sm transition">
          <div className="w-full p-4 flex items-center justify-between text-left">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-[#F5EAD6] text-[#9A7420] flex items-center justify-center font-mono-custom font-bold text-xs shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1B1815]">
                  PayNow and PayLah activity
                </div>
                <div className="text-xs text-[#8A8075]">
                  Auto-categorised • Real-time pocket
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="font-display font-bold text-sm text-[#1B1815]">
                  S${totalWalletBalance.toLocaleString("en-SG", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-[#0F4635] flex items-center gap-0.5 justify-end font-semibold">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Live
                </div>
              </div>
              <button
                onClick={() => setIsWalletExpanded(!isWalletExpanded)}
                className="text-[#8A8075] p-1 rounded-full bg-[#F5F1E7] hover:bg-[#E0D4BF] transition"
              >
                {isWalletExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isWalletExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-[#EDE4D6] space-y-2 bg-[#FBF6EC] animate-slideDown">
              <div className="text-[10px] font-mono-custom font-semibold uppercase tracking-wider text-[#8A8075] pt-1">
                Linked Wallets • Tap to view ledger
              </div>

              {walletAccounts.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#8A8075]">
                  No wallet accounts linked.
                </div>
              ) : (
                walletAccounts.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => onSelectAccount?.(w)}
                    className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#E0D4BF] hover:border-[#0F4635] cursor-pointer flex items-center justify-between text-xs transition group hover:bg-[#F9F4EB]"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#F5EAD6] text-[#9A7420] group-hover:bg-[#0F4635] group-hover:text-white flex items-center justify-center font-mono-custom font-bold text-[10px] transition shrink-0">
                        PN
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1B1815] group-hover:text-[#0F4635] truncate">{w.bankName}</div>
                        <div className="text-[10px] text-[#8A8075]">{w.accountNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-display font-bold text-[#1B1815]">
                          S${w.balance.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[#0F4635] font-semibold">
                          View details ›
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A8075] group-hover:text-[#0F4635] group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. Cash Receipts & Camera OCR */}
        <div
          onClick={onOpenReceiptOcr}
          className="rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] hover:border-[#0F4635] p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition shadow-sm group"
        >
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#F5EAD6] text-[#9A7420] group-hover:bg-[#0F4635] group-hover:text-[#FBF6EC] flex items-center justify-center font-mono-custom font-bold text-xs shrink-0 transition">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#1B1815]">
                Cash receipts (OCR Scan)
              </div>
              <div className="text-xs text-[#8A8075]">
                Scan a receipt to log cash spend
              </div>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#0F4635] group-hover:bg-[#0A3227] text-[#FBF6EC] text-xs font-semibold shadow-sm transition flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
