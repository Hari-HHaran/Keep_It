"use client";

import React from "react";
import { Transaction } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, Sparkles, Utensils, Gift, BookOpen } from "lucide-react";

interface DependentActivityFeedProps {
  transactions: Transaction[];
}

export const DependentActivityFeed: React.FC<DependentActivityFeedProps> = ({
  transactions,
}) => {
  return (
    <div className="rounded-2xl bg-[#0e1520] border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Recent Activity
          </h3>
          <p className="text-xs text-slate-400">
            Your pocket money, snacks, and allowances
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0;

          return (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {tx.description}
                  </div>
                  <div className="text-xs text-slate-400">
                    {tx.date}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm font-extrabold ${
                  isIncome ? "text-emerald-400" : "text-slate-300"
                }`}
              >
                {isIncome ? "+" : "-"}
                ${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
