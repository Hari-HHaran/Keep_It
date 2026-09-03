import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUser, loadHouseholdState } from "@/lib/backend/household";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured.", mode: "demo" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const state = await loadHouseholdState(supabase, user.id);
    if (!state) {
      return NextResponse.json({ error: "Household not found." }, { status: 404 });
    }

    return NextResponse.json({ transactions: state.transactions, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load ledger." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured.", mode: "demo" }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const body = await request.json();
    const {
      description,
      amount,
      category = "Other",
      source = "Manual Entry",
      accountId,
      recipientId,
      opportunityCostNote,
      voucherApplicable,
      isGigIncome = false,
      date,
    } = body;

    if (!description || typeof amount !== "number" || amount === 0) {
      return NextResponse.json({ error: "Valid description and non-zero amount are required." }, { status: 400 });
    }

    // Auto-resolve household_id and member_id from the authenticated user
    const { data: member, error: memErr } = await supabase
      .from("household_members")
      .select("id, household_id")
      .eq("user_id", user.id)
      .single();

    if (memErr || !member) {
      return NextResponse.json({ error: "Household membership not found." }, { status: 404 });
    }

    const householdId = member.household_id;
    const memberId = body.memberId || member.id;

    // Opportunity cost check for cash / debit spending on supermarket or hawker
    let finalOpportunityCost = opportunityCostNote;
    if (!finalOpportunityCost && amount < 0) {
      if (category === "Groceries" || description.toLowerCase().includes("fairprice") || description.toLowerCase().includes("supermarket")) {
        finalOpportunityCost = "CDC Supermarket vouchers could cover this grocery spend.";
      } else if (category === "Hawker & Dining" || description.toLowerCase().includes("hawker")) {
        finalOpportunityCost = "CDC Hawker vouchers could cover this meal.";
      }
    }

    // Insert into public.transactions
    const { data: insertedTx, error: txError } = await supabase
      .from("transactions")
      .insert({
        household_id: householdId,
        member_id: memberId,
        account_id: accountId || null,
        recipient_id: recipientId || null,
        description: description.trim(),
        amount: Number(amount),
        category: category,
        source: source,
        opportunity_cost_note: finalOpportunityCost || null,
        voucher_applicable: voucherApplicable || null,
        is_gig_income: isGigIncome || category === "Gig Payout",
        occurred_at: date && !date.includes("Just now") ? new Date(date).toISOString() : new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw new Error(txError.message);

    // If account_id provided or bank source detected, update bank_accounts balance
    if (accountId) {
      const { data: acc } = await supabase
        .from("bank_accounts")
        .select("balance")
        .eq("id", accountId)
        .single();

      if (acc) {
        await supabase
          .from("bank_accounts")
          .update({ balance: Number(acc.balance) + Number(amount), updated_at: new Date().toISOString() })
          .eq("id", accountId);
      }
    } else {
      // Find matching primary bank account if source matches
      const { data: accounts } = await supabase
        .from("bank_accounts")
        .select("id, bank_name, balance, account_type")
        .eq("household_id", householdId);

      if (accounts && accounts.length > 0) {
        let targetAcc = accounts.find((a: any) => 
          source.toLowerCase().includes(a.bank_name.toLowerCase()) || 
          (source.toLowerCase().includes("paynow") && a.account_type === "wallet")
        );
        if (!targetAcc && accounts.length > 0) {
          targetAcc = accounts[0];
        }

        if (targetAcc) {
          await supabase
            .from("bank_accounts")
            .update({ balance: Number(targetAcc.balance) + Number(amount), updated_at: new Date().toISOString() })
            .eq("id", targetAcc.id);
        }
      }
    }

    // If pocket money was sent to a dependent recipient, update recipient personal balance
    if (recipientId && category === "Pocket Money") {
      const { data: dep } = await supabase
        .from("household_members")
        .select("personal_balance")
        .eq("id", recipientId)
        .single();

      if (dep) {
        const newBal = Number(dep.personal_balance || 0) + Math.abs(amount);
        await supabase
          .from("household_members")
          .update({ personal_balance: newBal, updated_at: new Date().toISOString() })
          .eq("id", recipientId);

        // Also credit active savings goal if any
        const { data: goal } = await supabase
          .from("savings_goals")
          .select("id, current_amount, target_amount")
          .eq("member_id", recipientId)
          .eq("is_completed", false)
          .maybeSingle();

        if (goal) {
          const newGoalAmt = Number(goal.current_amount || 0) + Math.abs(amount);
          await supabase
            .from("savings_goals")
            .update({
              current_amount: newGoalAmt,
              is_completed: newGoalAmt >= Number(goal.target_amount),
              updated_at: new Date().toISOString(),
            })
            .eq("id", goal.id);
        }
      }
    }

    // Return updated household state
    const updatedState = await loadHouseholdState(supabase, user.id);
    return NextResponse.json({ status: "success", transaction: insertedTx, state: updatedState });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record transaction." },
      { status: 500 }
    );
  }
}
