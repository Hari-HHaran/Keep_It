import { createClient } from "@supabase/supabase-js";

/**
 * SERVER ONLY. The service-role key bypasses RLS — never import this into a
 * client component.
 *
 * Built lazily behind a Proxy. A top-level `throw` here would run at module
 * load, which breaks `next build` (page-data collection) and any deploy where
 * env vars aren't present at build time. Errors now surface at call time,
 * inside the request, where they can be returned as a clean 503.
 */
let cached = null;

function getAdminClient() {
  if (cached) return cached;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cached;
}

export function isAdminConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getAdminClient();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
);
