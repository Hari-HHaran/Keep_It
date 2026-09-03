import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "Household Manager";
  const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "+65 9123 4567";
  const age = Number(body.age) || 35;
  const citizenship = body.citizenship === "pr" ? "pr" : "singaporean";
  const employmentType = body.employmentType || (body.isPlatformWorker ? "platform_worker" : "regular_income");
  const isPlatformWorker = Boolean(body.isPlatformWorker);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        age,
        citizenship,
        employment_type: employmentType,
        is_platform_worker: isPlatformWorker,
      },
    },
  });

  if (error) {
    // If user already registered, attempt login with same credentials to allow smooth onboarding continuation
    if (error.message.toLowerCase().includes("already registered") || error.status === 422) {
      const loginAttempt = await supabase.auth.signInWithPassword({ email, password });
      if (!loginAttempt.error && loginAttempt.data.session) {
        return NextResponse.json({
          success: true,
          sessionCreated: true,
          message: "Signed into existing account.",
        });
      }
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    sessionCreated: Boolean(data.session),
    message: data.session
      ? "Account created."
      : "Check your email to verify the account, then sign in.",
  });
}
