import { NextRequest, NextResponse } from "next/server";
import { TAN_FAMILY_VOUCHERS } from "@/lib/mockData";
import { calculateAllVoucherPacing } from "@/lib/calculations/pacingEngine";

export async function GET() {
  const pacing = calculateAllVoucherPacing(TAN_FAMILY_VOUCHERS);
  return NextResponse.json({
    status: "success",
    vouchers: TAN_FAMILY_VOUCHERS,
    pacing,
    totalVouchersUnspent: TAN_FAMILY_VOUCHERS.reduce((sum, v) => sum + v.balance, 0),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smsLink, voucherName } = body;

    // Simulate claiming voucher from SMS link
    const newVoucher = {
      id: `vouch-${Date.now()}`,
      name: voucherName || "CDC Supermarket Vouchers (June 2026 Tranche)",
      category: "CDC_Supermarket" as const,
      totalGranted: 150,
      balance: 150,
      expiryDate: "31 Dec 2027",
      daysRemaining: 485,
      description: "Successfully claimed via Gov SMS portal integration.",
      acceptedMerchants: ["FairPrice", "Sheng Siong", "Giant", "Prime"],
      isExpiringSoon: false,
    };

    return NextResponse.json({
      status: "success",
      message: "Voucher claimed successfully from Gov portal link",
      voucher: newVoucher,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to process voucher claim" },
      { status: 400 }
    );
  }
}
