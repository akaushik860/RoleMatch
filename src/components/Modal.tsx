"use client";

import { useEffect } from "react";

export default function Modal({
  title,
  onClose,
  children,
  wide = false,
  footer,
}: {
  title: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  wide?: boolean;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="screen-only fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
              ✕
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-gray-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
