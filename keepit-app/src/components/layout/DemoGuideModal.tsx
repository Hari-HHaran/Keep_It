"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Play, ChevronRight, Award, Compass } from "lucide-react";

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (personaId: string) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const DEMO_STEPS = [
    {
      title: "Step 1: The Tan Family (Consolidated Ledger & Voucher Fragmentation)",
      personaId: "tan_family",
      personaName: "Mei Ling (Tan Household Manager)",
      speakerScript:
        "“Good afternoon judges. Meet Mei Ling from the Tan household. Post-Seedly shutdown, her family had money scattered across DBS, OCBC, PayNow, and government portals. With KeepIt, all accounts flow into one ledger. Notice she holds $612 in vouchers across CDC, Climate, and SG60 schemes with a clear 12-day expiry warning.”",
      action: "Click to load Tan Family persona and inspect the high-level dashboard.",
      badge: "Features 1 & 3",
    },
    {
      title: "Step 2: Contextual Opportunity Cost Nudge & OCR",
      personaId: "tan_family",
      personaName: "Mei Ling",
      speakerScript:
        "“Watch what happens when Mei Ling logs a $24.50 grocery receipt. KeepIt's OCR instantly parses the receipt, logs it, and immediately fires an Opportunity Cost Nudge: 'You spent $24.50 in cash when you have $85 in expiring CDC vouchers!' This teaches financial literacy at the exact moment of decision.”",
      action: "Click 'Scan Receipt' or add a grocery transaction to trigger the live alert.",
      badge: "Features 1 & 4",
    },
    {
      title: "Step 3: Location-Based Radar & Spend Pacing (Feature 6)",
      personaId: "tan_family",
      personaName: "Mei Ling",
      speakerScript:
        "“When Mei Ling is near Tampines Mall, KeepIt's location radar triggers a proximity card: 'FairPrice nearby accepts your CDC vouchers.' Even better, our spend pacing engine calculates she needs to spend $14.15/week to prevent forfeiture before December 31st.”",
      action: "Click the 'Radar' button in the header or location card to switch locations.",
      badge: "Feature 6",
    },
    {
      title: "Step 4: Two-Way Transparency for Dependent (Jia Le)",
      personaId: "jia_le",
      personaName: "Jia Le (Age 11 Dependent)",
      speakerScript:
        "“Unlike restrictive parental-control apps, KeepIt provides genuine two-way transparency. Let's switch to 11-year-old Jia Le's phone. He cannot see his parents' total savings or private bills. Instead, he sees his personal pocket money ($47.50), his $60 goal for a new game, and his canteen expenses, building positive savings habits.”",
      action: "Switch to Jia Le persona to see the dedicated child dashboard.",
      badge: "Feature 5",
    },
    {
      title: "Step 5: Marcus (Platform Worker CPF, FEDA & Workfare)",
      personaId: "marcus_gig",
      personaName: "Marcus (Lalamove Gig Worker)",
      speakerScript:
        "“Finally, meet Marcus, a 24-year-old Lalamove delivery driver. Under the 2025 Platform Workers Act, KeepIt applies a 35% Fixed Expense Deduction (FEDA) and CPF to calculate true take-home pay. It smooths his erratic income into a safe $540/week salary while saving a $310 buffer, and tracks his monthly $180 Workfare (WIS) payout (10% cash / 90% MediSave) in the same scheme view.”",
      action: "Switch to Marcus to showcase the Gig Resilience & Workfare Engine.",
      badge: "Feature 2",
    },
  ];

  const step = DEMO_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1722] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#131c2a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Hackathon Demo Pitch Guide
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Step {currentStep + 1} of {DEMO_STEPS.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive walkthrough for your 3-minute hackathon presentation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {step.badge}
            </span>
            <span className="text-xs text-slate-400">
              Active Persona: <strong className="text-slate-200">{step.personaName}</strong>
            </span>
          </div>

          <h3 className="text-base font-bold text-white text-emerald-400">
            {step.title}
          </h3>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed relative">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              Suggested Pitch Script (Read to Judges):
            </div>
            <p className="italic text-slate-300">{step.speakerScript}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
            <div>
              <strong className="text-white block mb-0.5">Recommended Demo Action:</strong>
              {step.action}
            </div>
            <button
              onClick={() => {
                onSelectPersona(step.personaId);
              }}
              className="ml-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow shrink-0 transition"
            >
              Switch & Apply
            </button>
          </div>
        </div>

        {/* Modal Footer / Navigation */}
        <div className="p-4 border-t border-slate-800 bg-[#131c2a] flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous Step
          </button>

          <div className="flex space-x-1.5">
            {DEMO_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-emerald-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {currentStep < DEMO_STEPS.length - 1 ? (
            <button
              onClick={() => {
                const next = currentStep + 1;
                setCurrentStep(next);
                onSelectPersona(DEMO_STEPS[next].personaId);
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-lg shadow-emerald-600/20 transition"
            >
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow transition"
            >
              Ready to Demo! <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
