"use client";

import React, { useMemo, useState } from "react";
import confetti from "canvas-confetti";

import {
  AppState,
  HouseholdMember,
  SavingsGoal,
  Transaction,
} from "@/lib/types";

import { SetSavingsGoalModal } from "./SetSavingsGoalModal";
import { DependentActivityFeed } from "./DependentActivityFeed";

import {
  Check,
  Edit3,
  Eye,
  Gift,
  ShoppingBag,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";

interface DependentDashboardProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  /** Which dependent to render. Falls back to the signed-in member. */
  dependentId?: string | null;
  selectedDependentId?: string | null;
  /** Persists the goal to Supabase via /api/savings-goals. */
  onSaveGoal?: (memberId: string, goal: SavingsGoal) => Promise<void> | void;
  /** Persists a deposit to Supabase via /api/savings-goals. */
  onDepositGoal?: (memberId: string, goalId: string, amount: number) => Promise<void> | void;
  isManagerViewing?: boolean;
  onReturnToManager?: () => void;
}

const DEFAULT_GOAL: SavingsGoal = {
  id: "goal-default",
  title: "New Savings Goal",
  targetAmount: 50,
  currentAmount: 0,
  categoryIcon: "🎯",
  categoryName: "General",
  notes: "Start saving towards something important",
  isCompleted: false,
};

export const DependentDashboard: React.FC<
  DependentDashboardProps
