import { NextRequest, NextResponse } from "next/server";
import { calculateNetGigIncome, calculateSafeWeeklySalary } from "@/lib/calculations/gigCalculator";
import { calculateWisEligibility } from "@/lib/calculations/wisCalculator";
import { VehicleType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const grossIncome = parseFloat(body.grossIncome || "850");
    const vehicle = (body.vehicleType || "motorcycle_pmd") as VehicleType;
    const age = parseInt(body.age || "24", 10);
    const weeklyHistory = body.weeklyHistory || [780, 890, 920, 810, 850];

    const netBreakdown = calculateNetGigIncome(grossIncome, vehicle);
    const smoothing = calculateSafeWeeklySalary(weeklyHistory);
    const wis = calculateWisEligibility(age, grossIncome * 4, true);

    return NextResponse.json({
      status: "success",
      netBreakdown,
      smoothing,
      wis,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to calculate gig statistics" },
      { status: 400 }
    );
  }
}
