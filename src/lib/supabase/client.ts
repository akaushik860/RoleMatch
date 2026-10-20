import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AUTH_ENABLED, SUPABASE_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

/** Browser Supabase client, or null when auth isn't configured. */
export function getBrowserClient(): SupabaseClient | null {
  if (!AUTH_ENABLED) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
