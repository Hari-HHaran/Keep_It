"use client";

import React, { useState } from "react";
import { AppState } from "@/lib/types";
import {
  Check,
  ChevronRight,
  Eye,
  Send,
} from "lucide-react";

interface HouseholdMembersListProps {
  state: AppState;
  onSendPocketMoney: (
    dependentId: string,
    amount: number
  ) => void;
  onViewDependent?: (
    dependentId: string
  ) => void;
}

export const HouseholdMembersList: React.FC<
  HouseholdMembersListProps
> = ({
  state,
  onSendPocketMoney,
  onViewDependent,
}) => {
  const [
    sentAllowanceMemberId,
    setSentAllowanceMemberId,
  ] = useState<string | null>(null);

  const managers = state.members.filter(
    (member) =>
      member.role === "manager" ||
      member.role === "co_manager"
  );

  const dependents = state.members.filter(
    (member) => member.role === "dependent"
  );

  const allowanceRecipient = dependents.find(
    (dependent) =>
      dependent.id === sentAllowanceMemberId
  );

  const handleQuickAllowance = (
    event: React.MouseEvent,
    memberId: string
  ) => {
    event.stopPropagation();

    onSendPocketMoney(memberId, 10);

    setSentAllowanceMemberId(memberId);

    window.setTimeout(() => {
      setSentAllowanceMemberId(null);
    }, 2500);
  };

  return (
    <div className="space-y-3 font-sans animate-fadeIn">
      {/* Success message */}
      {allowanceRecipient && (
        <div
          role="status"
          aria-live="polite"
          className="animate-pop flex items-center gap-3 rounded-2xl border border-[#0F4635]/20 bg-[#DDE8E1] p-3 text-[#0F4635] shadow-sm"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F4635] text-[#FBF6EC]">
            <Check className="h-4 w-4" />
          </div>

          <div>
            <div className="text-xs font-bold">
              Allowance sent successfully
            </div>

            <div className="text-[11px] text-[#2C5A49]">
              S$10.00 was added to{" "}
              {allowanceRecipient.name}&apos;s
              personal balance.
            </div>
          </div>
        </div>
      )}

      {/* Heading */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-base font-bold text-[#1B1815]">
            Who&apos;s in it
          </h2>

          <p className="text-xs text-[#8A8075]">
            {managers.length} manager
            {managers.length !== 1 ? "s" : ""} •{" "}
            {dependents.length} dependent
            {dependents.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Managers */}
      <div className="space-y-2">
        <div className="font-mono-custom px-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#8A8075]">
          Managers • Equal Access
        </div>

        {managers.map((manager) => (
          <div
            key={manager.id}
            className="space-y-2 rounded-[18px] border border-[#EDE4D6] bg-[#FFFDF8] p-3.5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
                  manager.role === "manager"
                    ? "bg-[#0F4635] text-[#FBF6EC]"
                    : "bg-[#E8A02C] text-[#1B1815]"
                }`}
              >
                {manager.avatarText ||
                  manager.name.slice(0, 1)}
              </span>

              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold text-[#1B1815]">
                  {manager.name}

                  {manager.role === "manager" && (
                    <span className="text-xs font-normal text-[#8A8075]">
                      {" "}
                      · you
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#8A8075]">
                  Singpass verified •{" "}
                  {manager.workerType ===
                  "platform_worker"
                    ? "Platform worker"
                    : "Salaried"}
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-[#DDE8E1] px-2.5 py-1 text-[10.5px] font-semibold text-[#0F4635]">
                Full access
              </span>
            </div>

            {manager.workerType ===
              "platform_worker" && (
              <div className="font-mono-custom flex flex-wrap gap-1.5 border-t border-[#F1E7D8] pt-2 text-[10px]">
                <span className="rounded-md bg-[#F5EAD6] px-2 py-0.5 font-semibold text-[#9A7420]">
                  CPF
                </span>

                <span className="rounded-md bg-[#F5EAD6] px-2 py-0.5 font-semibold text-[#9A7420]">
                  WORKFARE
                </span>

                <span className="rounded-md bg-[#F5EAD6] px-2 py-0.5 font-semibold text-[#9A7420]">
                  PCTS
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dependents */}
      <div className="space-y-2 pt-1">
        <div className="font-mono-custom flex items-center justify-between px-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#8A8075]">
          <span>Dependents • Tap to view</span>

          <span className="font-bold text-[#0F4635]">
            Tap profile ›
          </span>
        </div>

        {dependents.length === 0 ? (
          <div className="rounded-2xl border border-[#EDE4D6] bg-[#FFFDF8] p-5 text-center">
            <p className="text-xs font-bold text-[#1B1815]">
              No dependents added
            </p>

            <p className="mt-1 text-[11px] text-[#8A8075]">
              Dependents will appear here after they
              are added to the household.
            </p>
          </div>
        ) : (
          dependents.map((dependent) => (
            <div
              key={dependent.id}
              className="group space-y-2.5 rounded-[18px] border border-[#EDE4D6] bg-[#FFFDF8] p-3.5 shadow-sm transition hover:border-[#0F4635] hover:bg-[#F9F4EB]"
            >
              <button
                type="button"
                onClick={() =>
                  onViewDependent?.(dependent.id)
                }
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D7442A] font-display text-sm font-bold text-[#FBF6EC] transition-transform group-hover:scale-105">
                  {dependent.avatarText ||
                    dependent.name.slice(0, 1)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#1B1815] transition group-hover:text-[#0F4635]">
                    <span>{dependent.name}</span>

                    <span className="text-xs font-normal text-[#8A8075]">
                      · age {dependent.age || "—"}
                    </span>
                  </div>

                  <div className="truncate text-[11px] text-[#8A8075]">
                    {dependent.savingsGoal
                      ? `Saving for ${dependent.savingsGoal.title}`
                      : "No savings goal"}{" "}
                    • Balance: S$
                    {(
                      dependent.personalBalance || 0
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="shrink-0 rounded-full bg-[#F1E7D8] px-2.5 py-1 text-[10.5px] font-semibold text-[#6B6259]">
                    Own money only
                  </span>

                  <ChevronRight className="h-4 w-4 text-[#8A8075]" />
                </div>
              </button>

              <div className="text-xs leading-relaxed text-[#6B6259]">
                {dependent.name} cannot see the
                household total or private accounts.{" "}
                {dependent.name} can see their own
                pocket money, spending and savings
                goals.
              </div>

              <div className="flex items-center gap-2 border-t border-[#F1E7D8] pt-2">
                <button
                  type="button"
                  onClick={(event) =>
                    handleQuickAllowance(
                      event,
                      dependent.id
                    )
                  }
                  disabled={
                    sentAllowanceMemberId ===
                    dependent.id
                  }
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0F4635] px-3 py-1.5 text-xs font-semibold text-[#FBF6EC] shadow-xs transition hover:bg-[#0A3227] disabled:opacity-70"
                >
                  {sentAllowanceMemberId ===
                  dependent.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Sent S$10!
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send S$10
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onViewDependent?.(dependent.id)
                  }
                  className="flex flex-1 items-center justify-end gap-1 text-right text-[11px] font-semibold text-[#0F4635] hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" />

                  View {dependent.name}&apos;s screen
                  ›
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};