// NEXT_PUBLIC_ values are safe in the browser: access is controlled by the
// row-level security rules in supabase/schema.sql, not by keeping these secret.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until both values are in .env.local; the app then runs in guest-only mode. */
export const AUTH_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);
