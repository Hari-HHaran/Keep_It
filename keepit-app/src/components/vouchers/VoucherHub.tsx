"use client";

import React, { useState } from "react";
import { AppState, GovernmentVoucher, LocationMerchant } from "@/lib/types";
import { AddVoucherModal } from "./AddVoucherModal";
import { SpendPacingCard } from "./SpendPacingCard";
import { VoucherBreakdownModal } from "./VoucherBreakdownModal";
import { Plus, ChevronRight, Check, AlertCircle, Sparkles, Tag, Layers, ShoppingCart, Utensils, Zap } from "lucide-react";

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
  const [selectedSchemeBreakdown, setSelectedSchemeBreakdown] = useState<"cdc" | "climate" | "sg60" | null>(null);

  const regularVouchers = state.vouchers.filter((v) => v.category !== "Workfare_WIS");
  const totalUnspent = regularVouchers.reduce((s, v) => s + v.balance, 0);
  const isPlatform = state.currentPersonaId === "marcus_gig" || state.gigProfile !== undefined;

  const cdcVoucher = state.vouchers.find((v) => v.category === "CDC_Supermarket" || v.name.toLowerCase().includes("cdc"));
  const climateVoucher = state.vouchers.find((v) => v.category === "Climate" || v.name.toLowerCase().includes("climate"));
  const sg60Voucher = state.vouchers.find((v) => v.category === "SG60" || v.name.toLowerCase().includes("sg60"));

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
            S${totalUnspent.toLocaleString("en-SG", { minimumFractionDigits: 0 })} unspent across active government schemes
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

      {/* Flagged Ledger Spending Notice */}
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
              💡 Tip: Use CDC vouchers for supermarket and hawker meals
            </span>
            <button
              onClick={() => setSelectedSchemeBreakdown("cdc")}
              className="px-3 py-1 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-[11px] hover:bg-[#0A3227] transition cursor-pointer"
            >
              View Breakdown
            </button>
          </div>
        </div>
      )}

      {/* Main Voucher Cards Stack with Click-to-Breakdown (CDC, Climate, SG60) */}
      <div className="space-y-2.5">
        {/* 1. CDC Vouchers 2026 (Urgent Terracotta Border) */}
        <div 
          onClick={() => setSelectedSchemeBreakdown("cdc")}
          className="bg-[#FFFDF8] border-1.5 border-[#D7442A] rounded-[20px] p-4 relative overflow-hidden shadow-sm hover:bg-[#FDFBF7] cursor-pointer transition group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#D7442A] text-[#FBF6EC] font-mono-custom font-bold text-[10px] flex items-center justify-center">
                  C
                </span>
                <span className="text-sm font-bold text-[#1B1815] group-hover:text-[#D7442A] transition">
                  CDC Vouchers 2026
                </span>
                <span className="text-[9px] font-mono-custom font-bold text-[#0F4635] bg-[#DDE8E1] px-1.5 py-0.5 rounded">
                  2 Splits
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S${(cdcVoucher ? cdcVoucher.balance : 240).toLocaleString("en-SG")}<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                Supermarkets (S${((cdcVoucher ? cdcVoucher.balance : 240) / 2).toFixed(0)}) + Hawkers (S${((cdcVoucher ? cdcVoucher.balance : 240) / 2).toFixed(0)})
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="bg-[#D7442A] text-[#FBF6EC] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                12 days
              </span>
              <span className="text-[10px] text-[#D7442A] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Breakdown <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EDE4D6] flex items-center justify-between text-xs">
            <span className="text-[#8F2A17] font-medium text-[11px]">
              ≈ S$20/day to use it all. Two grocery runs does it.
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FAE3DD] text-[#8F2A17] font-bold text-[10px] hover:bg-[#F7D8D0] transition">
              Tap to view split ›
            </span>
          </div>
        </div>

        {/* 2. Climate Vouchers (Unified - No Split) */}
        <div 
          onClick={() => setSelectedSchemeBreakdown("climate")}
          className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[20px] p-4 shadow-sm hover:border-[#0F4635] cursor-pointer transition group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#0F4635] text-[#FBF6EC] font-mono-custom font-bold text-[10px] flex items-center justify-center">
                  E
                </span>
                <span className="text-sm font-bold text-[#1B1815] group-hover:text-[#0F4635] transition">
                  Climate Vouchers
                </span>
                <span className="text-[9px] font-mono-custom text-[#6B6259] bg-[#EDE4D6] px-1.5 py-0.5 rounded">
                  Unified Scheme
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S${(climateVoucher ? climateVoucher.balance : 300).toLocaleString("en-SG")}<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                Energy-efficient fridge, shower fittings, bulbs (No Category Split)
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="bg-[#DDE8E1] text-[#0F4635] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                4 months
              </span>
              <span className="text-[10px] text-[#0F4635] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Details <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* 3. SG60 Vouchers (Supermarket & Heartland Split) */}
        <div 
          onClick={() => setSelectedSchemeBreakdown("sg60")}
          className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[20px] p-4 shadow-sm hover:border-[#E8A02C] cursor-pointer transition group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-[#E8A02C] text-[#1B1815] font-mono-custom font-bold text-[9px] flex items-center justify-center">
                  60
                </span>
                <span className="text-sm font-bold text-[#1B1815] group-hover:text-[#9A7420] transition">
                  SG60 Vouchers
                </span>
                <span className="text-[9px] font-mono-custom font-bold text-[#9A7420] bg-[#F5EAD6] px-1.5 py-0.5 rounded">
                  2 Splits
                </span>
              </div>
              <div className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
                S${(sg60Voucher ? sg60Voucher.balance : 600).toLocaleString("en-SG")}<span className="text-sm font-normal text-[#8A8075]">.00 left</span>
              </div>
              <div className="text-[11px] text-[#8A8075] mt-1">
                Supermarkets (S${((sg60Voucher ? sg60Voucher.balance : 600) / 2).toFixed(0)}) + Heartland & Clinics (S${((sg60Voucher ? sg60Voucher.balance : 600) / 2).toFixed(0)})
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="bg-[#F5EAD6] text-[#9A7420] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                Dec 2026
              </span>
              <span className="text-[10px] text-[#9A7420] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Breakdown <ChevronRight className="w-3 h-3" />
              </span>
            </div>
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

      {/* Interactive Scheme Breakdown Modal */}
      <VoucherBreakdownModal
        isOpen={Boolean(selectedSchemeBreakdown)}
        onClose={() => setSelectedSchemeBreakdown(null)}
        voucherScheme={selectedSchemeBreakdown}
        vouchers={state.vouchers}
        onRedeem={onRedeemVoucher}
      />
    </div>
  );
};