> = ({
  state,
  onUpdateState,
  dependentId = null,
  selectedDependentId = null,
  onSaveGoal,
  onDepositGoal,
  isManagerViewing = false,
  onReturnToManager,
}) => {
  const activeDependentId = dependentId || selectedDependentId;
  const [isGoalModalOpen, setIsGoalModalOpen] =
    useState(false);

  const [
    isCelebratingPurchase,
    setIsCelebratingPurchase,
  ] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const currentMember = useMemo(() => {
    if (activeDependentId) {
      return state.members.find(
        (member) =>
          member.id === activeDependentId &&
          member.role === "dependent"
      );
    }

    return state.members.find(
      (member) => member.role === "dependent"
    );
  }, [state.members, activeDependentId]);

  const dependentTransactions =
    useMemo<Transaction[]>(() => {
      if (!currentMember) {
        return [];
      }

      return state.transactions
        .filter(
          (transaction) =>
            transaction.memberId ===
              currentMember.id ||
            transaction.recipientId ===
              currentMember.id
        )
        .map((transaction) => {
          if (
            transaction.recipientId ===
              currentMember.id &&
            transaction.category === "Pocket Money"
          ) {
            return {
              ...transaction,
              amount: Math.abs(transaction.amount),
            };
          }

          return transaction;
        });
    }, [state.transactions, currentMember]);

  if (!currentMember) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FDF6E9] p-6">
        <div className="rounded-2xl border border-[#E0D4BF] bg-[#FFFDF8] p-6 text-center">
          <h2 className="font-display text-lg font-bold text-[#1B1815]">
            Dependent not found
          </h2>

          {onReturnToManager && (
            <button
              type="button"
              onClick={onReturnToManager}
              className="mt-4 rounded-xl bg-[#0F4635] px-4 py-2 text-xs font-bold text-[#FBF6EC]"
            >
              Return to household
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeGoal =
    currentMember.savingsGoal || DEFAULT_GOAL;

  const allWishlistGoals =
    currentMember.wishlistGoals || [];

  const wishlistGoals = allWishlistGoals.filter(
    (goal) => !goal.isCompleted
  );

  const completedGoals = allWishlistGoals.filter(
    (goal) => goal.isCompleted
  );

  const personalBalance =
    currentMember.personalBalance || 0;

  const availableForOtherThings = Math.max(
    0,
    personalBalance - activeGoal.currentAmount
  );

  const savedPercentageOfBalance =
    personalBalance > 0
      ? Math.min(
          100,
          (activeGoal.currentAmount /
            personalBalance) *
            100
        )
      : 0;

  const availablePercentage =
    personalBalance > 0
      ? Math.max(
          0,
          100 - savedPercentageOfBalance
        )
      : 0;

  const savingsPercentage = Math.min(
    100,
    Math.round(
      (activeGoal.currentAmount /
        activeGoal.targetAmount) *
        100
    )
  );

  const remainingAmount = Math.max(
    0,
    activeGoal.targetAmount -
      activeGoal.currentAmount
  );

  const isGoalReached =
    activeGoal.currentAmount >=
    activeGoal.targetAmount;

  const totalIncome = dependentTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

  const clearMessagesLater = () => {
    window.setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 2500);
  };

  const updateCurrentMember = (
    changes: Partial<HouseholdMember>
  ) => {
    const updatedMembers = state.members.map(
      (member) =>
        member.id === currentMember.id
          ? {
              ...member,
              ...changes,
            }
          : member
    );

    onUpdateState({
      ...state,
      members: updatedMembers,
    });
  };

  const handleAddSavings = (amount: number) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    // Persist to Supabase when the parent supplies a handler.
    if (onDepositGoal && currentMember && amount <= availableForOtherThings) {
      void onDepositGoal(currentMember.id, activeGoal.id, amount);
    }

    if (amount > availableForOtherThings) {
      setErrorMessage(
        `You only have S$${availableForOtherThings.toFixed(
          2
        )} available.`
      );

      clearMessagesLater();
      return;
    }

    const amountActuallySaved = Math.min(
      amount,
      remainingAmount,
      availableForOtherThings
    );

    if (amountActuallySaved <= 0) {
      return;
    }

    const newSavedAmount =
      activeGoal.currentAmount +
      amountActuallySaved;

    updateCurrentMember({
      savingsGoal: {
        ...activeGoal,
        currentAmount: newSavedAmount,
        isCompleted:
          newSavedAmount >= activeGoal.targetAmount,
      },
    });

    setSuccessMessage(
      `S$${amountActuallySaved.toFixed(
        2
      )} was allocated to ${activeGoal.title}.`
    );

    clearMessagesLater();

    if (
      newSavedAmount >= activeGoal.targetAmount
    ) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
      });
    }
  };

  const handleSaveGoal = (
    newGoal: SavingsGoal
  ) => {
    // Persist to Supabase when the parent supplies a handler.
    if (onSaveGoal && currentMember) {
      void onSaveGoal(currentMember.id, newGoal);
    }

    updateCurrentMember({
      savingsGoal: {
        ...newGoal,
        currentAmount:
          newGoal.id === activeGoal.id
            ? activeGoal.currentAmount
            : newGoal.currentAmount,
      },
    });

    setSuccessMessage(
      `${newGoal.title} is now your active goal.`
    );

    clearMessagesLater();
  };

  const handleSwitchGoal = (
    selectedGoal: SavingsGoal
  ) => {
    const previousGoal: SavingsGoal = {
      ...activeGoal,
      isCompleted: false,
    };

    const updatedWishlist = [
      previousGoal,
      ...allWishlistGoals.filter(
        (goal) => goal.id !== selectedGoal.id
      ),
    ];

    updateCurrentMember({
      savingsGoal: {
        ...selectedGoal,
        isCompleted: false,
      },
      wishlistGoals: updatedWishlist,
    });

    setSuccessMessage(
      `${selectedGoal.title} is now your active goal.`
    );

    clearMessagesLater();
  };

  const handleClaimAndPurchase = () => {
    setIsCelebratingPurchase(true);

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.45 },
    });

    const completedGoal: SavingsGoal = {
      ...activeGoal,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };

    const nextGoal = wishlistGoals[0];

    const updatedWishlist = [
      completedGoal,
      ...allWishlistGoals.filter(
        (goal) =>
          goal.id !== nextGoal?.id &&
          goal.id !== activeGoal.id
      ),
    ];

    updateCurrentMember({
      savingsGoal:
        nextGoal || {
          ...DEFAULT_GOAL,
          id: `goal-${Date.now()}`,
        },
      wishlistGoals: updatedWishlist,
    });

    window.setTimeout(() => {
      setIsCelebratingPurchase(false);
    }, 2000);
  };

  return (
    <div className="min-h-full space-y-4 bg-[#FDF6E9] p-4 font-sans animate-fadeIn">
      {isManagerViewing && (
        <div className="flex items-center justify-between rounded-2xl border border-[#0F4635]/30 bg-[#DDE8E1] p-3 text-xs text-[#0F4635]">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />

            <span className="font-semibold">
              Manager View: {currentMember.name}
            </span>
          </div>

          {onReturnToManager && (
            <button
              type="button"
              onClick={onReturnToManager}
              className="rounded-xl bg-[#0F4635] px-3 py-1.5 text-[10px] font-bold text-[#FBF6EC]"
            >
              Back to Household
            </button>
          )}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="animate-pop flex items-center gap-3 rounded-2xl border border-[#0F4635]/20 bg-[#DDE8E1] p-3 text-[#0F4635]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F4635] text-[#FBF6EC]">
            <Check className="h-4 w-4" />
          </div>

          <div>
            <div className="text-xs font-bold">
              Savings updated
            </div>

            <div className="text-[11px]">
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-[#D7442A]/30 bg-[#FAE3DD] p-3 text-[#8F2A17]"
        >
          <div className="text-xs font-bold">
            Unable to add savings
          </div>

          <div className="text-[11px]">
            {errorMessage}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1B1815]">
            Hi {currentMember.name}
          </h1>

          <p className="text-xs text-[#8A8075]">
            Your spending and savings
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#E0D4BF] bg-[#FFFDF8] px-3 py-1.5 text-xs font-semibold text-[#0F4635]"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Change goal
        </button>
      </div>

      {/* Main personal-balance card */}
      <section className="relative overflow-hidden rounded-[26px] bg-[#0F4635] p-5 text-[#FBF6EC] shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono-custom text-[11px] font-semibold uppercase tracking-wider text-[#8FB3A3]">
              Personal balance
            </div>

            <div className="font-display mt-1 text-4xl font-bold">
              S${personalBalance.toFixed(2)}
            </div>

            <div className="mt-1 text-xs text-[#8FB3A3]">
              +S${totalIncome.toFixed(2)} received recently
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#E8A02C] bg-[#0A3227]">
            <Wallet className="h-6 w-6 text-[#E8A02C]" />
          </div>
        </div>

        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-[#0A3227]">
          <div
            className="bg-[#E8A02C] transition-all duration-500"
            style={{
              width: `${savedPercentageOfBalance}%`,
            }}
          />

          <div
            className="bg-[#8FB3A3] transition-all duration-500"
            style={{
              width: `${availablePercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="font-mono-custom text-[#E8A02C]">
              ■ SAVED
            </div>

            <div className="font-display mt-0.5 text-lg font-bold">
              S${activeGoal.currentAmount.toFixed(2)}
            </div>

            <div className="text-[#8FB3A3]">
              For {activeGoal.title}
            </div>
          </div>

          <div>
            <div className="font-mono-custom text-[#B9D2C7]">
              ■ AVAILABLE
            </div>

            <div className="font-display mt-0.5 text-lg font-bold">
              S${availableForOtherThings.toFixed(2)}
            </div>

            <div className="text-[#8FB3A3]">
              For other things
            </div>
          </div>
        </div>
      </section>

      {/* Goal card */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#F0E0C2] bg-[#FFFDF8] p-5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">
            {activeGoal.categoryIcon}
          </span>

          <span className="font-mono-custom text-[11px] font-bold uppercase tracking-wider text-[#9A7420]">
            Saving for: {activeGoal.title}
          </span>
        </div>

        <div className="mx-auto mt-4 h-40 w-36 overflow-hidden rounded-2xl rounded-b-[54px] border-[3px] border-[#1B1815] bg-[#FDF6E9]">
          <div className="relative h-full">
            <div
              className={`absolute inset-x-0 bottom-0 transition-all duration-700 ${
                isGoalReached
                  ? "bg-[#0F4635]"
                  : "bg-[#E8A02C]"
              }`}
              style={{
                height: `${savingsPercentage}%`,
              }}
            />

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-[#1B1815]">
              <span className="font-display text-2xl font-bold">
                S${activeGoal.currentAmount.toFixed(2)}
              </span>

              <span className="font-mono-custom text-[10px]">
                of S${activeGoal.targetAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 font-display text-sm font-bold text-[#9A7420]">
          {isGoalReached
            ? "Goal completed!"
            : `S$${remainingAmount.toFixed(2)} remaining`}
        </div>

        {isGoalReached ? (
          <button
            type="button"
            onClick={handleClaimAndPurchase}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F4635] px-4 py-3 text-sm font-bold text-[#FBF6EC]"
          >
            <ShoppingBag className="h-4 w-4" />
            Mark as purchased
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-[#8A8075]">
              Choose how much to allocate to this goal
            </p>

            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 8, 10].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAddSavings(amount)}
                  disabled={
                    amount > availableForOtherThings
                  }
                  className="rounded-xl border border-[#E0D4BF] bg-[#FBF6EC] py-2 text-xs font-bold text-[#1B1815] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +S${amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {isCelebratingPurchase && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0F4635]/95 text-[#FBF6EC]">
            <Trophy className="h-12 w-12 text-[#E8A02C]" />

            <div className="mt-2 font-display text-xl font-bold">
              Goal completed!
            </div>
          </div>
        )}
      </section>

      {/* Other goals */}
      {wishlistGoals.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Gift className="h-4 w-4 text-[#9A7420]" />

            <h2 className="font-display text-sm font-bold text-[#1B1815]">
              Other goals
            </h2>
          </div>

          {wishlistGoals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleSwitchGoal(goal)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E0D4BF] bg-[#FFFDF8] p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {goal.categoryIcon}
                </span>

                <div>
                  <div className="text-xs font-bold text-[#1B1815]">
                    {goal.title}
                  </div>

                  <div className="text-[10px] text-[#8A8075]">
                    {goal.notes}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#0F4635]">
                S${goal.targetAmount.toFixed(2)}
              </span>
            </button>
          ))}
        </section>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-sm font-bold text-[#1B1815]">
            Completed goals
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-2xl bg-[#DDE8E1] p-3"
              >
                <div className="text-xl">
                  {goal.categoryIcon}
                </div>

                <div className="text-xs font-bold text-[#0F4635]">
                  {goal.title}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Target className="h-4 w-4 text-[#0F4635]" />

          <h2 className="font-display text-sm font-bold text-[#1B1815]">
            {currentMember.name}&apos;s recent activity
          </h2>
        </div>

        <DependentActivityFeed
          transactions={dependentTransactions}
        />
      </section>

      <SetSavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSaveGoal={handleSaveGoal}
        currentGoal={activeGoal}
      />
    </div>
  );
};