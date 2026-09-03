"use client";

import React, { useState } from "react";
import { GovernmentVoucher } from "@/lib/types";
import { Clock, Store, Check, ArrowUpRight, Zap } from "lucide-react";

interface VoucherCardProps {
  voucher: GovernmentVoucher;
  onRedeem: (voucherId: string, amount: number) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, onRedeem }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemQuick = (amount: number) => {
    setIsRedeeming(true);
    onRedeem(voucher.id, amount);
    setTimeout(() => setIsRedeeming(false), 1200);
  };

  const isCritical = voucher.daysRemaining <= 14;

  return (
    <div
      className={`p-4 rounded-xl border transition flex flex-col justify-between relative overflow-hidden ${
        isCritical
          ? "bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5"
          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>{voucher.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {voucher.description}
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${
              isCritical
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <Clock className="w-3 h-3" />
            {voucher.daysRemaining <= 30
              ? `Expires in ${voucher.daysRemaining} days`
              : voucher.expiryDate}
          </span>
        </div>

        {/* Balance Display */}
        <div className="my-3">
          <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1.5">
            ${voucher.balance.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">
              left of ${voucher.totalGranted.toFixed(2)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isCritical ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.max(5, (voucher.balance / voucher.totalGranted) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Accepted Merchants */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-3">
          <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">
            {voucher.acceptedMerchants.join(" • ")}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => handleRedeemQuick(10)}
          disabled={voucher.balance < 10 || isRedeeming}
          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 disabled:opacity-40"
        >
          {isRedeeming ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Redeemed $10!</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Use $10 Voucher</span>
            </>
          )}
        </button>

        <a
          href="https://vouchers.cdc.gov.sg"
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Open Official Portal"
        >
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
