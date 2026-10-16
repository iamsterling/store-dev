import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@repo/database/types";
import { readSupabaseConfig } from "./env";

// Request-scoped only. Never share a cookie-backed client between requests.
export async function createClient() {
  const { url, key } = readSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Components cannot set cookies; wire a refresh proxy before enabling auth. */
        }
      },
    },
  });
}
