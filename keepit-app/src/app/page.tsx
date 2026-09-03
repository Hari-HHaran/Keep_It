"use client";

import React, { useState, useEffect } from "react";
import { AppState, LocationMerchant } from "@/lib/types";
import { loadSavedState, getSeedStateForPersona, saveState } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNavigation, NavTabType } from "@/components/layout/BottomNavigation";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";
import { DependentDashboard } from "@/components/dependent/DependentDashboard";
import { VoucherMapScreen } from "@/components/map/VoucherMapScreen";
import { ReceiptOcrModal } from "@/components/ledger/ReceiptOcrModal";

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabType>("home");
  const [isViewingDependentAsManager, setIsViewingDependentAsManager] = useState(false);

  useEffect(() => {
    const initial = loadSavedState("tan_family");
    setAppState(initial);
  }, []);

  if (!appState) {
    return (
      <div className="min-h-screen bg-[#EDE4D6] flex items-center justify-center text-[#6B6259]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-[#0F4635] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono-custom">Opening KeepIt Vessel...</p>
        </div>
      </div>
    );
  }

  const handleSelectPersona = (personaId: string) => {
    const newState = getSeedStateForPersona(personaId);
    setAppState(newState);
    saveState(newState);
    setActiveTab("home");
    setIsViewingDependentAsManager(false);
  };

  const handleResetData = () => {
    const reset = getSeedStateForPersona(appState.currentPersonaId);
    setAppState(reset);
    saveState(reset);
    setIsViewingDependentAsManager(false);
  };

  const handleUpdateState = (newState: AppState) => {
    setAppState(newState);
    saveState(newState);
  };

  const handleSelectLocation = (merchant: LocationMerchant | null) => {
    const updated = {
      ...appState,
      currentSimulatedLocation: merchant,
    };
    setAppState(updated);
    saveState(updated);
  };

  const handleViewDependent = (dependentId: string) => {
    setIsViewingDependentAsManager(true);
  };

  const isNativeDependentPersona = appState.currentPersonaId === "jia_le";
  const shouldRenderDependentScreen = isNativeDependentPersona || isViewingDependentAsManager;
  const isGigWorker = appState.currentPersonaId === "marcus_gig" || appState.gigProfile !== undefined;

  // Header Back Button Logic
  const isNotHome = activeTab !== "home" || isViewingDependentAsManager;

  const handleHeaderBack = () => {
    if (isViewingDependentAsManager) {
      setIsViewingDependentAsManager(false);
    } else {
      setActiveTab("home");
    }
  };

  return (
    <MobileContainer>
      {/* Top Header with Back Button and Profile Switcher */}
      <Header
        state={appState}
        activeTab={isNotHome ? "ledger" : "home"}
        onSelectTab={(tab) => {
          if (tab === "home") {
            handleHeaderBack();
          } else {
            setActiveTab(tab);
          }
        }}
        onSelectPersona={handleSelectPersona}
        onResetData={handleResetData}
      />

      {/* Main Screen Content */}
      <div className="flex-1 overflow-y-auto bg-[#FBF6EC]">
        {activeTab === "map" ? (
          <VoucherMapScreen
            vouchers={appState.vouchers}
            onSelectSimulatedLocation={handleSelectLocation}
          />
        ) : shouldRenderDependentScreen ? (
          <DependentDashboard
            state={appState}
            onUpdateState={handleUpdateState}
            isManagerViewing={isViewingDependentAsManager}
            onReturnToManager={() => setIsViewingDependentAsManager(false)}
          />
        ) : (
          <ManagerDashboard
            state={appState}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onUpdateState={handleUpdateState}
            onSelectLocation={handleSelectLocation}
            onViewDependent={handleViewDependent}
            isOcrOpen={isOcrOpen}
            setIsOcrOpen={setIsOcrOpen}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setIsViewingDependentAsManager(false);
          setActiveTab(tab);
        }}
        onOpenReceiptOcr={() => setIsOcrOpen(true)}
        isDependent={isNativeDependentPersona && !isViewingDependentAsManager}
        isGigWorker={isGigWorker}
      />

      {/* Camera OCR Scanner Modal */}
      <ReceiptOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirmReceipt={(receipt) => {
          const newTx = {
            id: `tx-${Date.now()}`,
            date: "Just now",
            description: receipt.merchantName,
            amount: -receipt.totalAmount,
            category: receipt.category,
            source: "Cash Receipt" as const,
            memberId: appState.members[0]?.id || "mem-meiling",
            opportunityCostNote: "CDC Supermarket vouchers could have covered this cash expense!",
          };

          const updatedState = {
            ...appState,
            totalHouseholdBalance: appState.totalHouseholdBalance - receipt.totalAmount,
            thisMonthsSpend: appState.thisMonthsSpend + receipt.totalAmount,
            transactions: [newTx, ...appState.transactions],
          };

          setAppState(updatedState);
          saveState(updatedState);
        }}
      />
    </MobileContainer>
  );
}
