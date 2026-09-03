"use client";

import React from "react";
import { Users, Bike, UserCheck, Sparkles, Baby } from "lucide-react";

interface PersonaSwitcherProps {
  currentPersonaId: string;
  onSelectPersona: (personaId: string) => void;
}

export const PERSONAS = [
  {
    id: "tan_family",
    title: "Tan Family (Manager)",
    subtitle: "Mei Ling & Wei Han + Child",
    role: "manager",
    icon: Users,
    tag: "Lower-Income Family",
    highlight: "Ledger + $612 Vouchers + Allowance",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "marcus_gig",
    title: "Marcus (Platform Gig)",
    subtitle: "Lalamove Rider (Age 24)",
    role: "manager",
    icon: Bike,
    tag: "Gig Worker (FEDA & WIS)",
    highlight: "35% FEDA + Safe Salary + WIS Split",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    id: "jia_le",
    title: "Jia Le (Dependent)",
    subtitle: "Child Dependent (Age 11)",
    role: "dependent",
    icon: Baby,
    tag: "Two-Way Transparency",
    highlight: "$47.50 Balance + Game Savings Goal",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "alex_young_adult",
    title: "Alex (Young Adult)",
    subtitle: "First Job (Age 26)",
    role: "manager",
    icon: UserCheck,
    tag: "Solo Regular Earner",
    highlight: "Base Ledger + Voucher Tracker",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
];

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  currentPersonaId,
  onSelectPersona,
}) => {
  return (
    <div className="w-full bg-[#0c121a] border-b border-slate-800 py-2.5 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Interactive Hackathon Personas:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = currentPersonaId === p.id;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p.id)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-all border ${
                  isSelected
                    ? "bg-slate-800 text-white border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div
                  className={`p-1 rounded-md ${
                    isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate flex items-center justify-between">
                    <span>{p.title.split(" ")[0]}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {p.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
