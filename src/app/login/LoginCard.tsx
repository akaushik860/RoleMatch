"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { GoogleIcon } from "@/components/UserMenu";

export default function LoginCard() {
  const params = useSearchParams();
  const router = useRouter();
  const { enabled, ready, user, signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const raw = params.get("next") ?? "/builder";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/builder";
  const failed = params.has("error");

  // Already signed in: go straight on.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_25px_60px_-30px_rgba(30,58,138,0.35)] [animation-delay:80ms]">
      <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
      <p className="mt-1 text-sm text-gray-600">Sign in or create your free account. It takes one click.</p>

      {failed && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Sign-in didn&apos;t complete. Please try again.</p>
      )}

      {enabled ? (
        <button
          type="button"
          disabled={busy || !ready || !!user}
          onClick={() => {
            setBusy(true);
            signIn(next).finally(() => setBusy(false));
          }}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold transition hover:-translate-y-px hover:bg-gray-50 hover:shadow-md disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5" />
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>
      ) : (
        <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Sign-in isn&apos;t set up yet. Add the Supabase keys to <code>.env.local</code>.
        </p>
      )}

      <ul className="mt-6 space-y-2 text-sm text-gray-600">
        {["AI import and tailoring", "Your resume on any device", "Free, no card needed"].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span> {t}
          </li>
        ))}
      </ul>

      <Link href="/builder" className="mt-6 block text-center text-sm font-medium text-gray-500 hover:text-gray-800">
        Continue without an account →
      </Link>
    </div>
  );
}
