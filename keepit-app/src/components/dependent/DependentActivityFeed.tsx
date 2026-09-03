"use client";

import React, { useState } from "react";
import { Transaction } from "@/lib/types";

interface DependentActivityFeedProps {
  transactions: Transaction[];
}

export const DependentActivityFeed: React.FC<
  DependentActivityFeedProps
> = ({ transactions }) => {
  const [filterCategory, setFilterCategory] =
    useState<string>("All");

  const categories = [
    "All",
    "Pocket Money",
    "Groceries",
    "Hawker & Dining",
    "Transport",
    "Other",
  ];

  const filteredTransactions =
    filterCategory === "All"
      ? transactions
      : transactions.filter(
          (transaction) =>
            transaction.category === filterCategory
        );

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-1 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilterCategory(category)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
              filterCategory === category
                ? "bg-[#0F4635] text-[#FBF6EC]"
                : "border border-[#E0D4BF] bg-[#FFFDF8] text-[#6B6259]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-1 rounded-2xl border border-[#E0D4BF] bg-[#FFFDF8] p-2 shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="p-5 text-center">
            <p className="text-xs font-bold text-[#1B1815]">
              No activity in this category
            </p>

            <p className="mt-1 text-[10px] text-[#8A8075]">
              Future transactions will appear here.
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const isIncome = transaction.amount > 0;

            const isPocketMoney =
              transaction.category === "Pocket Money";

            const isCashReceipt =
              transaction.source === "Cash Receipt";

            const badge = isPocketMoney
              ? "PN"
              : isCashReceipt
              ? "$"
              : transaction.source === "PayNow"
              ? "PN"
              : "BANK";

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-3 rounded-xl p-2.5 transition hover:bg-[#F5F1E7]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`font-mono-custom flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${
                      isIncome || isPocketMoney
                        ? "bg-[#DDE8E1] text-[#0F4635]"
                        : isCashReceipt
                        ? "bg-[#F5EAD6] text-[#9A7420]"
                        : "bg-[#EDE4D6] text-[#584F45]"
                    }`}
                  >
                    {badge}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#1B1815]">
                      {transaction.description}
                    </div>

                    <div className="truncate text-[10px] text-[#8A8075]">
                      {transaction.source} •{" "}
                      {transaction.category} •{" "}
                      {transaction.date}
                    </div>
                  </div>
                </div>

                <div
                  className={`shrink-0 font-display text-xs font-bold ${
                    isIncome
                      ? "text-[#0F4635]"
                      : "text-[#1B1815]"
                  }`}
                >
                  {isIncome ? "+" : "−"}S$
                  {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};