import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/landing/Logo";
import LoginCard from "./LoginCard";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gray-50 px-4 py-12">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="animate-blob absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" aria-hidden />
      <Link href="/" className="animate-fade-up mb-8">
        <Logo />
      </Link>
      <Suspense>
        <LoginCard />
      </Suspense>
      <p className="mt-6 max-w-sm text-center text-xs text-gray-500">
        You can build and download your resume without an account. Signing in unlocks AI import and tailoring and saves your resume across devices.
      </p>
    </div>
  );
}
