"use client";

import React, { useState } from "react";
import { AppState, BankAccount, GovernmentVoucher, HouseholdMember, LocationMerchant, SavingsGoal, Transaction } from "@/lib/types";
import { AccountSummaryCard } from "./AccountSummaryCard";
import { LinkedAccountsList } from "./LinkedAccountsList";
import { HouseholdMembersList } from "./HouseholdMembersList";
import { RecentTransactions } from "./RecentTransactions";
import { AccountDetailModal } from "./AccountDetailModal";
import { AddDependentModal } from "./AddDependentModal";
import { VoucherHub } from "../vouchers/VoucherHub";
import { VoucherMapScreen } from "../map/VoucherMapScreen";
import { GigResilienceCard } from "../gig/GigResilienceCard";
import { WisTrackerCard } from "../gig/WisTrackerCard";
import { OpportunityCostBanner } from "../nudges/OpportunityCostBanner";
import { AddTransactionModal } from "../ledger/AddTransactionModal";
import { ReceiptOcrModal } from "../ledger/ReceiptOcrModal";
import { ParsedReceipt } from "@/lib/ocr/receiptScanner";
import { addTransactionToState, redeemVoucherInState, claimNewVoucherInState } from "@/lib/storage";
import { NavTabType } from "../layout/BottomNavigation";

