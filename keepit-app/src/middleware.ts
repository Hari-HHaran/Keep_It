import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/auth"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials every page would throw. Let the app render its own
  // "not configured" state instead of crashing in middleware.
  if (!url || !key || url.includes("YOUR_PROJECT")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Fail closed: if Supabase is unreachable we must not silently drop auth
  // gating and let an unauthenticated request through to a protected page.
  let user = null;
  let authCheckFailed = false;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    authCheckFailed = true;
  }

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
<<<<<<< Updated upstream

  if ((!user || authCheckFailed) && !isPublic) {
=======
  const hasDemoCookie = request.cookies.get("keepit_demo_mode")?.value === "true";
  const isDemoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";

  if ((!user || authCheckFailed) && !isPublic && !hasDemoCookie && !isDemoEnabled) {
>>>>>>> Stashed changes
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    return NextResponse.redirect(redirect);
  }

  if (user && (path === "/login" || path === "/register")) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
