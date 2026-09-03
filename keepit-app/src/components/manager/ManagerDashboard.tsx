"use client";

import React, { useState } from "react";
import { AppState, GovernmentVoucher, LocationMerchant, Transaction } from "@/lib/types";
import { AccountSummaryCard } from "./AccountSummaryCard";
import { LinkedAccountsList } from "./LinkedAccountsList";
import { HouseholdMembersList } from "./HouseholdMembersList";
import { RecentTransactions } from "./RecentTransactions";
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
  isOcrOpen,
  setIsOcrOpen,
}) => {
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

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
      memberId: state.members[0]?.id || "mem-meiling",
      opportunityCostNote: receipt.suggestedVoucherCategory === "CDC_Supermarket"
        ? "CDC Supermarket vouchers could have covered this cash expense!"
        : undefined,
    };

    const { state: nextState } = addTransactionToState(state, tx);
    onUpdateState(nextState);
  };

  const handleRedeemVoucher = (voucherId: string, amount: number) => {
    const nextState = redeemVoucherInState(state, voucherId, amount);
    onUpdateState(nextState);
  };

  const handleAddVoucher = (voucher: GovernmentVoucher) => {
    const nextState = claimNewVoucherInState(state, voucher);
    onUpdateState(nextState);
  };

  const handleSendPocketMoney = (dependentId: string, amount: number) => {
    const tx: Omit<Transaction, "id"> = {
      date: "Just now",
      description: "Pocket money to Jia Le (PayNow)",
      amount: -amount,
      category: "Pocket Money",
      source: "PayNow",
      recipientId: dependentId,
      memberId: state.members[0]?.id || "mem-meiling",
    };

    const { state: nextState } = addTransactionToState(state, tx);
    onUpdateState(nextState);
  };

  const isMarcusGigPersona = state.currentPersonaId === "marcus_gig" || state.gigProfile !== undefined;

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
          {/* Literacy Opportunity Cost Alert (Hidden once dismissed on Home, flagged under Schemes) */}
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
    </div>
  );
};
