"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppState, GovernmentVoucher, HouseholdMember, LocationMerchant, SavingsGoal, Transaction } from "@/lib/types";
import { loadSavedState, getSeedStateForPersona, saveState, addTransactionToState, redeemVoucherInState, claimNewVoucherInState } from "@/lib/storage";
import { fetchHousehold, createTransaction, redeemVoucher, claimVoucher, saveGoal, depositGoal, addDependentMember } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNavigation, NavTabType } from "@/components/layout/BottomNavigation";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";
import { DependentDashboard } from "@/components/dependent/DependentDashboard";
import { VoucherMapScreen } from "@/components/map/VoucherMapScreen";
import { ReceiptOcrModal } from "@/components/ledger/ReceiptOcrModal";
import { ParsedReceipt } from "@/lib/ocr/receiptScanner";

export default function Home() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTabType>("home");
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const refreshFromBackend = useCallback(async () => {
    const result = await fetchHousehold();
    result.state.backendMode = "supabase";
    setAppState(result.state);
    saveState(result.state);
    return result.state;
  }, []);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const result = await fetchHousehold();
        if (!active) return;
        result.state.backendMode = "supabase";
        setAppState(result.state);
        saveState(result.state);
      } catch (caught) {
        if (!active) return;
        const demoAllowed = localStorage.getItem("keepit_demo_mode") === "true";
        if (demoAllowed) {
          const demo = loadSavedState();
          demo.backendMode = "demo";
          setAppState(demo);
          setBackendError(caught instanceof Error ? caught.message : "Backend unavailable");
        } else {
          router.replace("/login");
        }
      }
    }
    initialise();
    return () => { active = false; };
  }, [router]);

  if (!appState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EDE4D6] text-[#6B6259]">
        <div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0F4635] border-t-transparent" /><p className="mt-3 text-xs">Loading your KeepIt household…</p></div>
      </div>
    );
  }

  const isLive = appState.backendMode === "supabase";

  const updateLocal = (state: AppState) => {
    setAppState(state);
    saveState(state);
  };

  const runLiveMutation = async (action: () => Promise<unknown>) => {
    setSyncing(true);
    setBackendError("");
    try {
      await action();
      await refreshFromBackend();
    } catch (caught) {
      setBackendError(caught instanceof Error ? caught.message : "Unable to sync change.");
      throw caught;
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectPersona = (personaId: string) => {
    if (isLive) return;
    const nextState = getSeedStateForPersona(personaId);
    nextState.backendMode = "demo";
    updateLocal(nextState);
    setActiveTab("home");
    setSelectedDependentId(null);
  };

  const handleResetData = () => {
    if (isLive) {
      refreshFromBackend().catch(() => setBackendError("Unable to refresh backend data."));
      return;
    }
    const reset = getSeedStateForPersona(appState.currentPersonaId);
    reset.backendMode = "demo";
    updateLocal(reset);
    setSelectedDependentId(null);
  };

  const handleCreateTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (isLive) {
      await runLiveMutation(() => createTransaction(transaction));
    } else {
      const result = addTransactionToState(appState, transaction);
      updateLocal({ ...result.state, backendMode: "demo" });
    }
  };

  const handleRedeemVoucher = async (voucherId: string, amount: number) => {
    if (isLive) {
      await runLiveMutation(() => redeemVoucher(voucherId, amount));
    } else {
      updateLocal({ ...redeemVoucherInState(appState, voucherId, amount), backendMode: "demo" });
    }
  };

  const handleClaimVoucher = async (voucher: GovernmentVoucher) => {
    if (isLive) {
      await runLiveMutation(() => claimVoucher(voucher));
    } else {
      updateLocal({ ...claimNewVoucherInState(appState, voucher), backendMode: "demo" });
    }
  };

  const handleSaveGoal = async (memberId: string, goal: SavingsGoal) => {
    if (isLive) await runLiveMutation(() => saveGoal(memberId, goal));
  };

  const handleDepositGoal = async (memberId: string, goalId: string, amount: number) => {
    if (isLive) await runLiveMutation(() => depositGoal(memberId, goalId, amount));
  };

  const handleAddDependent = async (
    dependent: Omit<HouseholdMember, "id">,
    goal?: Omit<SavingsGoal, "id">
  ) => {
    if (isLive) {
      await runLiveMutation(() =>
        addDependentMember({
          name: dependent.name,
          age: dependent.age || 11,
          personalBalance: dependent.personalBalance || 0,
          savingsGoal: goal,
        })
      );
    } else {
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
      updateLocal({
        ...appState,
        members: [...appState.members, newMember],
        backendMode: "demo",
      });
    }
  };

  const handleSelectLocation = (merchant: LocationMerchant | null) => {
    updateLocal({ ...appState, currentSimulatedLocation: merchant });
  };

  const nativeDependent = appState.members.find((member) => member.id === appState.currentMemberId && member.role === "dependent");
  const isNativeDependentPersona = appState.currentPersonaId === "jia_le" || Boolean(nativeDependent);
  const shouldRenderDependentScreen = isNativeDependentPersona || Boolean(selectedDependentId);
  const dependentId = selectedDependentId || nativeDependent?.id || appState.members.find((member) => member.role === "dependent")?.id;
  const isGigWorker = appState.currentPersonaId === "marcus_gig" || appState.gigProfile !== undefined;
  const isNotHome = activeTab !== "home" || Boolean(selectedDependentId);

  const handleHeaderBack = () => {
    if (selectedDependentId) setSelectedDependentId(null);
    else setActiveTab("home");
  };

  const receiptToTransaction = (receipt: ParsedReceipt): Omit<Transaction, "id"> => ({
    date: "Just now",
    description: receipt.merchantName,
    amount: -receipt.totalAmount,
    category: receipt.category,
    source: "Cash Receipt",
    memberId: appState.currentMemberId || appState.members[0]?.id || "mem-meiling",
    opportunityCostNote: receipt.suggestedVoucherCategory
      ? `${receipt.suggestedVoucherCategory.replace("_", " ")} vouchers may cover this expense.`
      : undefined,
  });

  return (
    <MobileContainer>
      <Header
        state={appState}
        activeTab={isNotHome ? "ledger" : "home"}
        onSelectTab={(tab) => tab === "home" ? handleHeaderBack() : setActiveTab(tab)}
        onSelectPersona={handleSelectPersona}
        onResetData={handleResetData}
        isLiveBackend={isLive}
      />

      {(backendError || syncing) && (
        <div className={`px-4 py-2 text-center text-[10px] font-semibold ${backendError ? "bg-[#FAE3DD] text-[#8F2A17]" : "bg-[#DDE8E1] text-[#0F4635]"}`}>
          {syncing ? "Syncing securely with Supabase…" : `Demo fallback active: ${backendError}`}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-[#FBF6EC]">
        {activeTab === "map" ? (
          <VoucherMapScreen vouchers={appState.vouchers} onSelectSimulatedLocation={handleSelectLocation} />
        ) : shouldRenderDependentScreen && dependentId ? (
          <DependentDashboard
            state={appState}
            dependentId={dependentId}
            onUpdateState={updateLocal}
            onSaveGoal={handleSaveGoal}
            onDepositGoal={handleDepositGoal}
            isManagerViewing={Boolean(selectedDependentId)}
            onReturnToManager={() => setSelectedDependentId(null)}
          />
        ) : (
          <ManagerDashboard
            state={appState}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onUpdateState={updateLocal}
            onCreateTransaction={handleCreateTransaction}
            onRedeemVoucher={handleRedeemVoucher}
            onAddVoucher={handleClaimVoucher}
            onAddDependent={handleAddDependent}
            onSelectLocation={handleSelectLocation}
            onViewDependent={setSelectedDependentId}
            isOcrOpen={isOcrOpen}
            setIsOcrOpen={setIsOcrOpen}
          />
        )}
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={(tab) => { setSelectedDependentId(null); setActiveTab(tab); }}
        onOpenReceiptOcr={() => setIsOcrOpen(true)}
        isDependent={isNativeDependentPersona && !selectedDependentId}
        isGigWorker={isGigWorker}
      />

      <ReceiptOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirmReceipt={(receipt) => { handleCreateTransaction(receiptToTransaction(receipt)).catch(() => undefined); }}
      />
    </MobileContainer>
  );
}
