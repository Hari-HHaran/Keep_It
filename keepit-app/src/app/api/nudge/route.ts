import { NextRequest, NextResponse } from "next/server";
import { checkOpportunityCostNudge } from "@/lib/calculations/nudgeEngine";
import { TAN_FAMILY_VOUCHERS } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transaction, vouchers } = body;

    const nudge = checkOpportunityCostNudge(transaction, vouchers || TAN_FAMILY_VOUCHERS);

    return NextResponse.json({
      status: "success",
      nudge,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to evaluate nudge" },
      { status: 400 }
    );
  }
}
