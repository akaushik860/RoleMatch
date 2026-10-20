import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_ENABLED, SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Supabase client for route handlers, acting as the signed-in user. Create one per request. */
export async function createClient() {
  if (!AUTH_ENABLED) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a context that can't set cookies; the proxy refreshes them instead.
        }
      },
    },
  });
}

/** The signed-in user, verified with Supabase Auth (not just read from the cookie). */
export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}
