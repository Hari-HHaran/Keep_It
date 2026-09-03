"use client";

import React, { useEffect, useState } from "react";
import { AppState, LocationMerchant } from "@/lib/types";
import {
  getSeedStateForPersona,
  loadSavedState,
  saveState,
} from "@/lib/storage";

import { Header } from "@/components/layout/Header";
import { MobileContainer } from "@/components/layout/MobileContainer";
import {
  BottomNavigation,
  NavTabType,
} from "@/components/layout/BottomNavigation";

import { ManagerDashboard } from "@/components/manager/ManagerDashboard";
import { DependentDashboard } from "@/components/dependent/DependentDashboard";
import { VoucherMapScreen } from "@/components/map/VoucherMapScreen";

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<NavTabType>("home");

  const [
    isViewingDependentAsManager,
    setIsViewingDependentAsManager,
  ] = useState(false);

  // Stores exactly which dependent the manager selected.
  const [selectedDependentId, setSelectedDependentId] =
    useState<string | null>(null);

  useEffect(() => {
    const initialState = loadSavedState("tan_family");
    setAppState(initialState);
  }, []);

  if (!appState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EDE4D6] text-[#6B6259]">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0F4635] border-t-transparent" />

          <p className="font-mono-custom text-xs">
            Opening KeepIt Vessel...
          </p>
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
    setSelectedDependentId(null);
    setIsOcrOpen(false);
  };

  const handleResetData = () => {
    const resetState = getSeedStateForPersona(
      appState.currentPersonaId
    );

    setAppState(resetState);
    saveState(resetState);

    setActiveTab("home");
    setIsViewingDependentAsManager(false);
    setSelectedDependentId(null);
    setIsOcrOpen(false);
  };

  const handleUpdateState = (newState: AppState) => {
    setAppState(newState);
    saveState(newState);
  };

  const handleSelectLocation = (
    merchant: LocationMerchant | null
  ) => {
    const updatedState: AppState = {
      ...appState,
      currentSimulatedLocation: merchant,
    };

    handleUpdateState(updatedState);
  };

  // Store the selected dependent before opening their dashboard.
  const handleViewDependent = (dependentId: string) => {
    const dependentExists = appState.members.some(
      (member) =>
        member.id === dependentId &&
        member.role === "dependent"
    );

    if (!dependentExists) {
      console.error(
        `Dependent with ID ${dependentId} was not found.`
      );
      return;
    }

    setSelectedDependentId(dependentId);
    setIsViewingDependentAsManager(true);
    setActiveTab("home");
  };

  const handleReturnToManager = () => {
    setIsViewingDependentAsManager(false);
    setSelectedDependentId(null);
    setActiveTab("home");
  };

  const isNativeDependentPersona =
    appState.currentPersonaId === "jia_le";

  const shouldRenderDependentScreen =
    isNativeDependentPersona ||
    isViewingDependentAsManager;

  const isGigWorker =
    appState.currentPersonaId === "marcus_gig" ||
    appState.gigProfile !== undefined;

  const isNotHome =
    activeTab !== "home" ||
    isViewingDependentAsManager;

  const handleHeaderBack = () => {
    if (isViewingDependentAsManager) {
      handleReturnToManager();
      return;
    }

    setActiveTab("home");
  };

  return (
    <MobileContainer>
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

      <div className="flex-1 overflow-y-auto bg-[#FBF6EC]">
        {activeTab === "map" ? (
          <VoucherMapScreen
            vouchers={appState.vouchers}
            onSelectSimulatedLocation={
              handleSelectLocation
            }
          />
        ) : shouldRenderDependentScreen ? (
          <DependentDashboard
            state={appState}
            onUpdateState={handleUpdateState}
            selectedDependentId={
              isViewingDependentAsManager
                ? selectedDependentId
                : null
            }
            isManagerViewing={
              isViewingDependentAsManager
            }
            onReturnToManager={handleReturnToManager}
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

      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setIsViewingDependentAsManager(false);
          setSelectedDependentId(null);
          setActiveTab(tab);
        }}
        onOpenReceiptOcr={() => setIsOcrOpen(true)}
        isDependent={
          isNativeDependentPersona &&
          !isViewingDependentAsManager
        }
        isGigWorker={isGigWorker}
      />
    </MobileContainer>
  );
}