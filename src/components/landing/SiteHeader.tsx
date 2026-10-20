"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { Logo } from "./Logo";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { enabled, ready, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-shadow ${
        scrolled ? "border-gray-200 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.25)]" : "border-gray-100"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-gray-900">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {enabled && ready && !user && (
            <Link href="/login?next=/builder" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-block">
              Sign in
            </Link>
          )}
          <Link
            href="/builder"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-brand-dark hover:shadow-md"
          >
            {user ? "My resume" : "Open builder"}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5 5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="animate-fade-up border-t border-gray-100 px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
