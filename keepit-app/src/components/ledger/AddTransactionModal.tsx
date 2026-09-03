"use client";

import React, { useState } from "react";
import { AppState, Transaction } from "@/lib/types";
import { X, Plus, Check, Wallet, Building2, Smartphone, Receipt } from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  state,
  onAddTransaction,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Transaction["category"]>("Groceries");
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    state.bankAccounts?.[0]?.id || "paynow"
  );
  const [recipientId, setRecipientId] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount === 0) return;

    // Negative for expenses unless gig payout
    const finalAmount = category === "Gig Payout" ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);

    const selectedAcc = state.bankAccounts?.find((a) => a.id === selectedAccountId);
    const sourceName = selectedAcc
      ? selectedAcc.bankName
      : selectedAccountId === "cash"
      ? "Cash Receipt"
      : "PayNow";

    onAddTransaction({
      date: "Just now",
      description: description.trim() || "Expense",
      amount: finalAmount,
      category,
      source: sourceName,
      accountId: selectedAcc ? selectedAcc.id : undefined,
      recipientId: recipientId || undefined,
      memberId: state.currentMemberId || state.members[0]?.id || "",
    });

    onClose();
    setDescription("");
    setAmount("");
  };

  const dependents = state.members.filter((m) => m.role === "dependent");
  const bankAccounts = state.bankAccounts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fadeIn backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-md bg-[#FFFDF8] rounded-t-[32px] sm:rounded-[32px] border border-[#E0D4BF] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#0F4635] text-[#FBF6EC] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8A02C] text-[#1B1815] flex items-center justify-center font-bold shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#FBF6EC]">
                Add Transaction
              </h3>
              <p className="text-xs text-[#8FB3A3]">
                Log spending, bank transfer, or allowance
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF6EC] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-bold text-[#1B1815] mb-1.5 block">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. FairPrice Supermarket, Bedok 85 Hawker, Dinner"
              className="w-full p-3 rounded-xl bg-white border border-[#D6C9B4] text-sm text-[#1B1815] focus:outline-none focus:border-[#0F4635] transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1B1815] mb-1.5 block">
                Amount (S$)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="24.50"
                className="w-full p-3 rounded-xl bg-white border border-[#D6C9B4] text-sm text-[#1B1815] focus:outline-none focus:border-[#0F4635] transition"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1B1815] mb-1.5 block">
                Account Source
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-[#D6C9B4] text-xs text-[#1B1815] focus:outline-none focus:border-[#0F4635] transition font-medium"
              >
                {bankAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankName} (S${acc.balance.toFixed(0)})
                  </option>
                ))}
                <option value="paynow">PayNow / PayLah! Wallet</option>
                <option value="cash">Cash Receipt ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1B1815] mb-1.5 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-3 rounded-xl bg-white border border-[#D6C9B4] text-xs text-[#1B1815] focus:outline-none focus:border-[#0F4635] transition font-medium"
            >
              <option value="Groceries">Groceries (Checks CDC Vouchers)</option>
              <option value="Hawker & Dining">Hawker & Dining</option>
              <option value="Pocket Money">Pocket Money (To Dependent)</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Transport">Transport</option>
              <option value="Gig Payout">Gig Platform Payout (Income)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {category === "Pocket Money" && dependents.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#FBF6EC] border border-[#D6C9B4] space-y-2 animate-fadeIn">
              <label className="text-xs font-bold text-[#0F4635] block">
                Select Dependent Recipient
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-[#D6C9B4] text-xs text-[#1B1815] focus:outline-none focus:border-[#0F4635]"
              >
                <option value="">Select recipient...</option>
                {dependents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Age {d.age || 11}) • Balance: S${(d.personalBalance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-[#EDE4D6] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6259] hover:bg-[#F5F1E7] border border-[#D6C9B4] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#FBF6EC] bg-[#0F4635] hover:bg-[#0A3227] shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
