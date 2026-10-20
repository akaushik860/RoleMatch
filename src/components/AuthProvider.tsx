"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

interface AuthState {
  /** Auth is configured (Supabase keys present). */
  enabled: boolean;
  /** We know whether someone is signed in. */
  ready: boolean;
  user: User | null;
  signIn: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    // Fires once immediately (INITIAL_SESSION), then on every sign-in / sign-out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (next = window.location.pathname) => {
    if (!supabase) return;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) alert(`Couldn't start sign-in: ${error.message}`);
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ enabled: !!supabase, ready, user, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function displayName(user: User): string {
  const m = user.user_metadata ?? {};
  return (m.full_name as string) || (m.name as string) || user.email || "Account";
}

export function avatarUrl(user: User): string | null {
  const m = user.user_metadata ?? {};
  return (m.avatar_url as string) || (m.picture as string) || null;
}
