"use client";

import React, { useState } from "react";
import { AppState, SavingsGoal } from "@/lib/types";
import { SetSavingsGoalModal } from "./SetSavingsGoalModal";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Plus, 
  Sparkles, 
  Trophy, 
  ShoppingBag, 
  Check, 
  Edit3, 
  Gift, 
  Target,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface DependentDashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  isManagerViewing?: boolean;
  onReturnToManager?: () => void;
}

export const DependentDashboard: React.FC<DependentDashboardProps> = ({
  state,
  onUpdateState,
  isManagerViewing = false,
  onReturnToManager,
}) => {
  const currentMember = state.members.find((m) => m.role === "dependent") || state.members[0];

  // Active Goal State
  const [activeGoal, setActiveGoal] = useState<SavingsGoal>(
    currentMember?.savingsGoal || {
      id: "goal-1",
      title: "Wilson NCAA Basketball",
      targetAmount: 60.00,
      currentAmount: 47.50,
      categoryIcon: "🏀",
      categoryName: "Sports",
      notes: "For weekend games at Bedok South CC",
      isCompleted: false,
    }
  );

  // Wishlist Queue
  const [wishlist, setWishlist] = useState<SavingsGoal[]>([
    {
      id: "goal-2",
      title: "Pokemon Legends Switch Game",
      targetAmount: 79.00,
      currentAmount: 0,
      categoryIcon: "🎮",
      categoryName: "Gaming",
      notes: "Physical cartridge",
      isCompleted: false,
    },
    {
      id: "goal-3",
      title: "Nike Junior Running Shoes",
      targetAmount: 95.00,
      currentAmount: 0,
      categoryIcon: "👟",
      categoryName: "Sports",
      notes: "For track and PE class",
      isCompleted: false,
    },
  ]);

  // Completed Trophies
  const [completedGoals, setCompletedGoals] = useState<SavingsGoal[]>([]);

  // Modals & Celebrations
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCelebratingPurchase, setIsCelebratingPurchase] = useState(false);

  const savePct = Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100));
  const remaining = Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount);
  const isGoalReached = activeGoal.currentAmount >= activeGoal.targetAmount;

  // Add Savings to Goal
  const handleAddSavings = (amount: number) => {
    const nextSaved = Math.min(activeGoal.targetAmount, activeGoal.currentAmount + amount);
    const updatedGoal = { ...activeGoal, currentAmount: nextSaved };
    setActiveGoal(updatedGoal);

    // If goal completed!
    if (nextSaved >= activeGoal.targetAmount) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });
    }
  };

  // Mark Goal as Purchased & Progress to Next Wishlist Item
  const handleClaimAndPurchase = () => {
    setIsCelebratingPurchase(true);
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.4 },
    });

    const finished = { ...activeGoal, isCompleted: true, completedAt: "Just now" };
    setCompletedGoals((prev) => [finished, ...prev]);

    setTimeout(() => {
      setIsCelebratingPurchase(false);
      // Promote next wishlist item if available
      if (wishlist.length > 0) {
        const next = wishlist[0];
        setActiveGoal(next);
        setWishlist((prev) => prev.slice(1));
      } else {
        // Reset or prompt new goal
        setActiveGoal({
          id: `goal-${Date.now()}`,
          title: "New Wishlist Item",
          targetAmount: 50.00,
          currentAmount: 0,
          categoryIcon: "🎁",
          categoryName: "General",
        });
      }
    }, 2500);
  };

  // Switch Active Goal with a Wishlist Item
  const handleSwitchGoal = (selected: SavingsGoal) => {
    const prevActive = activeGoal;
    setActiveGoal(selected);
    setWishlist((prev) => [prevActive, ...prev.filter((g) => g.id !== selected.id)]);
  };

  // Save new or edited goal from modal
  const handleSaveGoalFromModal = (newGoal: SavingsGoal) => {
    setActiveGoal(newGoal);
  };

  return (
    <div className="p-4 space-y-4 bg-[#FDF6E9] min-h-full animate-fadeIn font-sans">
      {/* Manager Viewing Banner */}
      {isManagerViewing && (
        <div className="bg-[#DDE8E1] border border-[#0F4635]/30 rounded-2xl p-3 flex items-center justify-between text-xs text-[#0F4635] shadow-xs">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#0F4635] shrink-0" />
            <span className="font-semibold">
              Manager View: {currentMember?.name || "Jia Le"}'s Personal Dashboard
            </span>
          </div>
          {onReturnToManager && (
            <button
              onClick={onReturnToManager}
              className="px-2.5 py-1 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-[10px] hover:bg-[#0A3227] transition shrink-0 cursor-pointer"
            >
              Back to Household
            </button>
          )}
        </div>
      )}

      {/* 1. Header with Name & Quick Edit Goal */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#1B1815] tracking-tight">
            Hi {currentMember?.name || "Jia Le"}
          </h1>
          <p className="text-xs text-[#8A8075]">
            Pocket Money & Dream Wishlist
          </p>
        </div>

        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] border border-[#E0D4BF] text-xs font-semibold text-[#0F4635] shadow-xs transition cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Change Goal</span>
        </button>
      </div>

      {/* 2. Main Vessel Goal Card with Item Details */}
      <div className="bg-[#FFFDF8] border-1.5 border-[#F0E0C2] rounded-[26px] p-5 text-center relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-lg">{activeGoal.categoryIcon}</span>
          <span className="text-[11px] font-mono-custom uppercase tracking-wider text-[#9A7420] font-bold">
            Saving for: {activeGoal.title}
          </span>
        </div>

        {/* Big Central Vessel Graphic */}
        <div className="relative w-36 h-40 mx-auto rounded-2xl rounded-b-[54px] border-[3.5px] border-[#1B1815] overflow-hidden bg-[#FDF6E9] shadow-inner">
          {/* Animated Liquid Level */}
          <div
            className={`absolute left-0 right-0 bottom-0 transition-all duration-700 ${
              isGoalReached ? "bg-[#0F4635]" : "bg-[#E8A02C]"
            }`}
            style={{ height: `${savePct}%` }}
          />

          {/* Center Saved Amount */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#1B1815] select-none z-10">
            <span className="text-2xl font-display font-bold tracking-tight">
              S${activeGoal.currentAmount.toFixed(2)}
            </span>
            <span className="text-[10px] font-mono-custom opacity-70 font-semibold">
              of S${activeGoal.targetAmount.toFixed(2)}
            </span>
          </div>

          {/* Target Line */}
          <div className="absolute left-2 right-2 top-[34%] h-0.5 bg-[#1B1815]/20" />
        </div>

        {/* Goal Status & Progress Note */}
        <div className="mt-3">
          {isGoalReached ? (
            <div className="font-display font-bold text-sm text-[#0F4635] flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#E8A02C]" />
              <span>Goal Completed! Ready to purchase!</span>
            </div>
          ) : (
            <div className="font-display font-bold text-sm text-[#9A7420]">
              S${remaining.toFixed(2)} more to buy your {activeGoal.title}!
            </div>
          )}
        </div>

        {/* Action: Deposit Pocket Money into Goal or Claim Purchase */}
        {isGoalReached ? (
          <button
            onClick={handleClaimAndPurchase}
            className="w-full mt-3 bg-[#0F4635] hover:bg-[#0A3227] text-[#FDF6EC] font-display font-bold text-sm py-3 px-4 rounded-2xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#E8A02C]" />
            <span>Mark as Purchased & Set Next Goal</span>
          </button>
        ) : (
          <div className="space-y-2 mt-3">
            {/* Quick deposit chips */}
            <div className="flex gap-2 justify-center">
              {[2, 5, 8, 10].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAddSavings(amt)}
                  className="flex-1 py-2 rounded-xl bg-[#FBF6EC] hover:bg-[#EDE4D6] border border-[#E0D4BF] text-xs font-bold text-[#1B1815] transition active:scale-95 cursor-pointer"
                >
                  +S${amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAddSavings(8)}
              className="w-full bg-[#0F4635] hover:bg-[#0A3227] text-[#FDF6EC] font-display font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              Deposit Weekly Pocket Money (+S$8)
            </button>
          </div>
        )}

        {/* Celebration Overlay on Purchase */}
        {isCelebratingPurchase && (
          <div className="absolute inset-0 bg-[#0F4635]/95 flex flex-col items-center justify-center gap-2 p-4 animate-pop z-30 text-[#FBF6EC]">
            <Trophy className="w-12 h-12 text-[#E8A02C] animate-bounce" />
            <div className="font-display font-bold text-2xl text-center">
              Item Purchased! 🎉
            </div>
            <div className="text-xs text-[#8FB3A3] text-center max-w-xs">
              You kept your promise and saved S${activeGoal.targetAmount.toFixed(2)} for your {activeGoal.title}!
            </div>
          </div>
        )}
      </div>

      {/* 3. Wishlist Queue Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Gift className="w-4 h-4 text-[#9A7420]" />
            <span className="font-display font-bold text-sm text-[#1B1815]">
              My Wishlist Queue ({wishlist.length})
            </span>
          </div>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs font-semibold text-[#0F4635] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {wishlist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSwitchGoal(item)}
              className="p-3 rounded-2xl bg-[#FFFDF8] hover:bg-[#F9F4EB] border border-[#E0D4BF] hover:border-[#0F4635] transition flex items-center justify-between cursor-pointer group shadow-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.categoryIcon}</span>
                <div>
                  <div className="text-xs font-bold text-[#1B1815] group-hover:text-[#0F4635] transition">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#8A8075]">
                    {item.notes || "Queued next"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xs text-[#0F4635]">
                  S${item.targetAmount.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE4D6] text-[#584F45] group-hover:bg-[#0F4635] group-hover:text-[#FBF6EC] transition">
                  Make Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Completed Goals Trophy Shelf */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <div className="font-display font-bold text-sm text-[#1B1815] px-1 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#E8A02C]" />
            <span>Trophy Shelf (Goals Achieved)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {completedGoals.map((comp) => (
              <div
                key={comp.id}
                className="p-3 rounded-2xl bg-[#DDE8E1] border border-[#0F4635]/20 text-xs text-[#0F4635] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{comp.categoryIcon}</span>
                  <span className="font-bold text-[10px] bg-[#0F4635] text-[#FBF6EC] px-1.5 py-0.5 rounded-md">
                    ✓ BOUGHT
                  </span>
                </div>
                <div className="font-bold truncate">{comp.title}</div>
                <div className="text-[10px] text-[#2C5A49]">
                  Saved S${comp.targetAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Spendable Metrics Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#FFFDF8] border border-[#F0E0C2] rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-mono-custom text-[#9A7420] uppercase font-semibold">
            Spendable Cash
          </div>
          <div className="font-display font-bold text-xl text-[#1B1815] mt-0.5">
            S$8.50
          </div>
        </div>

        <div className="bg-[#FFFDF8] border border-[#F0E0C2] rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-mono-custom text-[#9A7420] uppercase font-semibold">
            Weekly Pocket Money
          </div>
          <div className="font-display font-bold text-xl text-[#1B1815] mt-0.5">
            S$50<span className="text-xs font-normal text-[#8A8075]">/wk</span>
          </div>
        </div>
      </div>

      {/* 6. What Happened Activity Stream */}
      <div className="space-y-2">
        <div className="font-display font-bold text-sm text-[#1B1815] px-1">
          Recent Allowance & Goal Activity
        </div>

        <div className="rounded-2xl bg-[#FFFDF8] border border-[#F0E0C2] p-2 space-y-1 shadow-sm text-xs">
          {/* Mum Transfer */}
          <div className="p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#DDE8E1] text-[#0F4635] font-bold text-xs flex items-center justify-center">
                M
              </div>
              <div>
                <div className="font-bold text-[#1B1815]">Ma sent pocket money</div>
                <div className="text-[10px] text-[#8A8075]">"For the week — save some!"</div>
              </div>
            </div>
            <div className="font-display font-bold text-[#0F4635]">+S$50.00</div>
          </div>

          {/* Canteen Snack */}
          <div className="p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F5EAD6] text-[#9A7420] font-mono-custom font-bold text-xs flex items-center justify-center">
                $
              </div>
              <div>
                <div className="font-bold text-[#1B1815]">Canteen snack</div>
                <div className="text-[10px] text-[#8A8075]">Cash • Monday</div>
              </div>
            </div>
            <div className="font-display font-bold text-[#8A8075]">−S$3.50</div>
          </div>

          {/* Goal Deposit */}
          <div className="p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F5EAD6] text-[#9A7420] font-bold text-xs flex items-center justify-center">
                ↑
              </div>
              <div>
                <div className="font-bold text-[#1B1815]">Moved to {activeGoal.title}</div>
                <div className="text-[10px] text-[#8A8075]">{activeGoal.categoryName || "Savings Goal"}</div>
              </div>
            </div>
            <div className="font-display font-bold text-[#9A7420]">S$18.00</div>
          </div>
        </div>
      </div>

      {/* Set / Change Goal Modal */}
      <SetSavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSaveGoal={handleSaveGoalFromModal}
        currentGoal={activeGoal}
      />
    </div>
  );
};
