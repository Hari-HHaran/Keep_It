import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUser } from "@/lib/backend/household";

export const dynamic = "force-dynamic";

/**
 * POST /api/savings-goals
 *   { action: "upsert", memberId, goal }
 *   { action: "deposit", memberId, goalId, amount }
 *
 * RLS decides what the caller may touch: managers can act on any member of
 * their household, a dependent only on their own row.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { data: me } = await supabase
      .from("household_members")
      .select("id, household_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!me) return NextResponse.json({ error: "Onboarding required." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const action = body.action || "upsert";
    const memberId: string = body.memberId || me.id;

    const isManager = me.role === "manager" || me.role === "co_manager";
    if (!isManager && memberId !== me.id) {
      return NextResponse.json(
        { error: "You can only change your own savings goal." },
        { status: 403 },
      );
    }

    if (action === "deposit") {
      const amount = Math.abs(Number(body.amount) || 0);
      if (!amount) {
        return NextResponse.json({ error: "Amount is required." }, { status: 400 });
      }

      const { data: goal } = await supabase
        .from("savings_goals")
        .select("id, current_amount, target_amount")
        .eq("id", body.goalId)
        .maybeSingle();

      if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

      const next = Math.min(Number(goal.target_amount), Number(goal.current_amount) + amount);

      const { data: updated, error } = await supabase
        .from("savings_goals")
        .update({
          current_amount: next,
          is_completed: next >= Number(goal.target_amount),
          updated_at: new Date().toISOString(),
        })
        .eq("id", goal.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, goal: updated });
    }

    const incoming = body.goal || {};
    const title = incoming.title;
    const target = Number(incoming.targetAmount);

    if (!title || !target) {
      return NextResponse.json(
        { error: "Goal title and target amount are required." },
        { status: 400 },
      );
    }

    const { data: existing } = await supabase
      .from("savings_goals")
      .select("id, current_amount")
      .eq("member_id", memberId)
      .eq("is_completed", false)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("savings_goals")
        .update({
          title,
          target_amount: target,
          category_icon: incoming.categoryIcon || "🎯",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, goal: updated });
    }

    const { data: created, error } = await supabase
      .from("savings_goals")
      .insert({
        household_id: me.household_id,
        member_id: memberId,
        title,
        target_amount: target,
        current_amount: Number(incoming.currentAmount || 0),
        category_icon: incoming.categoryIcon || "🎯",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, goal: created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save goal." },
      { status: 500 },
    );
  }
}
