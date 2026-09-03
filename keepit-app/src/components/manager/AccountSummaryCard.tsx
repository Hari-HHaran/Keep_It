"use client";

import React from "react";
import { AppState } from "@/lib/types";
import { ChevronRight, Eye } from "lucide-react";

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
  const currentMember = state.members.find((m) => m.role === "manager") || state.members[0];
  const totalVouchers = state.vouchers.reduce((sum, v) => sum + v.balance, 0);
  const dependents = state.members.filter(
  (member) => member.role === "dependent" );

  return (
    <div className="space-y-3.5">
      {/* Top Household Subtitle & Member Badges matching Mockup Screen 02 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold">
            Household
          </div>
          <div className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
            {state.householdName}
          </div>
        </div>
        

        {/* Overlapping member avatars from mockup */}
        <div className="flex items-center">
          <span className="w-7 h-7 rounded-full bg-[#0F4635] border-2 border-[#FBF6EC] flex items-center justify-center font-bold text-[11px] text-[#FBF6EC]">
            M
          </span>
          <span className="w-7 h-7 rounded-full bg-[#E8A02C] border-2 border-[#FBF6EC] -ml-2 flex items-center justify-center font-bold text-[11px] text-[#1B1815]">
            P
          </span>
          <span className="w-7 h-7 rounded-full bg-[#D7442A] border-2 border-[#FBF6EC] -ml-2 flex items-center justify-center font-bold text-[11px] text-[#FBF6EC]">
            K
          </span>
        </div>
      </div>

      {/* Deep Forest Green Hero Vessel Card (Exact Screen 02) */}
      <div className="bg-[#0F4635] rounded-[26px] p-5 sm:p-6 text-[#FBF6EC] shadow-md relative overflow-hidden">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8FB3A3] mb-1 font-semibold">
              Held right now
            </div>
            <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-[#FBF6EC]">
              S${state.totalHouseholdBalance.toLocaleString("en-SG", { minimumFractionDigits: 0 })}
              <span className="text-xl font-normal opacity-70">.40</span>
            </div>
            <div className="text-xs text-[#8FB3A3] mt-1.5 font-normal">
              +S$318 gathered this week
            </div>
          </div>

          {/* Animated Vessel Graphic from Mockup */}
          <div className="relative w-14 h-15 rounded-xl rounded-b-[24px] border-2 border-[#E8A02C] overflow-hidden shrink-0 bg-[#0A3227]">
            <div className="absolute left-0 right-0 bottom-0 h-[70%] bg-[#E8A02C]"></div>
            <div className="absolute -left-[30%] -right-[30%] bottom-[66%] h-3 bg-[#E8A02C] rounded-full animate-wave"></div>
          </div>
        </div>

        {/* Multi-segment Asset Ratio Bar */}
        <div className="flex gap-1 mt-4 rounded-full overflow-hidden h-2.5 bg-[#0A3227]">
          <div className="flex-[2940] bg-[#8FB3A3]"></div>
          <div className="flex-[612] bg-[#E8A02C]"></div>
          <div className="flex-[180] bg-[#F0D9A8]"></div>
          <div className="flex-[450] bg-[#D7442A]"></div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center mt-2.5 text-[10px] font-mono-custom">
          <span className="text-[#8FB3A3]">■ Bank 2,940</span>
          <span className="text-[#E8A02C]">■ PayNow 612</span>
          <span className="text-[#F0D9A8]">■ Cash 180</span>
          <span className="text-[#E58A72]">■ Vouchers {totalVouchers}</span>
        </div>
      </div>

      {/* Terracotta Leak Warning Banner (Exact Screen 02) */}
      <button
        onClick={onNavigateToSchemes}
        className="w-full bg-[#FAE3DD] hover:bg-[#F7D8D0] rounded-2xl p-3.5 flex items-center gap-3 text-left transition shadow-sm border border-[#D7442A]/20"
      >
        {/* Leaking Vessel Icon */}
        <div className="relative w-7 h-7 rounded-md rounded-b-xl border-2 border-[#D7442A] overflow-hidden shrink-0 bg-[#FAE3DD]">
          <div className="absolute left-0 right-0 bottom-0 h-[30%] bg-[#D7442A]"></div>
          <div className="absolute left-2.5 -top-1 w-1.5 h-1.5 rounded-full bg-[#D7442A] animate-drip"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm text-[#8F2A17]">
            S$240 is about to leak
          </div>
          <div className="text-xs text-[#B2543C] truncate">
            CDC Vouchers expire in 12 days
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[#D7442A] shrink-0" />
      </button>

      {/* "Who's holding what" Section matching Screen 02 */}
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
          {/* Ma */}
          <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#EDE4D6] rounded-2xl p-3 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-[#0F4635] text-[#FBF6EC] font-bold text-xs flex items-center justify-center shrink-0">
              M
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1B1815]">Ma · manager</div>
              <div className="text-[10px] text-[#8A8075]">2 accounts · PayNow</div>
            </div>
            <span className="font-display font-bold text-xs text-[#1B1815]">
              S$2,410.00
            </span>
          </div>

          {/* Pa */}
          <div className="flex items-center gap-3 bg-[#FFFDF8] border border-[#EDE4D6] rounded-2xl p-3 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-[#E8A02C] text-[#1B1815] font-bold text-xs flex items-center justify-center shrink-0">
              P
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1B1815]">Pa · manager</div>
              <div className="text-[10px] text-[#8A8075]">Platform worker · CPF tracked</div>
            </div>
            <span className="font-display font-bold text-xs text-[#1B1815]">
              S$1,743.90
            </span>
          </div>

          
          {/* Dynamic dependent cards */}
{dependents.map((dependent) => (
  <button
    key={dependent.id}
    type="button"
    onClick={() => {
      if (onViewDependent) {
        onViewDependent(dependent.id);
      }
    }}
    className="flex w-full items-center gap-3 rounded-2xl border border-[#EDE4D6] bg-[#FFFDF8] p-3 text-left shadow-xs transition hover:border-[#0F4635] hover:bg-[#F9F4EB] group"
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D7442A] text-xs font-bold text-[#FBF6EC] transition-transform group-hover:scale-105">
      {dependent.avatarText ||
        dependent.name.slice(0, 1)}
    </span>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1 text-xs font-bold text-[#1B1815] transition group-hover:text-[#0F4635]">
        <span>
          {dependent.name} · dependent
        </span>

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
        S$
        {(dependent.personalBalance || 0).toFixed(2)}
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
