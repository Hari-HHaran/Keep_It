"use client";

import React, { useState } from "react";
import { GovernmentVoucher } from "@/lib/types";
import { 
  X, 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Store, 
  Check, 
  Clock, 
  ChevronRight, 
  Sparkles
} from "lucide-react";

interface VoucherBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherScheme: "cdc" | "climate" | "sg60" | null;
  vouchers: GovernmentVoucher[];
  onRedeem: (voucherId: string, amount: number) => void;
}

export const VoucherBreakdownModal: React.FC<VoucherBreakdownModalProps> = ({
  isOpen,
  onClose,
  voucherScheme,
  vouchers,
  onRedeem,
}) => {
  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);

  if (!isOpen || !voucherScheme) return null;

  // Find matching voucher from state or construct live breakdown
  const cdcVoucher = vouchers.find((v) => v.category === "CDC_Supermarket" || v.name.toLowerCase().includes("cdc")) || {
    id: "vouch-cdc-supermarket",
    name: "CDC Vouchers 2026",
    balance: 240,
    totalGranted: 500,
    daysRemaining: 12,
    expiryDate: "12 days left",
  };

  const climateVoucher = vouchers.find((v) => v.category === "Climate" || v.name.toLowerCase().includes("climate")) || {
    id: "vouch-climate",
    name: "Climate Vouchers",
    balance: 300,
    totalGranted: 300,
    daysRemaining: 120,
    expiryDate: "4 months left",
  };

  const sg60Voucher = vouchers.find((v) => v.category === "SG60" || v.name.toLowerCase().includes("sg60")) || {
    id: "vouch-sg60",
    name: "SG60 Vouchers",
    balance: 600,
    totalGranted: 600,
    daysRemaining: 300,
    expiryDate: "Dec 2026",
  };

  const handleRedeemQuick = (id: string, amount: number, label: string) => {
    onRedeem(id, amount);
    setRedeemedNotice(`Redeemed S$${amount.toFixed(2)} from ${label}!`);
    setTimeout(() => {
      setRedeemedNotice(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fadeIn backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-lg bg-[#FFFDF8] rounded-t-[32px] sm:rounded-[32px] border border-[#E0D4BF] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header based on scheme */}
        {voucherScheme === "cdc" && (
          <div className="p-5 bg-[#0F4635] text-[#FBF6EC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D7442A] text-[#FBF6EC] flex items-center justify-center font-black font-mono-custom text-sm shadow-sm">
                  CDC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#FBF6EC]">
                      CDC Vouchers 2026
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D7442A] text-[#FBF6EC]">
                      12 days left
                    </span>
                  </div>
                  <p className="text-xs text-[#8FB3A3] mt-0.5">
                    Total: S${cdcVoucher.balance.toFixed(2)} left of S${cdcVoucher.totalGranted.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF6EC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {voucherScheme === "sg60" && (
          <div className="p-5 bg-[#0F4635] text-[#FBF6EC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8A02C] text-[#1B1815] flex items-center justify-center font-black font-mono-custom text-sm shadow-sm">
                  60
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#FBF6EC]">
                      SG60 Community Vouchers
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8A02C] text-[#1B1815]">
                      Valid till Dec 2026
                    </span>
                  </div>
                  <p className="text-xs text-[#8FB3A3] mt-0.5">
                    Total: S${sg60Voucher.balance.toFixed(2)} left of S${sg60Voucher.totalGranted.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF6EC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {voucherScheme === "climate" && (
          <div className="p-5 bg-[#0F4635] text-[#FBF6EC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-center font-black font-mono-custom text-sm shadow-sm">
                  CFH
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-[#FBF6EC]">
                      Climate Vouchers
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDE8E1] text-[#0F4635]">
                      4 months left
                    </span>
                  </div>
                  <p className="text-xs text-[#8FB3A3] mt-0.5">
                    Total: S${climateVoucher.balance.toFixed(2)} left (No Category Split)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF6EC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Redeemed Success Alert */}
        {redeemedNotice && (
          <div className="bg-[#DDE8E1] border-b border-[#0F4635]/20 p-3 text-xs font-bold text-[#0F4635] flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-[#0F4635]" />
            <span>{redeemedNotice}</span>
          </div>
        )}

        {/* Breakdown Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* ================= CDC BREAKDOWN ================= */}
          {voucherScheme === "cdc" && (
            <div className="space-y-4">
              <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-bold">
                2-Category Scheme Breakdown
              </div>

              {/* 1. CDC Supermarket Voucher */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-1.5 border-[#0F4635] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-center shrink-0 font-bold">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">
                        CDC Supermarket Voucher
                      </div>
                      <div className="text-[11px] text-[#6B6259]">
                        FairPrice, Sheng Siong, Giant, Prime Supermarket
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-[#0F4635]">
                      S${(cdcVoucher.balance / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8A8075]">of S$250.00</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE4D6]">
                  <span className="text-xs text-[#8A8075]">Valid at supermarket checkouts</span>
                  <button
                    onClick={() => handleRedeemQuick(cdcVoucher.id, 10, "CDC Supermarket")}
                    className="py-2 px-5 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-xs font-bold text-[#FBF6EC] shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Use S$10
                  </button>
                </div>
              </div>

              {/* 2. CDC Hawker & Heartland Voucher */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-1.5 border-[#D7442A] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FAE3DD] text-[#D7442A] flex items-center justify-center shrink-0 font-bold">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">
                        CDC Hawker & Heartland Voucher
                      </div>
                      <div className="text-[11px] text-[#6B6259]">
                        Hawker stalls, coffee shops & heartland merchants
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-[#D7442A]">
                      S${(cdcVoucher.balance / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8A8075]">of S$250.00</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE4D6]">
                  <span className="text-xs text-[#8A8075]">Valid at hawker and neighborhood food stalls</span>
                  <button
                    onClick={() => handleRedeemQuick(cdcVoucher.id, 5, "CDC Hawker")}
                    className="py-2 px-5 rounded-xl bg-[#D7442A] hover:bg-[#B2543C] text-xs font-bold text-[#FBF6EC] shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Use S$5
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= SG60 BREAKDOWN ================= */}
          {voucherScheme === "sg60" && (
            <div className="space-y-4">
              <div className="text-[11px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-bold">
                2-Category Scheme Breakdown
              </div>

              {/* 1. SG60 Supermarket Voucher */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-1.5 border-[#0F4635] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-center shrink-0 font-bold">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">
                        SG60 Supermarket Voucher
                      </div>
                      <div className="text-[11px] text-[#6B6259]">
                        Participating supermarkets & grocery partners
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-[#0F4635]">
                      S${(sg60Voucher.balance / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8A8075]">of S${(sg60Voucher.totalGranted / 2).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE4D6]">
                  <span className="text-xs text-[#8A8075]">Valid for grocery purchases</span>
                  <button
                    onClick={() => handleRedeemQuick(sg60Voucher.id, 10, "SG60 Supermarket")}
                    className="py-2 px-5 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-xs font-bold text-[#FBF6EC] shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Use S$10
                  </button>
                </div>
              </div>

              {/* 2. SG60 Heartland & Community Voucher */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-1.5 border-[#E8A02C] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F5EAD6] text-[#9A7420] flex items-center justify-center shrink-0 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">
                        SG60 Heartland & Community Voucher
                      </div>
                      <div className="text-[11px] text-[#6B6259]">
                        Heartland merchants, neighborhood shops & clinics
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-[#9A7420]">
                      S${(sg60Voucher.balance / 2).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8A8075]">of S${(sg60Voucher.totalGranted / 2).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE4D6]">
                  <span className="text-xs text-[#8A8075]">Valid at registered heartland shops & clinics</span>
                  <button
                    onClick={() => handleRedeemQuick(sg60Voucher.id, 5, "SG60 Heartland")}
                    className="py-2 px-5 rounded-xl bg-[#E8A02C] hover:bg-[#C9841B] text-xs font-bold text-[#1B1815] shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Use S$5
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= CLIMATE VOUCHER (NO SPLIT) ================= */}
          {voucherScheme === "climate" && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#DDE8E1] text-[#0F4635] text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F4635] shrink-0" />
                <span><strong>Unified Support:</strong> Climate vouchers have <u>no category split</u> and apply 100% towards eligible energy/water-efficient appliances.</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-1.5 border-[#0F4635] shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-center shrink-0 font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">
                        Climate Friendly Households Scheme
                      </div>
                      <div className="text-[11px] text-[#6B6259]">
                        10 eligible appliance types across Singapore retailers
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-xl text-[#0F4635]">
                      S${climateVoucher.balance.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#8A8075]">Full balance available</div>
                  </div>
                </div>

                <div className="text-xs text-[#6B6259] pt-2 border-t border-[#EDE4D6] space-y-1">
                  <div className="font-semibold text-[#1B1815]">Eligible Retailers:</div>
                  <div>Courts, Best Denki, Gain City, Harvey Norman, Mega Discount Store, Sheng Siong (LED)</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE4D6]">
                  <span className="text-xs text-[#8A8075]">Valid for appliance upgrades</span>
                  <button
                    onClick={() => handleRedeemQuick(climateVoucher.id, 50, "Climate Voucher")}
                    className="py-2 px-5 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-xs font-bold text-[#FBF6EC] shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Use S$50
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#EDE4D6] flex items-center justify-between">
          <span className="text-[11px] text-[#8A8075]">
            Gov.sg RedeemSG Live Sync
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs hover:bg-[#0A3227] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
