"use client";

import React, { useState } from "react";
import { Wifi, Signal, Battery, Smartphone, Maximize2, Minimize2 } from "lucide-react";

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const [isFramedMode, setIsFramedMode] = useState(true);

  return (
    <div className="min-h-screen bg-[#EDE4D6] flex flex-col items-center justify-start p-0 md:py-8 selection:bg-[#0F4635] selection:text-[#FBF6EC] font-sans">
      {/* View Switcher (Desktop only) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-[420px] mb-3 px-3 text-xs text-[#6B6259]">
        <div className="flex items-center space-x-2 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F4635]"></span>
          <span className="font-display font-bold text-sm text-[#1B1815]">KeepIt</span>
          <span className="text-[10px] font-mono-custom bg-[#DDE8E1] text-[#0F4635] px-2 py-0.5 rounded">
            Singapore · SGD
          </span>
        </div>
        <button
          onClick={() => setIsFramedMode(!isFramedMode)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFFDF8] border border-[#D6C9B4] text-[11px] font-medium text-[#1B1815] hover:bg-[#F5F1E7] transition shadow-sm"
        >
          {isFramedMode ? (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Device View</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full transition-all duration-300 ${
          isFramedMode
            ? "max-w-[412px] md:h-[870px] md:rounded-[44px] md:border-[10px] md:border-[#1B1815] md:shadow-[0_28px_64px_rgba(27,24,21,0.22)] flex flex-col overflow-hidden bg-[#FBF6EC] relative"
            : "max-w-xl min-h-screen flex flex-col bg-[#FBF6EC] shadow-md"
        }`}
      >
        {/* iOS Mobile Status Bar */}
        <div className="w-full bg-[#FBF6EC] px-6 pt-3.5 pb-2 flex items-center justify-between text-xs text-[#1B1815] select-none z-50 shrink-0 border-b border-[#EDE4D6]/70">
          <div className="font-bold text-[13px] tracking-tight">9:41</div>

          {/* Dynamic Island Notch */}
          <div className="h-5 w-24 bg-[#1B1815] rounded-full flex items-center justify-center space-x-1.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2A241F]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8A02C] animate-pulse" />
          </div>

          <div className="flex items-center space-x-1.5 text-[#1B1815]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px] font-bold">100%</span>
              <Battery className="w-4 h-4 fill-[#1B1815]" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile Canvas */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#FBF6EC] relative">
          {children}
        </div>
      </div>
    </div>
  );
};
