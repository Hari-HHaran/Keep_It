/**
 * Workfare Income Supplement (WIS) & Platform Workers CPF Transition Support (PCTS)
 * Based on MOM & CPF Board published rules:
 * - Qualifying income cap: <= $3,000 / month gross
 * - Platform workers receive monthly payouts if CPF is contributed
 * - Split: 10% Cash (direct to bank/PayNow), 90% MediSave
 * - Maximum payout scaled by age band
 */

export interface WisCalculationResult {
  isEligible: boolean;
  monthlyTotal: number;
  monthlyCash: number;
  monthlyMediSave: number;
  annualTotal: number;
  ageBand: string;
  schemeName: string;
  reason?: string;
}

export function calculateWisEligibility(
  age: number = 24,
  monthlyGrossIncome: number = 2200,
  isPlatformWorker: boolean = true
): WisCalculationResult {
  if (!isPlatformWorker) {
    return {
      isEligible: false,
      monthlyTotal: 0,
      monthlyCash: 0,
      monthlyMediSave: 0,
      annualTotal: 0,
      ageBand: "N/A",
      schemeName: "Standard",
      reason: "User is not classified as an eligible platform worker covered by CPF Workfare provisions."
    };
  }

  if (monthlyGrossIncome > 3000) {
    return {
      isEligible: false,
      monthlyTotal: 0,
      monthlyCash: 0,
      monthlyMediSave: 0,
      annualTotal: 0,
      ageBand: "N/A",
      schemeName: "Workfare Income Supplement",
      reason: "Monthly income exceeds the $3,000 threshold for WIS."
    };
  }

  let annualMax = 2100;
  let ageBand = "< 30 years (PCTS Scheme)";

  if (age < 30) {
    // Platform Workers CPF Transition Support (PCTS) specifically cushions younger workers under 30
    annualMax = 2160;
    ageBand = "< 30 years (PCTS + WIS Junior)";
  } else if (age >= 30 && age < 35) {
    annualMax = 2400;
    ageBand = "30 - 34 years";
  } else if (age >= 35 && age < 45) {
    annualMax = 3300;
    ageBand = "35 - 44 years";
  } else if (age >= 45 && age < 60) {
    annualMax = 4200;
    ageBand = "45 - 59 years";
  } else {
    annualMax = 4900;
    ageBand = "60 years and above";
  }

  // Monthly payout estimated based on income tier
  const monthlyTotal = Math.round(annualMax / 12);
  const monthlyCash = Math.round(monthlyTotal * 0.10); // 10% Cash
  const monthlyMediSave = monthlyTotal - monthlyCash;   // 90% MediSave

  return {
    isEligible: true,
    monthlyTotal,
    monthlyCash,
    monthlyMediSave,
    annualTotal: annualMax,
    ageBand,
    schemeName: age < 30 ? "Platform Workers CPF Transition Support (PCTS)" : "Workfare Income Supplement (WIS)"
  };
}
