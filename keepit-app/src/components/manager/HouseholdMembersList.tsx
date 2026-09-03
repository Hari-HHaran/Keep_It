"use client";

import React, { useState } from "react";
import { AppState, HouseholdMember } from "@/lib/types";
import { Plus, Send, Check, ChevronRight, Eye } from "lucide-react";

interface HouseholdMembersListProps {
  state: AppState;
  onSendPocketMoney: (dependentId: string, amount: number) => void;
  onViewDependent?: (dependentId: string) => void;
}

export const HouseholdMembersList: React.FC<HouseholdMembersListProps> = ({
  state,
  onSendPocketMoney,
  onViewDependent,
}) => {
  const [sentAllowanceMemberId, setSentAllowanceMemberId] = useState<string | null>(null);

  const handleQuickAllowance = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    onSendPocketMoney(memberId, 10.00);
    setSentAllowanceMemberId(memberId);
    setTimeout(() => {
      setSentAllowanceMemberId(null);
    }, 2000);
  };

  const dependents = state.members.filter((m) => m.role === "dependent");
  const managers = state.members.filter((m) => m.role === "manager" || m.role === "co_manager");

  return (
    <div className="space-y-3 font-sans animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display font-bold text-base text-[#1B1815]">
            Who's in it
          </h2>
          <p className="text-xs text-[#8A8075]">
            {managers.length} managers • {dependents.length} dependent{dependents.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Managers Section */}
      <div className="space-y-2">
        <div className="text-[10.5px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold px-1">
          Managers • Equal Access
        </div>

        {managers.map((m) => (
          <div
            key={m.id}
            className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[18px] p-3.5 shadow-sm space-y-2"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                  m.role === "manager"
                    ? "bg-[#0F4635] text-[#FBF6EC]"
                    : "bg-[#E8A02C] text-[#1B1815]"
                }`}
              >
                {m.avatarText || m.name.slice(0, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-[#1B1815]">
                  {m.name} {m.role === "manager" && <span className="text-xs font-normal text-[#8A8075]">· you</span>}
                </div>
                <div className="text-[11px] text-[#8A8075]">
                  Singpass verified • {m.workerType === "platform_worker" ? "Platform worker" : "Salaried"}
                </div>
              </div>
              <span className="bg-[#DDE8E1] text-[#0F4635] font-semibold text-[10.5px] px-2.5 py-1 rounded-full shrink-0">
                Full access
              </span>
            </div>

            {m.workerType === "platform_worker" && (
              <div className="flex gap-1.5 pt-2 border-t border-[#F1E7D8] flex-wrap text-[10px] font-mono-custom">
                <span className="bg-[#F5EAD6] text-[#9A7420] px-2 py-0.5 rounded-md font-semibold">CPF</span>
                <span className="bg-[#F5EAD6] text-[#9A7420] px-2 py-0.5 rounded-md font-semibold">WORKFARE</span>
                <span className="bg-[#F5EAD6] text-[#9A7420] px-2 py-0.5 rounded-md font-semibold">PCTS</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dependents Section (Clickable to open Dependent Dashboard!) */}
      <div className="space-y-2 pt-1">
        <div className="text-[10.5px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold px-1 flex items-center justify-between">
          <span>Dependents • Tap to view dashboard</span>
          <span className="text-[#0F4635] font-bold">Tap profile ›</span>
        </div>

        {dependents.map((dep) => (
          <div
            key={dep.id}
            onClick={() => {
              if (onViewDependent) onViewDependent(dep.id);
            }}
            className="bg-[#FFFDF8] hover:bg-[#F9F4EB] border border-[#EDE4D6] hover:border-[#0F4635] rounded-[18px] p-3.5 shadow-sm space-y-2.5 cursor-pointer active:scale-[0.99] transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#D7442A] text-[#FBF6EC] font-display font-bold text-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {dep.avatarText || dep.name.slice(0, 1)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-sm text-[#1B1815] group-hover:text-[#0F4635] transition flex items-center gap-1.5">
                  <span>{dep.name}</span>
                  <span className="text-xs font-normal text-[#8A8075]">· age {dep.age || 11}</span>
                </div>
                <div className="text-[11px] text-[#8A8075]">
                  {dep.savingsGoal ? `Saving for a ${dep.savingsGoal.title}` : "Pocket money ledger"} • Balance: S${dep.personalBalance?.toFixed(2) || "47.50"}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="bg-[#F1E7D8] text-[#6B6259] font-semibold text-[10.5px] px-2.5 py-1 rounded-full shrink-0">
                  Own money only
                </span>
                <ChevronRight className="w-4 h-4 text-[#8A8075] group-hover:text-[#0F4635] group-hover:translate-x-0.5 transition" />
              </div>
            </div>

            <div className="text-xs text-[#6B6259] leading-relaxed pt-1">
              {dep.name} cannot see the household total or private debt. {dep.name} <strong className="text-[#1B1815]">can</strong> see personal pocket money and active savings goals.
            </div>

            <div className="pt-2 border-t border-[#F1E7D8] flex items-center gap-2">
              <button
                onClick={(e) => handleQuickAllowance(e, dep.id)}
                className="py-1.5 px-3 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-[#FBF6EC] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                {sentAllowanceMemberId === dep.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Sent S$10!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send S$10 PayNow</span>
                  </>
                )}
              </button>

              <div className="flex-1 text-right text-[11px] text-[#0F4635] font-semibold group-hover:underline flex items-center justify-end gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>View {dep.name}'s Screen ›</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
