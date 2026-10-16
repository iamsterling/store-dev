type PublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export function getSupabaseConfig(env: PublicEnvironment) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.local before using Supabase.",
    );
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Supabase URL must be a valid URL.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (
    (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) ||
    parsed.username ||
    parsed.password
  )
    throw new Error(
      "Supabase URL must use HTTPS (HTTP is allowed only for local development) and contain no credentials.",
    );
  // Local CLI may still issue legacy anon JWTs. Never accept privileged key types.
  const publishable = key.startsWith("sb_publishable_");
  let anon = false;
  if (!publishable) {
    try {
      anon =
        JSON.parse(
          atob(key.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? ""),
        ).role === "anon";
    } catch {
      /* Not a legacy anon JWT. */
    }
  }
  if (!publishable && !anon)
    throw new Error(
      "Use a publishable key or local anon key, never a secret or service-role key.",
    );
  return { url, key };
}

export function readSupabaseConfig() {
  // Explicit references are required for Next.js to inline public browser variables.
  return getSupabaseConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
