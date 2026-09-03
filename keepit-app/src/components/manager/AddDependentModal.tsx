"use client";

import React, { useState } from "react";
import { HouseholdMember, SavingsGoal } from "@/lib/types";
import { X, UserPlus, Baby, Target, Sparkles, Check } from "lucide-react";

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDependent: (dependent: Omit<HouseholdMember, "id">, goal?: Omit<SavingsGoal, "id">) => Promise<void> | void;
}

const EMOJI_OPTIONS = ["🎮", "🚲", "📚", "👟", "🎨", "⚽", "🧸", "🎒"];

export const AddDependentModal: React.FC<AddDependentModalProps> = ({
  isOpen,
  onClose,
  onAddDependent,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("11");
  const [initialBalance, setInitialBalance] = useState("20");
  const [hasGoal, setHasGoal] = useState(true);
  const [goalTitle, setGoalTitle] = useState("New game");
  const [goalTarget, setGoalTarget] = useState("60");
  const [goalIcon, setGoalIcon] = useState("🎮");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const dependentData: Omit<HouseholdMember, "id"> = {
        name: name.trim(),
        role: "dependent",
        age: Number(age) || 11,
        personalBalance: Number(initialBalance) || 0,
        avatarText: name.trim().slice(0, 1).toUpperCase(),
      };

      const goalData: Omit<SavingsGoal, "id"> | undefined = hasGoal && goalTitle.trim()
        ? {
            title: goalTitle.trim(),
            targetAmount: Number(goalTarget) || 60,
            currentAmount: Number(initialBalance) || 0,
            categoryIcon: goalIcon,
            notes: "Pocket money savings goal",
          }
        : undefined;

      await onAddDependent(dependentData, goalData);
      onClose();
      // Reset form
      setName("");
      setAge("11");
      setInitialBalance("20");
      setGoalTitle("New game");
      setGoalTarget("60");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 animate-fadeIn backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-lg bg-[#FFFDF8] rounded-t-[32px] sm:rounded-[32px] border border-[#E0D4BF] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#0F4635] text-[#FBF6EC] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8A02C] text-[#1B1815] flex items-center justify-center font-bold shadow-sm">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#FBF6EC]">
                Register Dependent
              </h3>
              <p className="text-xs text-[#8FB3A3]">
                Add child or senior with private view & pocket money
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick presets */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#EDE4D6]">
            <span className="text-[11px] font-semibold text-[#8A8075]">Quick suggestions:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setName("Jia Le");
                  setAge("11");
                  setInitialBalance("47.50");
                  setGoalTitle("Nintendo Switch Game");
                  setGoalTarget("60");
                  setGoalIcon("🎮");
                }}
                className="px-2.5 py-1 rounded-lg bg-[#EDE4D6] hover:bg-[#D6C9B4] text-[11px] font-bold text-[#1B1815] transition"
              >
                Jia Le (Age 11)
              </button>
              <button
                type="button"
                onClick={() => {
                  setName("Sarah");
                  setAge("8");
                  setInitialBalance("15.00");
                  setGoalTitle("Art Book");
                  setGoalTarget("30");
                  setGoalIcon("🎨");
                }}
                className="px-2.5 py-1 rounded-lg bg-[#EDE4D6] hover:bg-[#D6C9B4] text-[11px] font-bold text-[#1B1815] transition"
              >
                Sarah (Age 8)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-[#1B1815]">
              Dependent Name
              <input
                type="text"
                required
                placeholder="e.g. Jia Le"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm font-normal text-[#1B1815] outline-none transition focus:border-[#0F4635]"
              />
            </label>

            <label className="block text-xs font-bold text-[#1B1815]">
              Age
              <input
                type="number"
                min="1"
                max="100"
                placeholder="11"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm font-normal text-[#1B1815] outline-none transition focus:border-[#0F4635]"
              />
            </label>
          </div>

          <label className="block text-xs font-bold text-[#1B1815]">
            Starting Pocket Money / Personal Balance (S$)
            <input
              type="number"
              step="0.5"
              placeholder="20.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm font-normal text-[#1B1815] outline-none transition focus:border-[#0F4635]"
            />
            <span className="text-[11px] font-normal text-[#8A8075] mt-1 block">
              This balance is private to the dependent and tracked for their savings goals.
            </span>
          </label>

          {/* Goal section */}
          <div className="rounded-2xl border border-[#D6C9B4] bg-[#FBF6EC] p-4 space-y-3">
            <label className="flex items-center justify-between text-xs font-bold text-[#0F4635] cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#0F4635]" /> Set a Savings Goal for {name || "Dependent"}
              </span>
              <input
                type="checkbox"
                checked={hasGoal}
                onChange={(e) => setHasGoal(e.target.checked)}
                className="h-4 w-4 accent-[#0F4635]"
              />
            </label>

            {hasGoal && (
              <div className="space-y-3 pt-2 border-t border-[#EDE4D6] animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#1B1815]">
                    Goal Name
                    <input
                      type="text"
                      placeholder="e.g. New Bicycle"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#D6C9B4] bg-white p-2.5 text-xs outline-none focus:border-[#0F4635]"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#1B1815]">
                    Target Amount (S$)
                    <input
                      type="number"
                      placeholder="60"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#D6C9B4] bg-white p-2.5 text-xs outline-none focus:border-[#0F4635]"
                    />
                  </label>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#1B1815] mb-1.5">Choose Goal Icon</span>
                  <div className="flex gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setGoalIcon(emoji)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition ${
                          goalIcon === emoji ? "bg-[#0F4635] text-white ring-2 ring-[#0F4635]" : "bg-white border border-[#D6C9B4] hover:bg-[#F5F1E7]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-[#DDE8E1] text-[#0F4635] text-xs leading-relaxed">
            🔒 <strong>Family Privacy Protected:</strong> Dependents only see their own pocket money and goals. They cannot see the household total or private bank accounts.
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D6C9B4] text-xs font-bold text-[#1B1815] hover:bg-[#F5F1E7] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0F4635] text-[#FBF6EC] text-xs font-bold hover:bg-[#0A3227] disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? "Adding…" : "Add Dependent"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
