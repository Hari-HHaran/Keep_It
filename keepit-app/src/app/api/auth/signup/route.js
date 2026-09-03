import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(
        "Supabase signup error:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,

      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
          }
        : null,

      /*
       * If email confirmation is enabled in Supabase,
       * session may be null until the user verifies
       * their email.
       */
      sessionCreated:
        Boolean(data.session),

      message:
        data.session
          ? "Account created successfully."
          : "Account created. Please verify your email before continuing.",
    });
  } catch (error) {
    console.error(
      "Signup route error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Signup failed.",
      },
      { status: 500 },
    );
  }
}