interface ManagerDashboardProps {
  state: AppState;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onUpdateState: (newState: AppState) => void;
  onSelectLocation: (location: LocationMerchant | null) => void;
  onViewDependent: (dependentId: string) => void;
  /** Persists a transaction to Supabase via /api/ledger. */
  onCreateTransaction?: (tx: Omit<Transaction, "id">) => Promise<void> | void;
  /** Persists a voucher redemption via /api/vouchers. */
  onRedeemVoucher?: (voucherId: string, amount: number) => Promise<void> | void;
  /** Persists a newly claimed voucher via /api/vouchers. */
  onAddVoucher?: (voucher: GovernmentVoucher) => Promise<void> | void;
<<<<<<< Updated upstream
=======
  /** Persists a new dependent member. */
  onAddDependent?: (dependent: Omit<HouseholdMember, "id">, goal?: Omit<SavingsGoal, "id">) => Promise<void> | void;
>>>>>>> Stashed changes
  isOcrOpen: boolean;
  setIsOcrOpen: (open: boolean) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  state,
  activeTab,
  onSelectTab,
  onUpdateState,
  onSelectLocation,
  onViewDependent,
  onCreateTransaction,
  onRedeemVoucher,
  onAddVoucher,
<<<<<<< Updated upstream
=======
  onAddDependent: propOnAddDependent,
>>>>>>> Stashed changes
  isOcrOpen,
  setIsOcrOpen,
}) => {
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddDependentOpen, setIsAddDependentOpen] = useState(false);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<BankAccount | null>(null);

  // Persistent Nudge Dismissal across component unmounts and navigations
  const dismissedIds = state.dismissedNudgeIds || [];
  const activeNudge = state.nudges.find((n) => !dismissedIds.includes(n.id)) || null;

  const handleDismissNudge = (nudgeId: string) => {
    const updatedDismissed = Array.from(new Set([...dismissedIds, nudgeId]));
    const nextState: AppState = {
      ...state,
      dismissedNudgeIds: updatedDismissed,
    };
    onUpdateState(nextState);
  };

  const handleAddTransaction = (tx: Omit<Transaction, "id">) => {
    if (onCreateTransaction) {
      void onCreateTransaction(tx);
      return;
    }
    const { state: nextState } = addTransactionToState(state, tx);
    onUpdateState(nextState);
  };

  const handleConfirmOcrReceipt = (receipt: ParsedReceipt) => {
    const tx: Omit<Transaction, "id"> = {
      date: "Just now",
      description: receipt.merchantName,
      amount: -receipt.totalAmount,
      category: receipt.category,
      source: "Cash Receipt",
      memberId: state.members[0]?.id || "",
      opportunityCostNote: receipt.suggestedVoucherCategory === "CDC_Supermarket"
        ? "CDC Supermarket vouchers could have covered this cash expense!"
        : undefined,
    };

    if (onCreateTransaction) {
      void onCreateTransaction(tx);
      return;
    }
    const { state: nextState } = addTransactionToState(state, tx);
    onUpdateState(nextState);
  };

  const handleRedeemVoucher = (voucherId: string, amount: number) => {
    if (onRedeemVoucher) {
      void onRedeemVoucher(voucherId, amount);
      return;
    }
    const nextState = redeemVoucherInState(state, voucherId, amount);
    onUpdateState(nextState);
  };

  const handleAddVoucher = (voucher: GovernmentVoucher) => {
    if (onAddVoucher) {
      void onAddVoucher(voucher);
      return;
    }
    const nextState = claimNewVoucherInState(state, voucher);
    onUpdateState(nextState);
  };

  const handleAddDependent = async (
    dependent: Omit<HouseholdMember, "id">,
    goal?: Omit<SavingsGoal, "id">
  ) => {
    if (propOnAddDependent) {
      await propOnAddDependent(dependent, goal);
      return;
    }

    const newDepId = `dep-${Date.now()}`;
    const newMember: HouseholdMember = {
      ...dependent,
      id: newDepId,
      savingsGoal: goal
        ? {
            ...goal,
            id: `goal-${Date.now()}`,
          }
        : undefined,
    };

    const nextState: AppState = {
      ...state,
      members: [...state.members, newMember],
    };
    onUpdateState(nextState);
  };

  const handleSendPocketMoney = (dependentId: string, amount: number) => {
    const tx: Omit<Transaction, "id"> = {
      date: "Just now",
      description: `Pocket money to ${state.members.find((m) => m.id === dependentId)?.name || "dependent"} (PayNow)`,
      amount: -amount,
      category: "Pocket Money",
      source: "PayNow",
      recipientId: dependentId,
<<<<<<< Updated upstream
      memberId: state.members[0]?.id || state.members[0]?.id || "",
=======
      memberId: state.members[0]?.id || "",
>>>>>>> Stashed changes
    };

    if (onCreateTransaction) {
      void onCreateTransaction(tx);
      return;
    }
    const { state: nextState } = addTransactionToState(state, tx);
    onUpdateState(nextState);
  };

  const isMarcusGigPersona = state.gigProfile !== undefined;

  // Map view tab
  if (activeTab === "map") {
    return (
      <VoucherMapScreen
        vouchers={state.vouchers}
        onSelectSimulatedLocation={onSelectLocation}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fadeIn font-sans">
      {/* 1. Home Tab: Complete Vessel Dashboard */}
      {activeTab === "home" && (
        <>
          {/* Literacy Opportunity Cost Alert */}
          {activeNudge && (
            <OpportunityCostBanner
              nudge={activeNudge}
              onDismiss={() => handleDismissNudge(activeNudge.id)}
              onNavigateToSchemes={() => {
                handleDismissNudge(activeNudge.id);
                onSelectTab("schemes");
              }}
            />
          )}

          <AccountSummaryCard
            state={state}
            onNavigateToSchemes={() => onSelectTab("schemes")}
            onViewDependent={onViewDependent}
          />

          <LinkedAccountsList
            state={state}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onOpenReceiptOcr={() => setIsOcrOpen(true)}
            onSelectAccount={setSelectedAccountForDetail}
          />

          {isMarcusGigPersona && (
            <div className="space-y-3">
              <GigResilienceCard gigProfile={state.gigProfile} />
              <WisTrackerCard gigProfile={state.gigProfile} />
            </div>
          )}

          <HouseholdMembersList
            state={state}
            onSendPocketMoney={handleSendPocketMoney}
            onViewDependent={onViewDependent}
            onOpenAddDependent={() => setIsAddDependentOpen(true)}
          />

          <RecentTransactions
            state={state}
            onOpenReceiptOcr={() => setIsOcrOpen(true)}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
          />
        </>
      )}

      {/* 2. Ledger Tab */}
      {activeTab === "ledger" && (
        <div className="space-y-3">
          <RecentTransactions
            state={state}
            onOpenReceiptOcr={() => setIsOcrOpen(true)}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
          />

          <LinkedAccountsList
            state={state}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onOpenReceiptOcr={() => setIsOcrOpen(true)}
            onSelectAccount={setSelectedAccountForDetail}
          />
        </div>
      )}

      {/* 3. Schemes Tab */}
      {activeTab === "schemes" && (
        <VoucherHub
          state={state}
          onRedeemVoucher={handleRedeemVoucher}
          onAddVoucher={handleAddVoucher}
          onSelectLocation={onSelectLocation}
        />
      )}

      {/* 4. Family Tab */}
      {activeTab === "family" && (
        <HouseholdMembersList
          state={state}
          onSendPocketMoney={handleSendPocketMoney}
          onViewDependent={onViewDependent}
          onOpenAddDependent={() => setIsAddDependentOpen(true)}
        />
      )}

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        state={state}
        onAddTransaction={handleAddTransaction}
      />

      <ReceiptOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirmReceipt={handleConfirmOcrReceipt}
      />

      <AccountDetailModal
        isOpen={Boolean(selectedAccountForDetail)}
        onClose={() => setSelectedAccountForDetail(null)}
        account={selectedAccountForDetail}
        state={state}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      <AddDependentModal
        isOpen={isAddDependentOpen}
        onClose={() => setIsAddDependentOpen(false)}
        onAddDependent={handleAddDependent}
      />
    </div>
  );
};
