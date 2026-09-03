import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUser } from "@/lib/backend/household";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const manager = body.managerProfile;
    if (!manager?.fullName || !manager?.phoneNumber || !body.householdName) {
      return NextResponse.json(
        { error: "Name, phone number and household name are required." },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { data: existing } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "This user already belongs to a household." }, { status: 409 });
    }

    const citizenship = manager.citizenship === "pr" ? "pr" : "singaporean";
    const employmentType = ["regular_income", "platform_worker", "variable_income", "not_applicable"].includes(manager.employmentType)
      ? manager.employmentType
      : "regular_income";
    const vehicleType = ["car_van_lorry", "motorcycle_pmd", "bicycle_walking_public", "none"].includes(manager.vehicleType)
      ? manager.vehicleType
      : "none";

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: manager.fullName,
      phone_number: manager.phoneNumber || "",
      email: user.email,
      age: Math.max(0, Math.min(120, Number(manager.age) || 35)),
      citizenship,
      employment_type: employmentType,
      is_platform_worker: employmentType === "platform_worker",
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ name: body.householdName, created_by: user.id, cash_balance: Number(body.cashBalance || 0) })
      .select()
      .single();
    if (householdError) throw householdError;

    const { data: member, error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: household.id,
        user_id: user.id,
        full_name: manager.fullName,
        role: "manager",
        phone_number: manager.phoneNumber || "",
        email: user.email,
        age: Math.max(0, Math.min(120, Number(manager.age) || 35)),
        citizenship,
        employment_type: employmentType,
        is_platform_worker: employmentType === "platform_worker",
        vehicle_type: vehicleType,
      })
      .select()
      .single();
    if (memberError) throw memberError;

    const accounts = Array.isArray(body.accounts) ? body.accounts : [];
    if (accounts.length) {
      const { error } = await supabase.from("bank_accounts").insert(
        accounts.map((account: any) => ({
          household_id: household.id,
          member_id: member.id,
          bank_name: String(account.bankName),
          account_number: String(account.accountNumber || "••••"),
          account_type: account.accountType || "savings",
          balance: Number(account.balance || 0),
          last_synced_at: new Date().toISOString(),
        })),
      );
      if (error) throw error;
    }

    const vouchers = Array.isArray(body.vouchers) ? body.vouchers : [];
    if (vouchers.length) {
      const { error } = await supabase.from("government_vouchers").insert(
        vouchers.map((voucher: any) => ({
          household_id: household.id,
          name: voucher.name,
          category: voucher.category,
          total_granted: Number(voucher.totalGranted),
          balance: Number(voucher.balance),
          expiry_date: voucher.expiryDate,
          description: voucher.description || "Government support balance",
          accepted_merchants: voucher.acceptedMerchants || [],
        })),
      );
      if (error) throw error;
    }

    if (manager.employmentType === "platform_worker" && body.gigProfile) {
      const gig = body.gigProfile;
      const { error } = await supabase.from("gig_profiles").insert({
        member_id: member.id,
        platform_name: gig.platformName || "Delivery platform",
        vehicle_type: manager.vehicleType || "motorcycle_pmd",
        feda_percentage: Number(gig.fedaPercentage || 35),
        gross_weekly_average: Number(gig.grossWeeklyAverage || 850),
        safe_weekly_salary: Number(gig.safeWeeklySalary || 540),
        buffer_saved: Number(gig.bufferSaved || 0),
        monthly_wis_eligible: Boolean(gig.monthlyWisEligible),
        wis_monthly_amount: Number(gig.wisMonthlyAmount || 0),
        wis_cash_split: Number(gig.wisCashSplit || 0),
        wis_medisave_split: Number(gig.wisMedisaveSplit || 0),
        wis_payout_status: gig.wisPayoutStatus || [],
      });
      if (error) throw error;
    }

    const dependents = Array.isArray(body.dependents) ? body.dependents : [];
    for (const dependent of dependents) {
      const { data: dependentMember, error } = await supabase
        .from("household_members")
        .insert({
          household_id: household.id,
          user_id: null,
          full_name: dependent.name,
          role: "dependent",
          age: Number(dependent.age || 11),
          personal_balance: Number(dependent.personalBalance || 0),
          employment_type: "not_applicable",
          is_platform_worker: false,
        })
        .select()
        .single();
      if (error) throw error;

      if (dependent.savingsGoal) {
        const goal = dependent.savingsGoal;
        const { error: goalError } = await supabase.from("savings_goals").insert({
          household_id: household.id,
          member_id: dependentMember.id,
          title: goal.title,
          target_amount: Number(goal.targetAmount),
          current_amount: Number(goal.currentAmount || 0),
          category_icon: goal.categoryIcon || "🎯",
          notes: goal.notes || null,
        });
        if (goalError) throw goalError;
      }
    }

    if (accounts.length) {
      const { data: firstAccount } = await supabase
        .from("bank_accounts")
        .select("id, bank_name, balance")
        .eq("household_id", household.id)
        .order("created_at")
        .limit(1)
        .single();
      if (firstAccount) {
        await supabase.from("transactions").insert({
          household_id: household.id,
          member_id: member.id,
          account_id: firstAccount.id,
          description: "Opening account balance",
          amount: Number(firstAccount.balance),
          category: "Other",
          source: firstAccount.bank_name.split(" ")[0],
          occurred_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, householdId: household.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed." },
      { status: 500 },
    );
  }
}
