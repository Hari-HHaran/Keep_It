"use client";

import React, { useState } from "react";
import { AppState, GovernmentVoucher, LocationMerchant } from "@/lib/types";
import { AddVoucherModal } from "./AddVoucherModal";
import { SpendPacingCard } from "./SpendPacingCard";
import { Plus, ChevronRight, Check, AlertCircle, Sparkles, Tag } from "lucide-react";

interface VoucherHubProps {
  state: AppState;
  onRedeemVoucher: (voucherId: string, amount: number) => void;
  onAddVoucher: (voucher: GovernmentVoucher) => void;
  onSelectLocation: (location: LocationMerchant | null) => void;
}

export const VoucherHub: React.FC<VoucherHubProps> = ({
  state,
  onRedeemVoucher,
  onAddVoucher,
  onSelectLocation,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const regularVouchers = state.vouchers.filter((v) => v.category !== "Workfare_WIS");
  const isPlatform = state.currentPersonaId === "marcus_gig" || state.gigProfile !== undefined;

  // Check for any opportunity cost nudges generated from the ledger
  const flaggedNudges = state.nudges.filter((n) => n.type === "opportunity_cost");

  return (
    <div id="schemes" className="space-y-4 animate-fadeIn font-sans">
      {/* Header matching Screen 04 of Mockup */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
            Money already yours
          </h2>
          <p className="text-xs text-[#8A8075]">
            S$1,140 unspent across active government schemes
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0F4635] text-[#FBF6EC] hover:bg-[#0A3227] transition flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Claim Link</span>
        </button>
      </div>

      {/* Flagged Ledger Spending Notice (Your Excellent Suggestion!) */}
      {flaggedNudges.length > 0 && (
        <div className="bg-[#FFFDF8] border-1.5 border-[#D7442A] rounded-[22px] p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D7442A] animate-pulse"></span>
              <span className="text-[11px] font-mono-custom uppercase tracking-wider text-[#D7442A] font-bold">
                Flagged from Your Recent Ledger
              </span>
            </div>
            <span className="text-[10px] bg-[#FAE3DD] text-[#8F2A17] font-semibold px-2 py-0.5 rounded-full">
              Eligible for Voucher
            </span>
          </div>

          <p className="text-xs text-[#6B6259] leading-relaxed">
            {flaggedNudges[0]?.message || "Recent grocery and dining purchases were paid with cash/bank debit, even though you have unspent CDC vouchers expiring soon."}
          </p>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-[#8F2A17] font-medium">
              💡 Tip: Show CDC voucher barcode at supermarket checkout
            </span>
            <button
              onClick={() => onRedeemVoucher("vouch-cdc-supermarket", 10)}
              className="px-3 py-1 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-[11px] hover:bg-[#0A3227] transition cursor-pointer"
            >
              Use S$10 Now
            </button>
          </div>
        </div>
      )}

      {/* Main Voucher Cards Stack (Exact Screen 04) */}
      <div className="space-y-2.5">
        {/* 1. CDC Vouchers 2026 (Urgent Terracotta Border) */}
        <div className="bg-[#FFFDF8] border-1.5 border-[#D7442A] rounded-[20px] p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#D7442A] text-[#FBF6EC] font-mono-custom font-bold text-[10px] flex items-center justify-center">
                  C
                </span>
                <span className="text-sm font-bold text-[#1B1815]">
                  CDC Vouchers 2026
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S$240<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                of S$500 • heartland shops + supermarkets
              </div>
            </div>

            <span className="bg-[#D7442A] text-[#FBF6EC] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              12 days
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EDE4D6] flex items-center justify-between text-xs">
            <span className="text-[#8F2A17] font-medium text-[11px]">
              ≈ S$20/day to use it all. Two grocery runs does it.
            </span>
            <button
              onClick={() => onRedeemVoucher("vouch-cdc-supermarket", 10)}
              className="px-2.5 py-1 rounded-lg bg-[#FAE3DD] text-[#8F2A17] font-bold text-[10px] hover:bg-[#F7D8D0] transition cursor-pointer"
            >
              Use S$10
            </button>
          </div>
        </div>

        {/* 2. Climate Vouchers */}
        <div className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[20px] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#0F4635] text-[#FBF6EC] font-mono-custom font-bold text-[10px] flex items-center justify-center">
                  E
                </span>
                <span className="text-sm font-bold text-[#1B1815]">
                  Climate Vouchers
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S$300<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                Energy-efficient fridge, shower fittings, bulbs
              </div>
            </div>

            <span className="bg-[#DDE8E1] text-[#0F4635] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              4 months
            </span>
          </div>
        </div>

        {/* 3. SG60 Vouchers */}
        <div className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[20px] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#E8A02C] text-[#1B1815] font-mono-custom font-bold text-[9px] flex items-center justify-center">
                  60
                </span>
                <span className="text-sm font-bold text-[#1B1815]">
                  SG60 Vouchers
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S$600<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                2 adults in household • untouched
              </div>
            </div>

            <span className="bg-[#F5EAD6] text-[#9A7420] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              Dec 2026
            </span>
          </div>
        </div>
      </div>

      {/* 4. Workfare Income Supplement (WIS) Card for Platform Workers (Screen 04) */}
      {isPlatform && (
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold px-1">
            Paid to you, not claimed by you
          </div>

          <div className="bg-[#0F4635] rounded-[22px] p-4 text-[#FBF6EC] shadow-md space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono-custom uppercase tracking-wider text-[#8FB3A3]">
                  Workfare Income Supplement
                </div>
                <div className="font-display font-bold text-2xl text-[#FBF6EC]">
                  S$186.50<span className="text-xs font-normal text-[#8FB3A3]">/mo</span>
                </div>
              </div>
              <span className="bg-[#E8A02C] text-[#1B1815] font-semibold text-[11px] px-2.5 py-1 rounded-full shrink-0">
                Aug landed ✓
              </span>
            </div>

            {/* Split */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#1B3A30] rounded-xl p-2.5">
                <div className="text-[9px] font-mono-custom text-[#8FB3A3]">CASH</div>
                <div className="font-display font-bold text-base text-[#FBF6EC]">S$74.60</div>
              </div>
              <div className="bg-[#1B3A30] rounded-xl p-2.5">
                <div className="text-[9px] font-mono-custom text-[#8FB3A3]">MEDISAVE</div>
                <div className="font-display font-bold text-base text-[#FBF6EC]">S$111.90</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1B3A30] flex items-center justify-between text-xs">
              <span className="text-[#E58A72] text-[11px]">
                3 months missing this year • S$372
              </span>
              <span className="text-[#E8A02C] font-semibold text-[11px] flex items-center">
                Check months ›
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spend Pacing & Forfeiture Calculator */}
      <SpendPacingCard vouchers={regularVouchers} />

      {/* Claim Modal */}
      <AddVoucherModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddVoucher={onAddVoucher}
      />
    </div>
  );
};
