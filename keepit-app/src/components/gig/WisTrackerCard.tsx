"use client";

import React, { useState } from "react";
import { GigProfile } from "@/lib/types";

interface WisTrackerCardProps {
  gigProfile?: GigProfile;
}

export const WisTrackerCard: React.FC<WisTrackerCardProps> = ({ gigProfile }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(8); // August 26

  const MONTHS = [
    { name: "Oct 25", status: "landed", mark: "✓" },
    { name: "Nov 25", status: "landed", mark: "✓" },
    { name: "Dec 25", status: "missing", mark: "!" },
    { name: "Jan 26", status: "landed", mark: "✓" },
    { name: "Feb 26", status: "landed", mark: "✓" },
    { name: "Mar 26", status: "missing", mark: "!" },
    { name: "Apr 26", status: "landed", mark: "✓" },
    { name: "May 26", status: "landed", mark: "✓" },
    { name: "Jun 26", status: "landed", mark: "✓" },
    { name: "Jul 26", status: "missing", mark: "!" },
    { name: "Aug 26", status: "landed", mark: "✓" },
    { name: "Sep 26", status: "pending", mark: "·" },
  ];

  const m = MONTHS[selectedMonthIndex];

  return (
    <div className="space-y-3 font-sans animate-fadeIn">
      {/* Header matching Screen 05 */}
      <div className="px-1">
        <h2 className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
          Did it land?
        </h2>
        <p className="text-xs text-[#6B6259]">
          Workfare is paid monthly and quietly. Nobody tells you when it doesn't arrive.
        </p>
      </div>

      {/* 3 Stat Badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0F4635] text-[#FBF6EC] rounded-2xl p-3 text-center shadow-sm">
          <div className="font-display font-bold text-2xl">8</div>
          <div className="text-[9.5px] font-mono-custom text-[#8FB3A3] mt-0.5">LANDED</div>
        </div>

        <div className="bg-[#FAE3DD] text-[#8F2A17] rounded-2xl p-3 text-center shadow-sm">
          <div className="font-display font-bold text-2xl">3</div>
          <div className="text-[9.5px] font-mono-custom text-[#B2543C] mt-0.5">MISSING</div>
        </div>

        <div className="bg-[#F5EAD6] text-[#9A7420] rounded-2xl p-3 text-center shadow-sm">
          <div className="font-display font-bold text-xl">S$372</div>
          <div className="text-[9.5px] font-mono-custom text-[#9A7420] mt-0.5">UNCLAIMED</div>
        </div>
      </div>

      {/* 12-Month Calendar Grid (Screen 05) */}
      <div className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[22px] p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[#1B1815]">Oct 2025 — Sep 2026</span>
          <span className="text-[10px] font-mono-custom text-[#8A8075]">WORK YEAR</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((month, i) => {
            const isSelected = selectedMonthIndex === i;
            const isLanded = month.status === "landed";
            const isMissing = month.status === "missing";

            return (
              <button
                key={month.name}
                onClick={() => setSelectedMonthIndex(i)}
                className={`py-2 px-1 rounded-xl text-center transition border ${
                  isSelected
                    ? "ring-2 ring-[#E8A02C] border-[#0F4635]"
                    : "border-transparent"
                } ${
                  isLanded
                    ? "bg-[#0F4635] text-[#FBF6EC]"
                    : isMissing
                    ? "bg-[#FAE3DD] text-[#8F2A17] border-[#D7442A]/30"
                    : "bg-[#FBF6EC] text-[#8A8075] border-[#D6C9B4]"
                }`}
              >
                <div className="font-display font-bold text-sm leading-tight">
                  {month.mark}
                </div>
                <div className="text-[9px] font-mono-custom mt-1 opacity-90">
                  {month.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#EDE4D6] text-[10px] text-[#6B6259]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-[#0F4635]"></span> Landed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-[#FAE3DD] border border-[#D7442A]"></span> Missing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs border border-[#D6C9B4]"></span> Pending
          </span>
        </div>
      </div>

      {/* Selected Month Detail Card */}
      <div className="animate-slideDown">
        {m.status === "landed" ? (
          <div className="bg-[#DDE8E1] rounded-2xl p-4 text-xs text-[#2C5A49] space-y-1">
            <div className="font-display font-bold text-sm text-[#0F4635] flex items-center gap-1.5">
              <span>✓ {m.name} landed</span>
            </div>
            <p className="leading-relaxed">
              S$186.50 • S$74.60 cash to DBS ••4821, S$111.90 to MediSave. Matched against your ledger automatically.
            </p>
          </div>
        ) : m.status === "missing" ? (
          <div className="bg-[#FAE3DD] rounded-2xl p-4 text-xs text-[#8F2A17] space-y-2">
            <div className="font-display font-bold text-sm flex items-center gap-1.5">
              <span>! {m.name} never arrived</span>
            </div>
            <p className="text-[#B2543C] leading-relaxed">
              Nothing hit your account and nothing hit MediSave. Usually this means your platform didn't declare that month's earnings.
            </p>
            <button
              onClick={() => alert("Simulated: Preparing inquiry draft to CPF Board / MOM.")}
              className="w-full py-2 rounded-xl bg-[#D7442A] hover:bg-[#B2371F] text-[#FBF6EC] font-bold text-xs shadow-sm transition"
            >
              Raise it with CPF Board
            </button>
          </div>
        ) : (
          <div className="bg-[#F5EAD6] rounded-2xl p-4 text-xs text-[#9A7420] space-y-1">
            <div className="font-display font-bold text-sm">
              • {m.name} still due
            </div>
            <p className="leading-relaxed">
              Expected around the 28th. We'll watch your ledger and notify you the moment it lands.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
