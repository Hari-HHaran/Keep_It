"use client";

import React from "react";
import { LocationMerchant } from "@/lib/types";
import { SIMULATED_MERCHANTS } from "@/lib/calculations/pacingEngine";
import { MapPin, Navigation, Compass, Store, Sparkles } from "lucide-react";

interface LocationRadarCardProps {
  currentLocation: LocationMerchant | null;
  onSelectLocation: (merchant: LocationMerchant | null) => void;
}

export const LocationRadarCard: React.FC<LocationRadarCardProps> = ({
  currentLocation,
  onSelectLocation,
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 p-4 sm:p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Live Merchant Radar & Geofence (Feature 6)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                Simulated GPS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Surfaces accepted vouchers and spend pacing the moment you are near a store
            </p>
          </div>
        </div>

        {/* Location Simulator Quick Selector */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs pb-1 md:pb-0">
          <span className="text-[11px] text-slate-400 mr-1 shrink-0 font-medium">
            Simulate Location:
          </span>
          {SIMULATED_MERCHANTS.map((m) => {
            const isCurrent = currentLocation?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectLocation(isCurrent ? null : m)}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap text-xs font-medium border ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-400 shadow"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                }`}
              >
                {m.name.split(" ")[0]} ({m.locationName.split(" ")[0]})
              </button>
            );
          })}
          {currentLocation && (
            <button
              onClick={() => onSelectLocation(null)}
              className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Active Proximity Nudge Card */}
      {currentLocation ? (
        <div className="p-3.5 rounded-xl bg-blue-900/30 border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentLocation.name}</span>
                <span className="text-[10px] text-blue-300 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">
                  {currentLocation.distanceMeters}m away
                </span>
              </div>
              <div className="text-xs text-blue-200/90 font-medium mt-0.5">
                {currentLocation.discountNote}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 pl-11 sm:pl-0">
            <a
              href="#vouchers"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              Show Vouchers
            </a>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            No merchant nearby. Select a location above to test proximity voucher alerts.
          </span>
        </div>
      )}
    </div>
  );
};
