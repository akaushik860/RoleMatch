import { BRAND } from "@/lib/brand";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#2f5bd3" />
      <path d="M10 8h9l4 4v12a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="#fff" />
      <path d="M12 13h6M12 16h8" stroke="#2f5bd3" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="21.5" cy="21.5" r="5" fill="#10b981" stroke="#2f5bd3" strokeWidth="1.5" />
      <path d="m19.4 21.6 1.5 1.5 2.8-2.9" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">{BRAND.name}</span>
    </span>
  );
}
