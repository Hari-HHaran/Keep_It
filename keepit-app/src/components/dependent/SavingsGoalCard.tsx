"use client";

import React, { useState } from "react";
import { SavingsGoal } from "@/lib/types";
import { Gamepad2, Sparkles, Trophy, Plus, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface SavingsGoalCardProps {
  goal?: SavingsGoal;
  personalBalance: number;
  onAddSavings: (amount: number) => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  personalBalance,
  onAddSavings,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  if (!goal) return null;

  const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleQuickSave = (amount: number) => {
    setIsAdding(true);
    onAddSavings(amount);
    
    // Trigger confetti if goal is reached!
    if (goal.currentAmount + amount >= goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1b1c2b] via-[#151926] to-[#0f1420] border border-amber-500/40 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow Ambient */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-amber-300/90 font-bold flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          Your Savings Goal
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {progressPercent}% Complete
        </span>
      </div>

      <div className="flex items-center space-x-3.5 mb-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-md">
          <Gamepad2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {goal.title}
          </h3>
          <div className="text-xs text-slate-300 font-medium">
            <span className="text-amber-300 font-bold">${goal.currentAmount.toFixed(2)}</span> of ${goal.targetAmount.toFixed(2)} saved
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-900 rounded-full h-3.5 border border-slate-700/80 p-0.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs mt-1.5 font-medium">
          <span className="text-emerald-400">
            {remaining > 0 ? `Save $${remaining.toFixed(2)} more to reach your goal!` : "🎉 Goal Completed!"}
          </span>
          <span className="text-slate-400">${goal.targetAmount.toFixed(2)} Target</span>
        </div>
      </div>

      {/* Quick Deposit Actions for the Child */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => handleQuickSave(2.50)}
          disabled={isAdding || remaining === 0}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          {isAdding ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Save $2.50 Pocket Money</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
