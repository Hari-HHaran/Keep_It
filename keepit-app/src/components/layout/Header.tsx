"use client";

import React, { useState } from "react";
import { AppState } from "@/lib/types";
import { ChevronDown, ArrowLeft, Users, Bike, Baby, UserCheck } from "lucide-react";
import { NavTabType } from "./BottomNavigation";

interface HeaderProps {
  state: AppState;
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onSelectPersona: (personaId: string) => void;
  onResetData: () => void;
  isLiveBackend?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeTab,
  onSelectTab,
  onSelectPersona,
  onResetData,
  isLiveBackend = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const PROFILES = [
    {
      id: "tan_family",
      name: "Tan Household",
      role: "Mei Ling (Manager)",
      tag: "Family Ledger",
      icon: Users,
    },
    {
      id: "marcus_gig",
      name: "Marcus L.",
      role: "Platform Worker",
      tag: "FEDA & Workfare",
      icon: Bike,
    },
    {
      id: "jia_le",
      name: "Jia Le",
      role: "Dependent (Age 11)",
      tag: "Pocket Money & Goal",
      icon: Baby,
    },
    {
      id: "alex_young_adult",
      name: "Alex",
      role: "Young Adult",
      tag: "Single Earner",
      icon: UserCheck,
    },
  ];

  const managerMember = state.members.find((member) => member.id === state.currentMemberId) || state.members.find((m) => m.role === "manager" || m.role === "co_manager") || state.members[0];

  const currentProfile = {
    id: state.currentPersonaId,
    name: state.householdName || "My Household",
    role: managerMember ? `${managerMember.name} (${managerMember.role})` : "Household Member",
    tag: isLiveBackend ? "Supabase Synced" : "Local Household",
    icon: Users,
  };

  const isNotHome = activeTab !== "home";

  return (
    <header className="w-full bg-[#FBF6EC] border-b border-[#EDE4D6] px-4 py-2.5 z-40 relative">
      <div className="flex items-center justify-between">
        {/* Left: If not on home, show prominent Back Button; otherwise show Brand */}
        {isNotHome ? (
          <button
            onClick={() => onSelectTab("home")}
            className="flex items-center space-x-1.5 py-1 px-2.5 -ml-1 rounded-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] border border-[#E0D4BF] text-[#1B1815] transition shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F4635] group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-display font-bold text-xs">Back</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2.5">
            {/* Animated Vessel Logo */}
            <div className="w-8 h-8 rounded-lg rounded-b-xl bg-[#0F4635] relative overflow-hidden shrink-0 shadow-sm">
              <div className="absolute left-0 right-0 bottom-0 h-[56%] bg-[#E8A02C]"></div>
              <div className="absolute -left-[20%] -right-[20%] bottom-[50%] h-2 bg-[#E8A02C] rounded-full"></div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-black text-lg tracking-tight text-[#1B1815]">
                  KeepIt
                </span>
                <span className="text-[9px] font-mono-custom uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#DDE8E1] text-[#0F4635]">
                  {isLiveBackend ? "Synced" : "Demo"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Clean Profile / Household Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E0D4BF] hover:bg-[#F5F1E7] transition shadow-sm text-left"
          >
            <div className="w-6 h-6 rounded-full bg-[#0F4635] text-[#FBF6EC] font-bold text-[10px] flex items-center justify-center">
              {currentProfile.name.slice(0, 1)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#1B1815] leading-tight">
                {currentProfile.name}
              </div>
              <div className="text-[10px] text-[#8A8075]">
                {currentProfile.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A8075]" />
          </button>

          {/* Switcher Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#FFFDF8] border border-[#D6C9B4] rounded-2xl shadow-xl p-1.5 z-50 animate-slideDown space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold">
                {isLiveBackend ? "Connected household" : "Switch demo profile"}
              </div>

              {!isLiveBackend && PROFILES.map((p) => {
                const Icon = p.icon;
                const isSelected = p.id === state.currentPersonaId;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl flex items-center space-x-2.5 text-left transition ${
                      isSelected
                        ? "bg-[#0F4635] text-[#FBF6EC]"
                        : "hover:bg-[#F5F1E7] text-[#1B1815]"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-[#E8A02C] text-[#1B1815]"
                          : "bg-[#EDE4D6] text-[#584F45]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{p.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-[#DDE8E1]" : "text-[#8A8075]"
                        }`}
                      >
                        {p.role} • {p.tag}
                      </div>
                    </div>
                  </button>
                );
              })}

              {isLiveBackend && (
                <>
                  <button
                    onClick={() => {
                      onResetData();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full rounded-xl px-2.5 py-2 text-left text-xs font-bold text-[#0F4635] hover:bg-[#F5F1E7]"
                  >
                    Resync data
                  </button>
                  <button
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      localStorage.removeItem("keepit_demo_mode");
                      window.location.href = "/login";
                    }}
                    className="w-full rounded-xl px-2.5 py-2 text-left text-xs font-bold text-[#8F2A17] hover:bg-[#FAE3DD]"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
