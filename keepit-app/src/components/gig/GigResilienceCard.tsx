"use client";

import React, { useState } from "react";
import { GigProfile, VehicleType } from "@/lib/types";
import { calculateNetGigIncome, calculateSafeWeeklySalary } from "@/lib/calculations/gigCalculator";
import { Bike, Shield, Sparkles, CheckCircle2 } from "lucide-react";

interface GigResilienceCardProps {
  gigProfile?: GigProfile;
}

export const GigResilienceCard: React.FC<GigResilienceCardProps> = ({ gigProfile }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(
    gigProfile?.vehicleType || "motorcycle_pmd"
  );
  const [weeklyGrossInput, setWeeklyGrossInput] = useState<number>(
    gigProfile?.grossWeeklyAverage || 850
  );

  const netCalc = calculateNetGigIncome(weeklyGrossInput, selectedVehicle);
  const safeSalary = calculateSafeWeeklySalary([
    weeklyGrossInput - 100,
    weeklyGrossInput + 50,
    weeklyGrossInput + 120,
    weeklyGrossInput - 30,
    weeklyGrossInput,
  ]);

  return (
    <div className="space-y-3 font-sans animate-fadeIn">
      {/* Header matching Screen 03 */}
      <div className="px-1">
        <div className="inline-flex items-center gap-1.5 bg-[#DDE8E1] text-[#0F4635] px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F4635]"></span>
          Platform worker • Motorcycle
        </div>
        <h2 className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
          What you actually keep
        </h2>
        <div className="text-xs text-[#8A8075]">
          August 2026 • 14 payout days
        </div>
      </div>

      {/* Main Bar Chart Comparison Card (Exact Screen 03) */}
      <div className="bg-[#FFFDF8] border border-[#EDE4D6] rounded-[22px] p-5 shadow-sm space-y-4">
        {/* Visual Columns Bar */}
        <div className="flex items-end justify-between gap-3 h-44 pb-2 border-b border-[#EDE4D6]">
          {/* Gross */}
          <div className="flex-1 flex flex-col items-center h-full justify-end">
            <span className="font-display font-bold text-xs text-[#1B1815] mb-1">1,860</span>
            <div className="w-full bg-[#0F4635] rounded-t-md h-[140px] animate-grow" />
            <span className="text-[9px] font-mono-custom text-[#8A8075] uppercase text-center mt-1.5 leading-tight">
              Gross Payout
            </span>
          </div>

          {/* FEDA */}
          <div className="flex-1 flex flex-col items-center h-full justify-end">
            <span className="font-display font-bold text-xs text-[#D7442A] mb-1">−630</span>
            <div className="w-full bg-[#D7442A] rounded-t-md h-[55px]" />
            <span className="text-[9px] font-mono-custom text-[#8A8075] uppercase text-center mt-1.5 leading-tight">
              FEDA (35%)
            </span>
          </div>

          {/* CPF */}
          <div className="flex-1 flex flex-col items-center h-full justify-end">
            <span className="font-display font-bold text-xs text-[#9A7420] mb-1">−146</span>
            <div className="w-full bg-[#E8A02C] rounded-t-md h-[18px]" />
            <span className="text-[9px] font-mono-custom text-[#8A8075] uppercase text-center mt-1.5 leading-tight">
              CPF Contrib
            </span>
          </div>

          {/* Spendable */}
          <div className="flex-1 flex flex-col items-center h-full justify-end">
            <span className="font-display font-bold text-xs text-[#0F4635] mb-1">1,084</span>
            <div className="w-full bg-[#0F4635] rounded-t-md h-[88px]" />
            <span className="text-[9px] font-mono-custom text-[#0F4635] font-bold uppercase text-center mt-1.5 leading-tight">
              Spendable
            </span>
          </div>
        </div>

        <div className="text-xs text-[#6B6259] leading-relaxed">
          Motorcycle FED is <strong className="text-[#1B1815]">35% of gross</strong> — you don't pay CPF on that. Your bank shows S$1,860. Only S$1,084 is yours to spend.
        </div>
      </div>

      {/* Pay Yourself Weekly Card (Exact Screen 03) */}
      <div className="bg-[#0F4635] rounded-[22px] p-5 text-[#FBF6EC] shadow-md space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10.5px] font-mono-custom uppercase tracking-wider text-[#8FB3A3]">
              Pay yourself weekly
            </div>
            <div className="font-display font-bold text-3xl text-[#FBF6EC]">
              S$260<span className="text-sm font-normal opacity-70">/wk</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono-custom text-[#8FB3A3]">12-WK AVG</div>
            <div className="font-display font-bold text-sm text-[#E8A02C]">S$271</div>
          </div>
        </div>

        {/* Buffer Bar */}
        <div>
          <div className="flex justify-between text-xs text-[#8FB3A3] mb-1.5 font-medium">
            <span>Buffer built from good weeks</span>
            <span className="text-[#E8A02C] font-bold">S$412 / S$520</span>
          </div>
          <div className="h-2 rounded-full bg-[#1B3A30] overflow-hidden">
            <div className="h-full bg-[#E8A02C] rounded-full w-[79%]" />
          </div>
          <div className="text-[11px] text-[#8FB3A3] mt-1.5">
            Covers 1.6 lean weeks. Two more good weeks and you're at a full month buffer.
          </div>
        </div>
      </div>
    </div>
  );
};
