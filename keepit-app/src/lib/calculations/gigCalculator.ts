import { VehicleType } from "../types";

/**
 * Platform Workers Act 2025: Fixed Expense Deduction Amount (FEDA)
 * - Car / Van / Lorry: 60%
 * - Motorcycle / PMD: 35%
 * - Bicycle / Walking / Public Transport: 20%
 */
export function getFedaPercentage(vehicle: VehicleType): number {
  switch (vehicle) {
    case "car_van_lorry":
      return 0.60;
    case "motorcycle_pmd":
      return 0.35;
    case "bicycle_walking_public":
      return 0.20;
    default:
      return 0.0;
  }
}

/**
 * Calculates Net Income after FEDA deduction and estimated CPF employee contribution
 * Employee CPF for platform workers starting 2025 escalates progressively (~2.5% to 20% based on age band)
 */
export function calculateNetGigIncome(
  grossIncome: number,
  vehicle: VehicleType,
  cpfRate: number = 0.08 // typical transitional rate for 2025/2026
): {
  grossIncome: number;
  fedaDeduction: number;
  netAfterFeda: number;
  cpfDeduction: number;
  takeHomeDisposable: number;
  cashReceived: number;
} {
  const fedaRate = getFedaPercentage(vehicle);
  const fedaDeduction = grossIncome * fedaRate;
  const netAfterFeda = grossIncome - fedaDeduction;
  
  // CPF is levied on net earnings after FEDA
  const cpfDeduction = netAfterFeda * cpfRate;
  // FEDA is a statutory assumption about work expenses used to derive the
  // earnings CPF is levied on — it is not withheld by the platform. So there
  // are two correct numbers, and the waterfall must end on trueDisposable or
  // it renders a final step LARGER than the one above it.
  const cashReceived = grossIncome - cpfDeduction;
  const takeHomeDisposable = netAfterFeda - cpfDeduction;

  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    fedaDeduction: Math.round(fedaDeduction * 100) / 100,
    netAfterFeda: Math.round(netAfterFeda * 100) / 100,
    cpfDeduction: Math.round(cpfDeduction * 100) / 100,
    takeHomeDisposable: Math.round(takeHomeDisposable * 100) / 100,
    cashReceived: Math.round(cashReceived * 100) / 100,
  };
}

/**
 * Safe Weekly Salary Calculation with Income Smoothing
 * Takes irregular historical weekly earnings, computes rolling median/p40 baseline safe salary,
 * and tracks surplus deposited into the Lean-Week Buffer.
 */
export function calculateSafeWeeklySalary(weeklyEarningsHistory: number[]): {
  suggestedWeeklySalary: number;
  bufferSurplusAddition: number;
  currentBufferTotal: number;
  averageWeeklyGross: number;
} {
  if (!weeklyEarningsHistory.length) {
    return {
      suggestedWeeklySalary: 500,
      bufferSurplusAddition: 0,
      currentBufferTotal: 300,
      averageWeeklyGross: 500,
    };
  }

  const sum = weeklyEarningsHistory.reduce((a, b) => a + b, 0);
  const avg = sum / weeklyEarningsHistory.length;
  
  // Suggested safe salary is conservatively set to ~70-75% of rolling average
  // Surplus on peak weeks flows into the buffer reserve
  const suggestedWeeklySalary = Math.round((avg * 0.72) / 10) * 10;
  
  const latestWeek = weeklyEarningsHistory[weeklyEarningsHistory.length - 1];
  const bufferSurplusAddition = Math.max(0, latestWeek - suggestedWeeklySalary);

  return {
    suggestedWeeklySalary,
    bufferSurplusAddition,
    currentBufferTotal: 310, // baseline demo buffer
    averageWeeklyGross: Math.round(avg),
  };
}
