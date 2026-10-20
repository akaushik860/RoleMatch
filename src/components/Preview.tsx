"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Resume, Settings } from "@/lib/types";
import { GHOST_RESUME, isBlank } from "@/lib/sample";
import ResumeDocument from "./ResumeDocument";

const MM = 96 / 25.4;
export const PAGE_PX = {
  a4: { w: 210 * MM, h: 297 * MM },
  letter: { w: 8.5 * 96, h: 11 * 96 },
};

/** Scaled on-screen preview. Reports how many pages the content fills. */
export default function Preview({
  resume,
  settings,
  zoom,
  onPages,
}: {
  resume: Resume;
  settings: Settings;
  zoom: number;
  onPages: (pages: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(PAGE_PX[settings.paper].h);
  const page = PAGE_PX[settings.paper];

  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(".resume-page") ?? null;
    if (!el) return;
    const measure = () => {
      if (!el.offsetWidth) return;
      // Content height ignoring the min-height of the paper itself.
      const inner = Array.from(el.children).reduce(
        (max, c) => Math.max(max, (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight),
        0,
      );
      const paddingBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      const contentH = inner + paddingBottom;
      setHeight(Math.max(page.h, el.offsetHeight));
      onPages(contentH / page.h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [resume, settings.paper, settings.template, page.h, onPages]);

  const z = zoom;
  const ghost = isBlank(resume);
  const breaks = Math.max(0, Math.ceil(height / page.h - 0.01) - 1);

  return (
    <div className="mx-auto shadow-[0_2px_16px_rgba(0,0,0,0.12)]" style={{ width: page.w * z, height: height * z }}>
      <div ref={ref} className="relative origin-top-left" style={{ transform: `scale(${z})`, width: page.w }}>
        <div className={ghost ? "opacity-30" : undefined}>
          <ResumeDocument resume={ghost ? GHOST_RESUME : resume} settings={settings} />
        </div>
        {ghost && (
          <div className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center">
            <span className="rounded-full bg-gray-900 px-5 py-2.5 font-sans text-base font-medium text-white shadow-lg">
              Start typing on the left. Your resume appears here.
            </span>
          </div>
        )}
        {Array.from({ length: breaks }, (_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-400"
            style={{ top: page.h * (i + 1) }}
          >
            <span className="absolute right-2 -top-6 rounded bg-red-500 px-2 py-0.5 text-xs text-white">
              Page {i + 2} starts here
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
