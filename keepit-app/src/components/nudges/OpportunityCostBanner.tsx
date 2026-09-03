"use client";

import React from "react";
import { ContextualNudge } from "@/lib/types";
import { X, ArrowRight } from "lucide-react";

interface OpportunityCostBannerProps {
  nudge: ContextualNudge | null;
  onDismiss: () => void;
  onNavigateToSchemes?: () => void;
}

export const OpportunityCostBanner: React.FC<OpportunityCostBannerProps> = ({
  nudge,
  onDismiss,
  onNavigateToSchemes,
}) => {
  if (!nudge) return null;

  return (
    <div className="w-full mb-3 animate-slideDown">
      {/* Exact Screen 06 Nudge Card Styling */}
      <div className="bg-[#FFFDF8] border-2 border-[#D7442A] rounded-[24px] p-4 sm:p-5 shadow-lg relative">
        <div className="flex gap-3.5 items-start mb-3">
          {/* Leaking Vessel Graphic */}
          <div className="relative w-11 h-12 rounded-lg rounded-b-[18px] border-2 border-[#D7442A] overflow-hidden shrink-0 bg-[#FFFDF8]">
            <div className="absolute left-0 right-0 bottom-0 h-[34%] bg-[#D7442A]"></div>
            <div className="absolute -left-[30%] -right-[30%] bottom-[30%] h-2 bg-[#D7442A] rounded-full"></div>
            <div className="absolute left-4.5 -top-1 w-1.5 h-1.5 rounded-full bg-[#D7442A] animate-drip"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono-custom uppercase tracking-wider text-[#D7442A] font-bold mb-0.5">
              You just paid cash
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#1B1815] leading-snug">
              That expense was already paid for.
            </h3>
          </div>

          <button
            onClick={onDismiss}
            className="text-[#8A8075] hover:text-[#1B1815] p-1 rounded-lg transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terracotta Callout Box */}
        <div className="bg-[#FAE3DD] rounded-xl p-3 text-xs text-[#8F2A17] leading-relaxed mb-3">
          {nudge.message || "This merchant accepts CDC Vouchers. You have S$240 left expiring in 12 days — that's your own money spent twice."}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (onNavigateToSchemes) onNavigateToSchemes();
              onDismiss();
            }}
            className="flex-1 bg-[#0F4635] hover:bg-[#0A3227] rounded-xl py-2.5 px-3 text-center font-bold text-xs text-[#FBF6EC] shadow-sm transition"
          >
            Use Voucher Instead
          </button>
          <button
            onClick={onDismiss}
            className="bg-[#F1E7D8] hover:bg-[#E6D9C4] rounded-xl py-2.5 px-3.5 font-bold text-xs text-[#6B6259] transition"
          >
            Got it
          </button>
        </div>

        <div className="text-center text-[10px] text-[#A39889] mt-2">
          Ledger + voucher data only • Zero location tracking required
        </div>
      </div>
    </div>
  );
};
