import { NextRequest, NextResponse } from "next/server";
import { SIMULATED_MERCHANTS, calculateAllVoucherPacing } from "@/lib/calculations/pacingEngine";
import { TAN_FAMILY_VOUCHERS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  const pacing = calculateAllVoucherPacing(TAN_FAMILY_VOUCHERS);
  const matchedMerchant = SIMULATED_MERCHANTS.find((m) => m.id === locationId) || null;

  return NextResponse.json({
    status: "success",
    merchants: SIMULATED_MERCHANTS,
    currentMerchant: matchedMerchant,
    pacing,
  });
}
