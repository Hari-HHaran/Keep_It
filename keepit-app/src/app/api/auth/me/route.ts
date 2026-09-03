import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthenticatedUser } from "@/lib/backend/household";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ authenticated: false, mode: "demo" });
  }
  const supabase = await createSupabaseServerClient();
  const user = await getAuthenticatedUser(supabase);
  return NextResponse.json({
    authenticated: Boolean(user),
    mode: "supabase",
    user: user ? { id: user.id, email: user.email } : null,
  });
}
