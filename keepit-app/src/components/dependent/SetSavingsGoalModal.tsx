"use client";

import React, { useState } from "react";
import { SavingsGoal } from "@/lib/types";
import { X, Sparkles, Plus, Target, Check } from "lucide-react";

interface SetSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: SavingsGoal) => void;
  currentGoal?: SavingsGoal;
}

const PRESET_GOALS = [
  {
    title: "Wilson NCAA Basketball",
    categoryIcon: "🏀",
    categoryName: "Sports",
    targetAmount: 60.00,
    notes: "For weekend games at Bedok South CC",
  },
  {
    title: "Pokemon Legends Game",
    categoryIcon: "🎮",
    categoryName: "Gaming",
    targetAmount: 79.00,
    notes: "Nintendo Switch physical cartridge",
  },
  {
    title: "Nike Running Shoes",
    categoryIcon: "👟",
    categoryName: "Fashion & Sports",
    targetAmount: 95.00,
    notes: "Junior running shoes for PE and track",
  },
  {
    title: "Wireless Earbuds",
    categoryIcon: "🎧",
    categoryName: "Tech",
    targetAmount: 45.00,
    notes: "For listening to music and school podcasts",
  },
  {
    title: "Manga & Book Boxset",
    categoryIcon: "📚",
    categoryName: "Books",
    targetAmount: 38.00,
    notes: "Complete box set from Kinokuniya",
  },
  {
    title: "Pro Skateboard Deck",
    categoryIcon: "🛹",
    categoryName: "Sports",
    targetAmount: 55.00,
    notes: "Maple deck from Somerset skate shop",
  },
];

const EMOJI_OPTIONS = ["🏀", "🎮", "👟", "🎧", "📚", "🛹", "🎨", "🚲", "🧸", "⌚", "🎸", "💻"];

export const SetSavingsGoalModal: React.FC<SetSavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  currentGoal,
}) => {
  const [title, setTitle] = useState(currentGoal?.title || "Wilson NCAA Basketball");
  const [targetAmount, setTargetAmount] = useState<string>(currentGoal?.targetAmount ? currentGoal.targetAmount.toString() : "60");
  const [categoryIcon, setCategoryIcon] = useState(currentGoal?.categoryIcon || "🏀");
  const [notes, setNotes] = useState(currentGoal?.notes || "Saved from weekly pocket money");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleSelectPreset = (index: number) => {
    const p = PRESET_GOALS[index];
    setSelectedPresetIndex(index);
    setTitle(p.title);
    setTargetAmount(p.targetAmount.toString());
    setCategoryIcon(p.categoryIcon);
    setNotes(p.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(targetAmount) || 60;

    const newGoal: SavingsGoal = {
      id: currentGoal?.id || `goal-${Date.now()}`,
      title: title.trim() || "My Savings Goal",
      targetAmount: amountNum,
      currentAmount: currentGoal?.currentAmount || 0,
      categoryIcon: categoryIcon || "🎯",
      categoryName: "Wishlist Item",
      notes: notes.trim(),
      isCompleted: false,
    };

    onSaveGoal(newGoal);
    onClose();
  };

  const parsedAmount = parseFloat(targetAmount) || 0;
  const estimatedWeeks = parsedAmount > 0 ? Math.ceil(parsedAmount / 8) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#FFFDF8] border border-[#E0D4BF] rounded-[28px] max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE4D6] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5EAD6] text-[#9A7420] flex items-center justify-center font-bold">
              🎯
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1B1815]">
                Set Your Dream Goal
              </h3>
              <p className="text-[11px] text-[#8A8075]">
                Pick an item to save your pocket money for
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8A8075] hover:bg-[#EDE4D6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Presets Carousel / Grid */}
        <div className="space-y-2">
          <label className="text-[10.5px] font-mono-custom uppercase tracking-wider text-[#8A8075] font-semibold">
            Quick Wishlist Ideas
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GOALS.map((preset, idx) => {
              const isSelected = selectedPresetIndex === idx;

              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded-2xl border text-left transition ${
                    isSelected
                      ? "bg-[#0F4635] text-[#FBF6EC] border-[#0F4635] shadow-xs"
                      : "bg-[#FBF6EC] border-[#EDE4D6] hover:border-[#0F4635]/40 text-[#1B1815]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{preset.categoryIcon}</span>
                    <span className={`font-display font-bold text-xs ${isSelected ? "text-[#E8A02C]" : "text-[#0F4635]"}`}>
                      S${preset.targetAmount.toFixed(0)}
                    </span>
                  </div>
                  <div className="font-bold text-xs mt-1 truncate">
                    {preset.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Goal Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Title & Icon */}
          <div>
            <label className="text-xs font-semibold text-[#1B1815] block mb-1">
              Item Name / Goal
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSelectedPresetIndex(null);
                }}
                placeholder="e.g. Wilson Basketball"
                required
                className="flex-1 px-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E0D4BF] text-xs text-[#1B1815] focus:outline-none focus:border-[#0F4635]"
              />
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="text-[11px] font-semibold text-[#8A8075] block mb-1">
              Choose Icon
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCategoryIcon(emoji)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 transition ${
                    categoryIcon === emoji
                      ? "bg-[#E8A02C] scale-110 shadow-xs"
                      : "bg-[#FBF6EC] hover:bg-[#EDE4D6]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-xs font-semibold text-[#1B1815] block mb-1">
              Target Price (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8075]">
                S$
              </span>
              <input
                type="number"
                step="1"
                min="1"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  setSelectedPresetIndex(null);
                }}
                placeholder="60"
                required
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E0D4BF] text-xs font-display font-bold text-[#1B1815] focus:outline-none focus:border-[#0F4635]"
              />
            </div>
          </div>

          {/* Smart Savings Calculation Hint */}
          <div className="p-2.5 rounded-xl bg-[#DDE8E1] text-[#0F4635] text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-[#0F4635]" />
            <span>
              Save <strong>S$8/week</strong> of your pocket money and you'll reach this in <strong>~{estimatedWeeks} weeks</strong>!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#EDE4D6] hover:bg-[#E0D4BF] text-xs font-bold text-[#6B6259] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-xs font-bold text-[#FBF6EC] shadow-sm transition"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
