import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google sends the user back here after sign-in; we swap the code for a session cookie.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/builder";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/builder";

  const supabase = await createClient();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    console.error("Sign-in failed:", error.message);
  }
  return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(next)}`, url.origin));
}
