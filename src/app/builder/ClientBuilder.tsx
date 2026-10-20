"use client";

import dynamic from "next/dynamic";

// The builder reads localStorage on first render, so it only runs in the browser.
const BuilderApp = dynamic(() => import("@/components/BuilderApp"), {
  ssr: false,
  loading: () => <div className="flex h-dvh items-center justify-center text-sm text-gray-500">Loading your resume…</div>,
});

export default function ClientBuilder() {
  return <BuilderApp />;
}
