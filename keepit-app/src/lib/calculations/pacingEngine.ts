import { GovernmentVoucher, LocationMerchant } from "../types";

export interface SpendPacingResult {
  voucherId: string;
  voucherName: string;
  balance: number;
  daysRemaining: number;
  weeksRemaining: number;
  recommendedWeeklyPace: number;
  status: "on_track" | "behind_pace" | "critical";
  message: string;
}

/**
 * Calculates spend pacing for all active vouchers to prevent forfeiture
 * Weekly Pace = Balance / (Days / 7)
 */
export function calculateAllVoucherPacing(vouchers: GovernmentVoucher[]): SpendPacingResult[] {
  return vouchers
    .filter((v) => v.balance > 0 && v.category !== "Workfare_WIS")
    .map((v) => {
      const weeksRemaining = Math.max(1, Math.ceil(v.daysRemaining / 7));
      const weeklyPace = Math.round((v.balance / weeksRemaining) * 100) / 100;
      
      let status: "on_track" | "behind_pace" | "critical" = "on_track";
      let message = `Pace: Spend $${weeklyPace.toFixed(2)}/week to utilize fully before expiry.`;

      if (v.daysRemaining <= 14) {
        status = "critical";
        message = `⚠️ Critical: $${v.balance.toFixed(2)} expiring in ${v.daysRemaining} days! Spend $${(v.balance / 2).toFixed(2)}/week immediately.`;
      } else if (v.daysRemaining <= 45 && v.balance > 100) {
        status = "behind_pace";
        message = `Behind pace: You need to spend $${weeklyPace.toFixed(2)}/week to avoid forfeiting funds.`;
      }

      return {
        voucherId: v.id,
        voucherName: v.name,
        balance: v.balance,
        daysRemaining: v.daysRemaining,
        weeksRemaining,
        recommendedWeeklyPace: weeklyPace,
        status,
        message,
      };
    });
}

/**
 * Pre-configured simulated Singapore locations for Feature 6 demo
 */
export const SIMULATED_MERCHANTS: LocationMerchant[] = [
  {
    id: "loc-fairprice",
    name: "NTUC FairPrice (Tampines Mall)",
    locationName: "Tampines Central",
    acceptedVouchers: ["CDC_Supermarket"],
    distanceMeters: 85,
    discountNote: "Accepts CDC Supermarket Vouchers (e.g. $85 balance expiring soon)",
  },
  {
    id: "loc-sheng-siong",
    name: "Sheng Siong Supermarket",
    locationName: "Bedok Central",
    acceptedVouchers: ["CDC_Supermarket"],
    distanceMeters: 120,
    discountNote: "Accepts CDC Supermarket Vouchers",
  },
  {
    id: "loc-hawker",
    name: "Bedok 85 Fengshan Hawker Centre",
    locationName: "Bedok North St 4",
    acceptedVouchers: ["CDC_Hawker"],
    distanceMeters: 45,
    discountNote: "Over 40 food stalls accept CDC Hawker Vouchers",
  },
  {
    id: "loc-courts",
    name: "Courts Megastore",
    locationName: "Tampines North",
    acceptedVouchers: ["Climate", "SG60"],
    distanceMeters: 150,
    discountNote: "Accepts Climate Vouchers for 5-tick refrigerators & energy-saving appliances",
  },
  {
    id: "loc-giant",
    name: "Giant Hypermarket",
    locationName: "Tampines Retail Park",
    acceptedVouchers: ["CDC_Supermarket", "SG60"],
    distanceMeters: 200,
    discountNote: "Accepts CDC Supermarket & SG60 Vouchers",
  },
];
