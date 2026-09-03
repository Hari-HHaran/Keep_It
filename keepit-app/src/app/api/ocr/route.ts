import { NextRequest, NextResponse } from "next/server";
import { parseReceiptText, SAMPLE_RECEIPTS } from "@/lib/ocr/receiptScanner";

export async function GET() {
  return NextResponse.json({
    status: "success",
    sampleReceipts: SAMPLE_RECEIPTS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptText, sampleId } = body;

    if (sampleId) {
      const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
      if (sample) {
        return NextResponse.json({
          status: "success",
          parsedReceipt: sample.data,
        });
      }
    }

    const parsedReceipt = parseReceiptText(receiptText || "");

    return NextResponse.json({
      status: "success",
      parsedReceipt,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to parse receipt" },
      { status: 400 }
    );
  }
}
