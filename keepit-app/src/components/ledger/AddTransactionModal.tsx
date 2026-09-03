"use client";

import React, { useState } from "react";
import { AppState, Transaction } from "@/lib/types";
import { X, Plus, Check } from "lucide-react";

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
  const [source, setSource] = useState<Transaction["source"]>("PayNow");
  const [recipientId, setRecipientId] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    // Negative for expenses unless gig payout
    const finalAmount = category === "Gig Payout" ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);

    onAddTransaction({
      date: "Just now",
      description: description || "Expense",
      amount: finalAmount,
      category,
      source,
      recipientId: recipientId || undefined,
      memberId: state.members[0]?.id || "mem-meiling",
    });

    onClose();
  };

  const dependents = state.members.filter((m) => m.role === "dependent");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1722] border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131c2a]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Add Transaction / Allowance
              </h3>
              <p className="text-xs text-slate-400">
                Log manual cash, PayNow transfer, or bill
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Description / Merchant
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. FairPrice Supermarket, Pocket Money to Jia Le"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="24.50"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Payment Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PayNow">PayNow / PayLah</option>
                <option value="Cash Receipt">Cash Receipt</option>
                <option value="DBS">DBS Bank</option>
                <option value="OCBC">OCBC Bank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
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
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                Select Dependent Recipient
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select recipient...</option>
                {dependents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (Age {d.age || 11})
                  </option>
                ))}
              </select>
            </div>
          )}

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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
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
