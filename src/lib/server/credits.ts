import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuotaKind } from "../plans";

// Daily AI credits per signed-in user. Limits live in the database
// (supabase/schema.sql) so users can't reset them from the browser.

export async function creditsLeft(supabase: SupabaseClient, kind: QuotaKind): Promise<number> {
  const { data, error } = await supabase.rpc("ai_credits_left", { p_kind: kind });
  if (error) throw new Error(`ai_credits_left failed: ${error.message}`);
  return data as number;
}

/** Records one use. Returns how many are left afterwards. */
export async function spendCredit(supabase: SupabaseClient, kind: QuotaKind): Promise<number> {
  const { data, error } = await supabase.rpc("use_ai_credit", { p_kind: kind });
  if (error) throw new Error(`use_ai_credit failed: ${error.message}`);
  return data as number;
}
