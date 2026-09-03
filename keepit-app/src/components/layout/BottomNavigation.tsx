"use client";

import React from "react";
import { Wallet, Ticket, MapPin, Users, Plus, Camera, Layers, Trophy } from "lucide-react";

export type NavTabType = "home" | "ledger" | "map" | "schemes" | "family" | "gig" | "goals";

interface BottomNavigationProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenReceiptOcr: () => void;
  isDependent: boolean;
  isGigWorker: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenReceiptOcr,
  isDependent,
  isGigWorker,
}) => {
  if (isDependent) {
    return (
      <div className="sticky bottom-0 z-40 w-full bg-[#FFFDF8] border-t border-[#F0E0C2] py-2 px-4 shadow-sm">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* My Money */}
          <button
            onClick={() => onSelectTab("home")}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === "home"
                ? "text-[#E8A02C] font-bold"
                : "text-[#C4B7A2] hover:text-[#9A7420]"
            }`}
          >
            <div className={`w-5 h-5 rounded-md mb-0.5 ${activeTab === "home" ? "bg-[#E8A02C]" : "border-2 border-[#C4B7A2]"}`} />
            <span className="text-[10px] font-semibold tracking-tight">My money</span>
          </button>

          {/* Goal */}
          <button
            onClick={() => onSelectTab("goals")}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === "goals"
                ? "text-[#E8A02C] font-bold"
                : "text-[#C4B7A2] hover:text-[#9A7420]"
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight">Goal</span>
          </button>

          {/* Map / Stalls */}
          <button
            onClick={() => onSelectTab("map")}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              activeTab === "map"
                ? "text-[#E8A02C] font-bold"
                : "text-[#C4B7A2] hover:text-[#9A7420]"
            }`}
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight">Stalls</span>
          </button>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-28 h-1 bg-[#1B1815]/20 rounded-full mx-auto mt-2" />
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-40 w-full bg-[#FFFDF8] border-t border-[#EDE4D6] py-1.5 px-3 shadow-md">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Home */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            activeTab === "home"
              ? "text-[#0F4635] font-bold"
              : "text-[#A39889] hover:text-[#1B1815]"
          }`}
        >
          <div className={`w-4 h-4 rounded-[4px] mb-0.5 ${activeTab === "home" ? "bg-[#0F4635]" : "border-2 border-[#A39889]"}`} />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </button>

        {/* 2. Ledger */}
        <button
          onClick={() => onSelectTab("ledger")}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            activeTab === "ledger"
              ? "text-[#0F4635] font-bold"
              : "text-[#A39889] hover:text-[#1B1815]"
          }`}
        >
          <div className={`w-4 h-4 rounded-[3px] mb-0.5 ${activeTab === "ledger" ? "bg-[#0F4635]" : "border-2 border-[#A39889]"}`} />
          <span className="text-[10px] font-medium tracking-tight">Ledger</span>
        </button>

        {/* 3. Center Camera OCR FAB (+) */}
        <div className="relative -top-2.5">
          <button
            onClick={onOpenReceiptOcr}
            className="w-11 h-11 rounded-2xl bg-[#E8A02C] hover:bg-[#D9911F] text-[#1B1815] font-bold text-xl flex items-center justify-center shadow-md active:scale-95 transition border-2 border-[#FFFDF8]"
            title="Scan Receipt OCR"
          >
            +
          </button>
        </div>

        {/* 4. Map & Stalls (Feature requested by user!) */}
        <button
          onClick={() => onSelectTab("map")}
          className={`flex flex-col items-center py-1 px-2.5 transition relative ${
            activeTab === "map"
              ? "text-[#0F4635] font-bold"
              : "text-[#A39889] hover:text-[#1B1815]"
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Map</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#E8A02C]" />
        </button>

        {/* 5. Schemes / Vouchers */}
        <button
          onClick={() => onSelectTab("schemes")}
          className={`flex flex-col items-center py-1 px-2.5 transition ${
            activeTab === "schemes"
              ? "text-[#0F4635] font-bold"
              : "text-[#A39889] hover:text-[#1B1815]"
          }`}
        >
          <div className={`w-4 h-4 rounded-full mb-0.5 ${activeTab === "schemes" ? "bg-[#0F4635]" : "border-2 border-[#A39889]"}`} />
          <span className="text-[10px] font-medium tracking-tight">Schemes</span>
        </button>
      </div>

      {/* iOS Home Indicator */}
      <div className="w-28 h-1 bg-[#1B1815]/20 rounded-full mx-auto mt-1.5" />
    </div>
  );
};
