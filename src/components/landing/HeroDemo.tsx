"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = ["Your resume", "Job keywords found", "Rewritten, with proof", "Made-up claims blocked"];
const SCORES = [58, 58, 79, 79];
const STEP_MS = 2600;

function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(begin + (target - begin) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function Chip({ label, state }: { label: string; state: "match" | "missing" | "new" }) {
  const cls =
    state === "match"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : state === "new"
        ? "border-emerald-300 bg-emerald-100 text-emerald-900 animate-pop"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {state === "missing" ? "○" : "✓"} {label}
    </span>
  );
}

export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const score = useCountUp(SCORES[step]);
  const r = 26;
  const c = 2 * Math.PI * r;
  const ringColor = score >= 75 ? "#10b981" : "#f59e0b";

  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-blue-200/60 via-indigo-100/40 to-emerald-100/60 blur-2xl" aria-hidden />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_30px_80px_-30px_rgba(30,58,138,0.35)]">
        {/* Window bar with step progress */}
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-6 bg-brand" : i < step ? "w-1.5 bg-brand/50" : "w-1.5 bg-gray-300"}`}
              />
            ))}
          </div>
          <span key={step} className="animate-fade-up w-40 text-right text-[11px] font-semibold text-gray-600">
            {STEPS[step]}
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
          {/* Mini resume */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 font-serif text-[12px] leading-snug text-gray-900 shadow-sm">
            <div className="text-center text-base font-bold [font-variant:small-caps]">Priya Sharma</div>
            <div className="text-center text-[10px] text-gray-500">Backend Engineer · Bengaluru</div>
            <div className="mt-3 border-b border-gray-800 pb-0.5 text-[11px] [font-variant:small-caps]">Experience</div>
            <div className="mt-1.5 flex justify-between text-[11px]">
              <b>Northwind Labs</b>
              <span>2022 – Present</span>
            </div>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>Designed a Python REST API serving 2M+ requests per day</li>
              <li className="relative min-h-[3.9em] sm:min-h-[2.6em]">
                {step < 2 ? (
                  <span key="before" className={step === 1 ? "rounded bg-amber-50 ring-1 ring-amber-200" : ""}>
                    Set up GitHub Actions CI for 14 services, reducing deploy time from 40 to 8 minutes
                  </span>
                ) : (
                  <span key="after" className="animate-fade-up">
                    Built a <span className="hl-mark">CI/CD pipeline</span> with GitHub Actions for 14 services, cutting deploy time from 40 to 8 minutes
                  </span>
                )}
              </li>
              <li>Cut AWS costs by 32% by moving batch jobs to Lambda</li>
            </ul>
            {/* Always rendered so the card doesn't change height between steps. */}
            <div
              key={step >= 2 ? "proof" : "empty"}
              className={`mt-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 font-sans text-[10.5px] text-emerald-900 ${step >= 2 ? "animate-fade-up" : "invisible"}`}
            >
              <b>Proof for &ldquo;CI/CD&rdquo;:</b> your resume says &ldquo;GitHub Actions CI&rdquo;
            </div>
          </div>

          {/* Score + keywords */}
          <div className="flex flex-row items-start gap-4 sm:w-44 sm:flex-col sm:items-stretch">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                  <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
                  <circle
                    cx="32" cy="32" r={r} fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
                    style={{ transition: "stroke 0.4s" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums">{score}</span>
              </div>
              <span className="text-[11px] font-medium leading-tight text-gray-500">Job match</span>
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-gray-200 p-3">
              <div className="text-[11px] font-semibold text-gray-500">Job asks for</div>
              {step === 0 ? (
                <p className="mt-1.5 text-[11px] text-gray-400">Paste a job description…</p>
              ) : (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Chip label="Python" state="match" />
                  <Chip label="AWS" state="match" />
                  <Chip label="CI/CD" state={step >= 2 ? "new" : "missing"} />
                  <Chip label="Kubernetes" state="missing" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blocked suggestions */}
        <div className="min-h-[92px] border-t border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-5">
          {step === 3 ? (
            <div className="space-y-1.5">
              {[
                { text: "“Deployed 14 services on Kubernetes”", why: "Kubernetes isn't in your resume" },
                { text: "“Cut deploy time by 90%”", why: "90% isn't in your resume" },
              ].map((b, i) => (
                <div
                  key={b.text}
                  className="animate-slide-in flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11.5px]"
                  style={{ animationDelay: `${i * 180}ms` }}
                >
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">Blocked</span>
                  <span className="truncate text-gray-500 line-through">{b.text}</span>
                  <span className="ml-auto hidden shrink-0 text-gray-500 sm:inline">{b.why}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="pt-5 text-center text-[11.5px] text-gray-400">
              {step === 2 ? "Checking every suggestion against your resume…" : "AI suggestions appear here for you to approve"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
