"use client";

import type { Analysis, Issue, Keyword } from "@/lib/analyze";
import { BRAND } from "@/lib/brand";
import { DOMAIN_LABEL } from "@/lib/dictionary";
import { FREE_LIMITS } from "@/lib/plans";
import { prepLink } from "./AddKeywordsDialog";

export function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-500", ring: "#10b981" };
  if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-500", ring: "#f59e0b" };
  return { text: "text-red-600", bg: "bg-red-500", ring: "#ef4444" };
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const col = scoreColor(score);
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={col.ring} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: "stroke-dashoffset .4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${col.text}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function ScoreCard({ a }: { a: Analysis }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={a.score} label={a.hasJd ? "Job match" : "Health"} />
        <div className="min-w-0 flex-1 space-y-2">
          {a.parts.map((p) => (
            <div key={p.label}>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{p.label}</span>
                <span className="font-medium">{Math.round(p.value)}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${scoreColor(p.value).bg}`} style={{ width: `${p.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {a.hasJd
          ? "Estimate of how well your resume covers this job's keywords, plus resume quality. Aim for 80+. Every ATS works differently, so treat it as a guide, not a guarantee."
          : "Paste a job description below to see how well you match it."}
      </p>
    </div>
  );
}

function Chip({ k, onAdd }: { k: Keyword; onAdd?: () => void }) {
  const base = "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs";
  if (k.matched) {
    return (
      <span
        className={`${base} ${k.skillsOnly ? "border-amber-300 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        title={k.skillsOnly ? "Only in your Skills list. Mention it in a bullet to prove it." : "Found in your resume"}
      >
        ✓ {k.display}
        {k.skillsOnly && <span aria-hidden>·</span>}
        {k.skillsOnly && <span className="opacity-75">skills only</span>}
      </span>
    );
  }
  return (
    <span className={`${base} border-red-200 bg-red-50 text-red-800`}>
      {k.display}
      {k.required && <span className="rounded bg-red-200/70 px-1 text-[10px] font-semibold uppercase">req</span>}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="ml-0.5 rounded-full bg-white px-1.5 font-semibold text-red-700 shadow-sm hover:bg-red-100"
          title="I have this skill: add it to my Skills section"
          aria-label={`Add ${k.display} to skills`}
        >
          +
        </button>
      )}
    </span>
  );
}

export interface TailorState {
  busy: boolean;
  error: string;
  /** AI runs left today; null when unknown or unlimited. */
  left: number | null;
  needsSignIn: boolean;
  run: () => void;
}

function UpsellNote() {
  return (
    <p className="mt-2 text-xs text-gray-600">
      Need more? <b>Plus</b> (coming soon) adds more AI runs, saved versions per job and cover letters.
      {BRAND.waitlistUrl && (
        <>
          {" "}
          <a href={BRAND.waitlistUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">
            Join the waitlist
          </a>
        </>
      )}
    </p>
  );
}

export function TailorCard({ tailor, hasJd }: { tailor: TailorState; hasJd: boolean }) {
  const out = tailor.left === 0;
  return (
    <div className="rounded-xl border border-brand/30 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="font-semibold">{hasJd ? "Tailor your resume to this job" : "Improve your bullets with AI"}</div>
      <p className="mt-1 text-sm text-gray-600">
        {hasJd
          ? "AI rewrites your summary and bullets around this job's keywords, using only facts already in your resume. You approve every change."
          : "Paste a job description above for tailored rewrites, or let AI sharpen your wording now."}
      </p>
      <button
        type="button"
        onClick={tailor.run}
        disabled={tailor.busy || out}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {tailor.busy ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
            Rewriting… (usually under 30s)
          </>
        ) : tailor.needsSignIn ? (
          <>Sign in with Google to {hasJd ? "tailor" : "use AI"}</>
        ) : (
          <>✨ {hasJd ? "Tailor with AI" : "Improve with AI"}</>
        )}
      </button>
      <span className="ml-3 text-xs text-gray-500">
        {tailor.needsSignIn
          ? `Free: ${FREE_LIMITS.tailor} runs a day`
          : tailor.left !== null && `${tailor.left} of ${FREE_LIMITS.tailor} free runs left today`}
      </span>
      {tailor.error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{tailor.error}</p>}
      {(out || tailor.left === 1) && <UpsellNote />}
    </div>
  );
}

export function MatchPanel({
  jd,
  onJdChange,
  analysis,
  onAddSkill,
  tailor,
  onAddKeywords,
  learning,
  onRemoveLearning,
}: {
  jd: string;
  onJdChange: (v: string) => void;
  analysis: Analysis;
  onAddSkill: (k: Keyword) => void;
  tailor: TailorState;
  onAddKeywords: () => void;
  learning: string[];
  onRemoveLearning: (skill: string) => void;
}) {
  const missing = analysis.keywords.filter((k) => !k.matched);
  const missingSkills = missing.filter((k) => k.kind === "skill");
  const missingTerms = missing.filter((k) => k.kind === "term");
  const matched = analysis.keywords.filter((k) => k.matched);
  const d = analysis.domain;

  return (
    <div className="space-y-3">
      <ScoreCard a={analysis} />

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="jd" className="font-semibold">Job description</label>
          {jd && (
            <button type="button" onClick={() => onJdChange("")} className="text-xs text-gray-500 hover:text-red-600">
              Clear
            </button>
          )}
        </div>
        <textarea
          id="jd"
          className="min-h-40 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Paste the full job post here: title, responsibilities and requirements."
          value={jd}
          onChange={(e) => onJdChange(e.target.value)}
        />
      </div>

      <TailorCard tailor={tailor} hasJd={analysis.hasJd} />

      {d.mismatch && d.jdDomain && d.resumeDomain && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Different field.</b> This job looks like <b>{DOMAIN_LABEL[d.jdDomain]}</b>, but your resume reads as{" "}
          <b>{DOMAIN_LABEL[d.resumeDomain]}</b>. A low score here is expected. Only add skills you really have, since
          interviewers will ask about them.
        </div>
      )}

      {analysis.hasJd && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="font-semibold">
            Missing keywords <span className="text-sm font-normal text-gray-500">({missing.length})</span>
          </div>
          {missingSkills.length > 0 ? (
            <>
              <p className="mb-2 mt-1 text-xs text-gray-500">
                Press <b>+</b> to add a skill you genuinely have. Better still, show it in a bullet point.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((k) => (
                  <Chip key={k.display} k={k} onAdd={() => onAddSkill(k)} />
                ))}
              </div>
              <button
                type="button"
                onClick={onAddKeywords}
                className="mt-3 w-full rounded-lg border border-brand/40 bg-blue-50 px-3 py-2 text-sm font-semibold text-brand transition hover:bg-blue-100"
              >
                Add job keywords to my resume ({missingSkills.length})
              </button>
            </>
          ) : (
            <p className="mt-1 text-sm text-emerald-700">You cover every skill we detected. Nice.</p>
          )}
          {missingTerms.length > 0 && (
            <>
              <div className="mb-1.5 mt-4 text-xs font-medium text-gray-600">Words the job repeats that you don&apos;t use</div>
              <div className="flex flex-wrap gap-1.5">
                {missingTerms.map((k) => (
                  <Chip key={k.display} k={k} />
                ))}
              </div>
            </>
          )}

          {matched.length > 0 && (
            <>
              <div className="mb-1.5 mt-4 text-xs font-medium text-gray-600">
                Matched ({matched.length})
                {matched.some((k) => k.skillsOnly) && (
                  <span className="font-normal text-gray-500"> · amber ones only count partly until a bullet shows them in use</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matched.map((k) => (
                  <Chip key={k.display} k={k} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {learning.length > 0 && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="font-semibold">Prepare for interviews ({learning.length})</div>
          <p className="mt-1 text-xs text-gray-600">
            Skills you added from job posts. Be ready to talk about each one, or remove it.
          </p>
          <ul className="mt-3 space-y-1.5">
            {learning.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-violet-100">
                <span className="font-medium">{s}</span>
                <a href={prepLink(s)} target="_blank" rel="noreferrer" className="ml-auto text-xs font-medium text-brand hover:underline">
                  Prep ↗
                </a>
                <button
                  type="button"
                  onClick={() => onRemoveLearning(s)}
                  className="rounded px-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${s} from resume`}
                  title="Remove from resume"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const SEV = {
  error: { icon: "●", cls: "text-red-600", label: "Fix" },
  warn: { icon: "●", cls: "text-amber-500", label: "Improve" },
  tip: { icon: "●", cls: "text-blue-500", label: "Tip" },
};

export function ChecksPanel({ issues }: { issues: Issue[] }) {
  if (!issues.length) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
        <div className="text-2xl">✓</div>
        <div className="font-semibold">No issues found</div>
        <p className="text-sm">Your resume passes every check.</p>
      </div>
    );
  }
  const order = { error: 0, warn: 1, tip: 2 };
  return (
    <div className="space-y-2">
      {[...issues]
        .sort((a, b) => order[a.severity] - order[b.severity])
        .map((i) => (
          <div key={i.id} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <span className={`mt-0.5 text-xs ${SEV[i.severity].cls}`} aria-hidden>
              {SEV[i.severity].icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium">
                <span className={`mr-1.5 text-[10px] font-semibold uppercase ${SEV[i.severity].cls}`}>{SEV[i.severity].label}</span>
                {i.title}
              </div>
              {i.detail && <p className="mt-0.5 break-words text-xs text-gray-600">{i.detail}</p>}
            </div>
          </div>
        ))}
    </div>
  );
}
