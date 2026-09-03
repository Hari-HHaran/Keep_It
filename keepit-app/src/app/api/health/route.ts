import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      database: "not-configured",
      mode: "demo",
      message: "App is healthy. Add Supabase environment variables for persistent backend mode.",
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const requiredTables = [
      { table: "profiles", columns: "id,full_name" },
      { table: "households", columns: "id,name,cash_balance" },
      { table: "household_members", columns: "id,household_id,user_id,role,vehicle_type" },
      { table: "bank_accounts", columns: "id,household_id,member_id,balance" },
      { table: "savings_goals", columns: "id,member_id,target_amount,current_amount" },
      { table: "transactions", columns: "id,household_id,member_id,account_id,amount" },
      { table: "government_vouchers", columns: "id,household_id,balance,expiry_date" },
      { table: "gig_profiles", columns: "id,member_id,vehicle_type" },
      { table: "nudges", columns: "id,household_id,related_transaction_id" },
    ];
    const checks = await Promise.all(
      requiredTables.map(async ({ table, columns }) => {
        const { error } = await supabase.from(table).select(columns, { head: true, count: "exact" });
        return { table, error: error?.message || null };
      }),
    );
    const missingTables = checks.filter((check) => check.error).map((check) => check.table);
    if (missingTables.length) {
      return NextResponse.json(
        {
          ok: false,
          database: "schema-incomplete",
          mode: "supabase",
          missingTables,
          message: "Run supabase/schema.sql in the Supabase SQL Editor.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, database: "reachable", mode: "supabase", tablesChecked: requiredTables.length });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "unreachable",
        mode: "supabase",
        error: error instanceof Error ? error.message : "Database check failed",
      },
      { status: 503 },
    );
  }
}
