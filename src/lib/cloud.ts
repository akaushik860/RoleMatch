// Saving the resume to the signed-in user's account (Supabase `resumes` table).
import { getBrowserClient } from "./supabase/client";
import { normalizeState } from "./storage";
import type { AppState } from "./types";

export async function loadRemote(userId: string): Promise<AppState | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("resumes").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? normalizeState(data.data) : null;
}

export async function saveRemote(userId: string, state: AppState): Promise<void> {
  const supabase = getBrowserClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("resumes")
    .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export interface Credits {
  tailor: number;
  import: number;
}

export async function fetchCredits(): Promise<Credits | null> {
  const res = await fetch("/api/credits", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
