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
