"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@repo/database/types";
import { readSupabaseConfig } from "./env";

export function createClient() {
  const { url, key } = readSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}
