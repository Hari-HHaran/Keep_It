import { NextRequest, NextResponse } from "next/server";
import { INITIAL_APP_STATE } from "@/lib/mockData";
import { checkOpportunityCostNudge } from "@/lib/calculations/nudgeEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId") || "tan_family";

  return NextResponse.json({
    status: "success",
    personaId,
    balance: INITIAL_APP_STATE.totalHouseholdBalance,
    thisMonthsSpend: INITIAL_APP_STATE.thisMonthsSpend,
    accounts: INITIAL_APP_STATE.bankAccounts,
    transactions: INITIAL_APP_STATE.transactions,
    members: INITIAL_APP_STATE.members,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, amount, category, source, memberId, recipientId } = body;

    const newTransaction = {
      id: `tx-${Date.now()}`,
      date: "Just now",
      description: description || "Expense",
      amount: parseFloat(amount),
      category: category || "Groceries",
      source: source || "Cash Receipt",
      memberId: memberId || "mem-meiling",
      recipientId: recipientId || undefined,
    };

    const nudge = checkOpportunityCostNudge(newTransaction, INITIAL_APP_STATE.vouchers);

    return NextResponse.json({
      status: "success",
      transaction: newTransaction,
      nudge,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Failed to create transaction" },
      { status: 400 }
    );
  }
}
