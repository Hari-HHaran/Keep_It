import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUser, loadHouseholdState } from "@/lib/backend/household";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured.", mode: "demo" }, { status: 503 });
  }
  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const state = await loadHouseholdState(supabase, user.id);
    if (!state) {
      return NextResponse.json({ error: "Onboarding required." }, { status: 404 });
    }
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load household." },
      { status: 500 },
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
    const { name, age, personalBalance, savingsGoal } = body;

    const { data: managerMember, error: memErr } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (memErr || !managerMember) {
      return NextResponse.json({ error: "Household not found." }, { status: 404 });
    }

    // Insert dependent member
    const { data: newMember, error: insertErr } = await supabase
      .from("household_members")
      .insert({
        household_id: managerMember.household_id,
        full_name: name,
        role: "dependent",
        age: Number(age) || 11,
        personal_balance: Number(personalBalance) || 0,
      })
      .select()
      .single();

    if (insertErr) throw new Error(insertErr.message);

    // Insert goal if provided
    if (savingsGoal && savingsGoal.title) {
      await supabase.from("savings_goals").insert({
        household_id: managerMember.household_id,
        member_id: newMember.id,
        title: savingsGoal.title,
        target_amount: Number(savingsGoal.targetAmount) || 60,
        current_amount: Number(savingsGoal.currentAmount) || Number(personalBalance) || 0,
        category_icon: savingsGoal.categoryIcon || "🎯",
        notes: savingsGoal.notes || "Pocket money savings",
      });
    }

    const state = await loadHouseholdState(supabase, user.id);
    return NextResponse.json({ state, memberId: newMember.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to add dependent." },
      { status: 500 },
    );
  }
}
