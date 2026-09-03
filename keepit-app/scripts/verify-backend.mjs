const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function check(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

try {
  const health = await check("/api/health");
  console.log("Health:", health.status, health.body);

  if (!health.body.ok) {
    console.error("Backend health check failed.");
    process.exit(1);
  }

  if (health.body.mode !== "supabase" || health.body.database !== "reachable") {
    console.error("App is running, but Supabase persistence is not active. Check .env.local and supabase/schema.sql.");
    process.exit(2);
  }

  const session = await check("/api/auth/me");
  console.log("Session route:", session.status, session.body.authenticated ? "authenticated" : "no active login cookie");
  console.log("Backend is reachable and the authentication route is responding.");
} catch (error) {
  console.error("Could not reach KeepIt:", error instanceof Error ? error.message : error);
  process.exit(1);
}
