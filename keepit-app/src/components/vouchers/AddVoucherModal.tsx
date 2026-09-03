"use client";

import React, { useState } from "react";
import { GovernmentVoucher } from "@/lib/types";
import { X, Link2, Sparkles, Check } from "lucide-react";

interface AddVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVoucher: (voucher: GovernmentVoucher) => void;
}

export const AddVoucherModal: React.FC<AddVoucherModalProps> = ({
  isOpen,
  onClose,
  onAddVoucher,
}) => {
  const [smsLink, setSmsLink] = useState("");
  const [schemeName, setSchemeName] = useState("CDC Vouchers (June 2026 Tranche)");
  const [amount, setAmount] = useState("150");
  const [category, setCategory] = useState<GovernmentVoucher["category"]>("CDC_Supermarket");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVoucher: GovernmentVoucher = {
      id: `vouch-${Date.now()}`,
      name: schemeName,
      category,
      totalGranted: parseFloat(amount) || 150,
      balance: parseFloat(amount) || 150,
      expiryDate: "31 Dec 2027",
      daysRemaining: 485,
      description: "Claimed via Gov SMS link integration.",
      acceptedMerchants: ["FairPrice", "Sheng Siong", "Giant", "Prime"],
      isExpiringSoon: false,
    };

    onAddVoucher(newVoucher);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  const handlePasteSampleLink = () => {
    setSmsLink("https://vouchers.cdc.gov.sg/claim/tranche-jun26-8921a");
    setSchemeName("CDC Vouchers (June 2026 Tranche)");
    setAmount("150");
    setCategory("CDC_Supermarket");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1722] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131c2a]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Claim / Forward Voucher Link
              </h3>
              <p className="text-xs text-slate-400">
                Paste official Singpass / RedeemSG SMS claim link
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Gov SMS Claim Link
              </label>
              <button
                type="button"
                onClick={handlePasteSampleLink}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Paste Sample SMS Link
              </button>
            </div>
            <input
              type="text"
              value={smsLink}
              onChange={(e) => setSmsLink(e.target.value)}
              placeholder="e.g. https://vouchers.cdc.gov.sg/claim/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Scheme Name
            </label>
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Total Value ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Voucher Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CDC_Supermarket">CDC Supermarket</option>
                <option value="CDC_Hawker">CDC Hawker</option>
                <option value="Climate">Climate Voucher</option>
                <option value="SG60">SG60 Vouchers</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Voucher Added!</span>
                </>
              ) : (
                <span>Claim into Household</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
