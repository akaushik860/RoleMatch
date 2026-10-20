import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/builder", label: "Resume builder" },
      { href: "#how", label: "How it works" },
      { href: "#features", label: "Features" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "#faq", label: "FAQ" },
      { href: "#faq", label: "Privacy & your data" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="text-white [&_span]:text-white">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Tailor your resume to every job, using only what you&apos;ve actually done. Every AI suggestion is fact-checked against your resume.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold text-white">{c.title}</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
                  ) : (
                    <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {BRAND.name}. All rights reserved.</span>
          <span>Build without an account. Sign in free for AI and sync.</span>
        </div>
      </div>
    </footer>
  );
}
