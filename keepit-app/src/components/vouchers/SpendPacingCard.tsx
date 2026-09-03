"use client";

import React from "react";
import { GovernmentVoucher } from "@/lib/types";
import { calculateAllVoucherPacing } from "@/lib/calculations/pacingEngine";
import { Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SpendPacingCardProps {
  vouchers: GovernmentVoucher[];
}

export const SpendPacingCard: React.FC<SpendPacingCardProps> = ({ vouchers }) => {
  const pacingResults = calculateAllVoucherPacing(vouchers);

  if (pacingResults.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] p-4 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-[#1B1815]">
            Voucher spend pacing
          </h3>
          <p className="text-xs text-[#8A8075]">
            Recommended weekly pace to prevent quiet forfeiture
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {pacingResults.map((item) => {
          const isCritical = item.status === "critical";

          return (
            <div
              key={item.voucherId}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isCritical
                  ? "bg-[#FAE3DD] border-[#D7442A]/30 text-[#8F2A17]"
                  : "bg-[#FBF6EC] border-[#EDE4D6] text-[#1B1815]"
              }`}
            >
              <div>
                <div className="font-bold text-xs">
                  {item.voucherName}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {item.daysRemaining} days left • {item.weeksRemaining} wks
                </div>
              </div>

              <div className="text-right">
                <div className="font-display font-bold text-sm">
                  S${item.recommendedWeeklyPace.toFixed(2)}
                  <span className="text-[10px] font-normal opacity-80">/wk</span>
                </div>
                <div className="text-[9px] font-semibold">
                  {isCritical ? "⚠️ Urgent Burn" : "✓ On Track"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
