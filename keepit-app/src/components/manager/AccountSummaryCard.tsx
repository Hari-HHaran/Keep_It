"use client";

import React from "react";
import { AppState } from "@/lib/types";
import { ChevronRight, Eye, ShieldCheck, UserCheck } from "lucide-react";

interface AccountSummaryCardProps {
  state: AppState;
  onNavigateToSchemes?: () => void;
  onViewDependent?: (dependentId: string) => void;
}

export const AccountSummaryCard: React.FC<AccountSummaryCardProps> = ({
  state,
  onNavigateToSchemes,
  onViewDependent,
}) => {
  const bankAccounts = state.bankAccounts || [];
  const bankTotal = bankAccounts
    .filter((a) => a.accountType === "savings" || a.accountType === "current")
    .reduce((s, a) => s + a.balance, 0);

  const payNowTotal = bankAccounts
    .filter((a) => a.accountType === "wallet")
    .reduce((s, a) => s + a.balance, 0);

  const cashTotal = Math.max(0, (state.totalHouseholdBalance || 0) - bankTotal - payNowTotal);
  const totalVouchers = (state.vouchers || []).reduce((sum, v) => sum + v.balance, 0);

  // Total household liquid assets
  const totalLiquid = bankTotal + payNowTotal + cashTotal;
  const [intPart, decPart] = (state.totalHouseholdBalance || totalLiquid).toFixed(2).split(".");

  const managers = (state.members || []).filter(
    (m) => m.role === "manager" || m.role === "co_manager"
  );
  const dependents = (state.members || []).filter(
    (m) => m.role === "dependent"
  );

  // Expiring vouchers calculation
  const expiringVoucher = (state.vouchers || []).find((v) => v.daysRemaining !== undefined && v.daysRemaining <= 30 && v.balance > 0);

  // Asset Bar Proportions
  const safeTotal = Math.max(1, bankTotal + payNowTotal + cashTotal + totalVouchers);
  const bankFlex = Math.max(1, Math.round((bankTotal / safeTotal) * 100));
  const payNowFlex = Math.max(payNowTotal > 0 ? 1 : 0, Math.round((payNowTotal / safeTotal) * 100));
  const cashFlex = Math.max(cashTotal > 0 ? 1 : 0, Math.round((cashTotal / safeTotal) * 100));
  const voucherFlex = Math.max(totalVouchers > 0 ? 1 : 0, Math.round((totalVouchers / safeTotal) * 100));

  return (
    <div className="space-y-3.5">
      {/* Top Household Subtitle & Member Badges */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold">
            Household
          </div>
          <div className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
            {state.householdName || "My Household"}
          </div>
        </div>

        {/* Dynamic Overlapping Member Avatars */}
        <div className="flex items-center">
          {(state.members || []).slice(0, 4).map((member, idx) => (
            <span
              key={member.id}
              title={member.name}
              className={`w-7 h-7 rounded-full border-2 border-[#FBF6EC] flex items-center justify-center font-bold text-[11px] ${
                idx > 0 ? "-ml-2" : ""
              } ${
                member.role === "dependent"
                  ? "bg-[#D7442A] text-[#FBF6EC]"
                  : idx === 1
                  ? "bg-[#E8A02C] text-[#1B1815]"
                  : "bg-[#0F4635] text-[#FBF6EC]"
              }`}
            >
              {member.avatarText || member.name.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Deep Forest Green Hero Vessel Card */}
      <div className="bg-[#0F4635] rounded-[26px] p-5 sm:p-6 text-[#FBF6EC] shadow-md relative overflow-hidden">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8FB3A3] mb-1 font-semibold">
              Held right now
            </div>
            <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[#FBF6EC]">
              S${Number(intPart).toLocaleString("en-SG")}
              <span className="text-xl font-normal opacity-70">.{decPart}</span>
            </div>
            <div className="text-xs text-[#8FB3A3] mt-1.5 font-normal">
              {bankAccounts.length} account{bankAccounts.length !== 1 ? "s" : ""} linked • SGFinDex synced
            </div>
          </div>

          {/* Animated Vessel Graphic */}
          <div className="relative w-14 h-15 rounded-xl rounded-b-[24px] border-2 border-[#E8A02C] overflow-hidden shrink-0 bg-[#0A3227]">
            <div className="absolute left-0 right-0 bottom-0 h-[70%] bg-[#E8A02C]"></div>
            <div className="absolute -left-[30%] -right-[30%] bottom-[66%] h-3 bg-[#E8A02C] rounded-full animate-wave"></div>
          </div>
        </div>

        {/* Dynamic Multi-segment Asset Ratio Bar */}
        <div className="flex gap-1 mt-4 rounded-full overflow-hidden h-2.5 bg-[#0A3227]">
          {bankFlex > 0 && <div style={{ flex: bankFlex }} className="bg-[#8FB3A3]" title="Bank"></div>}
          {payNowFlex > 0 && <div style={{ flex: payNowFlex }} className="bg-[#E8A02C]" title="PayNow"></div>}
          {cashFlex > 0 && <div style={{ flex: cashFlex }} className="bg-[#F0D9A8]" title="Cash"></div>}
          {voucherFlex > 0 && <div style={{ flex: voucherFlex }} className="bg-[#D7442A]" title="Vouchers"></div>}
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap justify-between items-center mt-2.5 text-[10px] font-mono-custom gap-1">
          <span className="text-[#8FB3A3]">■ Bank {bankTotal.toLocaleString("en-SG", { minimumFractionDigits: 0 })}</span>
          <span className="text-[#E8A02C]">■ PayNow {payNowTotal.toLocaleString("en-SG", { minimumFractionDigits: 0 })}</span>
          {cashTotal > 0 && <span className="text-[#F0D9A8]">■ Cash {cashTotal.toLocaleString("en-SG", { minimumFractionDigits: 0 })}</span>}
          <span className="text-[#E58A72]">■ Vouchers {totalVouchers.toLocaleString("en-SG", { minimumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Terracotta Leak Warning Banner (Shown if vouchers are near expiry or opportunity cost exists) */}
      {expiringVoucher && (
        <button
          onClick={onNavigateToSchemes}
          className="w-full bg-[#FAE3DD] hover:bg-[#F7D8D0] rounded-2xl p-3.5 flex items-center gap-3 text-left transition shadow-sm border border-[#D7442A]/20"
        >
          <div className="relative w-7 h-7 rounded-md rounded-b-xl border-2 border-[#D7442A] overflow-hidden shrink-0 bg-[#FAE3DD]">
            <div className="absolute left-0 right-0 bottom-0 h-[30%] bg-[#D7442A]"></div>
            <div className="absolute left-2.5 -top-1 w-1.5 h-1.5 rounded-full bg-[#D7442A] animate-drip"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-sm text-[#8F2A17]">
              S${expiringVoucher.balance.toFixed(2)} is about to leak
            </div>
            <div className="text-xs text-[#B2543C] truncate">
              {expiringVoucher.name} expire in {expiringVoucher.daysRemaining} days
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[#D7442A] shrink-0" />
        </button>
      )}

      {/* "Who's holding what" Section — 100% Dynamic based on state.members */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="font-display font-bold text-sm text-[#1B1815]">
            Who's holding what
          </span>
          <span className="text-[11px] text-[#8A8075]">
            Live household balances
          </span>
        </div>

        <div className="space-y-2">
          {/* Dynamic Managers */}
          {managers.map((manager, idx) => {
            const memberAccounts = bankAccounts; // Total managed liquid assets
            return (
              <div
                key={manager.id}
                className="flex items-center gap-3 bg-[#FFFDF8] border border-[#EDE4D6] rounded-2xl p-3 shadow-xs"
              >
                <span className={`w-7 h-7 rounded-full ${
                  idx === 0 ? "bg-[#0F4635] text-[#FBF6EC]" : "bg-[#E8A02C] text-[#1B1815]"
                } font-bold text-xs flex items-center justify-center shrink-0`}>
                  {manager.avatarText || manager.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1B1815]">
                    {manager.name} · {manager.role}
                  </div>
                  <div className="text-[10px] text-[#8A8075] truncate">
                    {memberAccounts.length} account{memberAccounts.length !== 1 ? "s" : ""} • {manager.workerType === "platform_worker" ? "Platform worker (FEDA/CPF)" : "Singpass verified"}
                  </div>
                </div>
                <span className="font-display font-bold text-xs text-[#1B1815]">
                  S${(state.totalHouseholdBalance || totalLiquid).toLocaleString("en-SG", { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}

          {/* Dynamic Dependents */}
          {dependents.map((dependent) => (
            <button
              key={dependent.id}
              type="button"
              onClick={() => onViewDependent?.(dependent.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#EDE4D6] bg-[#FFFDF8] p-3 text-left shadow-xs transition hover:border-[#0F4635] hover:bg-[#F9F4EB] group"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D7442A] text-xs font-bold text-[#FBF6EC] transition-transform group-hover:scale-105">
                {dependent.avatarText || dependent.name.slice(0, 1).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs font-bold text-[#1B1815] transition group-hover:text-[#0F4635]">
                  <span>{dependent.name} · dependent</span>
                  <Eye className="h-3 w-3 text-[#0F4635]" />
                </div>

                <div className="truncate text-[10px] text-[#8A8075]">
                  {dependent.savingsGoal
                    ? `Saving for ${dependent.savingsGoal.title}`
                    : "No active savings goal"}{" "}
                  • Tap to open dashboard
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span className="font-display text-xs font-bold text-[#0F4635]">
                  S${(dependent.personalBalance || 0).toFixed(2)}
                </span>
                <ChevronRight className="h-4 w-4 text-[#8A8075] transition group-hover:translate-x-0.5 group-hover:text-[#0F4635]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
