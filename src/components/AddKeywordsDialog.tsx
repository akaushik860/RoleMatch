"use client";

import { useMemo, useState } from "react";
import { addFamiliarSkills, addSkill, analyze, FAMILIAR_LABEL, type Keyword } from "@/lib/analyze";
import { uid } from "@/lib/sample";
import type { Resume } from "@/lib/types";
import { scoreColor } from "./MatchPanel";
import Modal from "./Modal";

export const prepLink = (skill: string) => `https://www.google.com/search?q=${encodeURIComponent(`${skill} interview questions`)}`;

type Placement = "familiar" | "main";

function withKeywords(resume: Resume, picked: Keyword[], placement: Placement): Resume {
  if (placement === "familiar") return addFamiliarSkills(resume, picked.map((k) => k.display), uid);
  return picked.reduce((r, k) => addSkill(r, k.display, k.category, uid), resume);
}

/**
 * Adds the job's missing skills to the resume (the user picks which), then shows
 * them as an interview-prep list so the user is ready to talk about each one.
 */
export default function AddKeywordsDialog({
  resume,
  jd,
  pages,
  missing,
  onApply,
  onRemove,
  onClose,
}: {
  resume: Resume;
  jd: string;
  pages: number;
  missing: Keyword[];
  onApply: (next: Resume, added: string[]) => void;
  onRemove: (skill: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(() => new Set(missing.map((k) => k.display)));
  const [placement, setPlacement] = useState<Placement>("familiar");
  const [added, setAdded] = useState<string[] | null>(null);

  const chosen = useMemo(() => missing.filter((k) => picked.has(k.display)), [missing, picked]);
  const before = useMemo(() => analyze(resume, jd, pages).score, [resume, jd, pages]);
  const after = useMemo(() => analyze(withKeywords(resume, chosen, placement), jd, pages).score, [resume, jd, pages, chosen, placement]);

  const toggle = (name: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });

  // Step 2: what was added, framed as interview prep.
  if (added) {
    return (
      <Modal
        title="Added. Now get interview-ready"
        onClose={onClose}
        footer={
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="rounded-md bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Got it
            </button>
          </div>
        }
      >
        {added.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-600">You removed all of them. Your resume is back to how it was.</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Interviewers ask about every skill on your resume. Before you apply, make sure you can talk about these.
              Not confident about one? Remove it.
            </p>
            <ul className="mt-4 space-y-2">
              {added.map((s) => (
                <li key={s} className="animate-fade-up flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5">
                  <span className="font-medium">{s}</span>
                  <a
                    href={prepLink(s)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-sm font-medium text-brand hover:underline"
                  >
                    Prep questions ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onRemove(s);
                      setAdded((a) => a?.filter((x) => x !== s) ?? null);
                    }}
                    className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-gray-500">This list stays on the Job match tab, so you can come back to it.</p>
          </>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      title="Add job keywords to your resume"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            Job match: <b className={scoreColor(before).text}>{before}</b> → <b className={scoreColor(after).text}>{after}</b>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="button"
              disabled={chosen.length === 0}
              onClick={() => {
                const names = chosen.map((k) => k.display);
                onApply(withKeywords(resume, chosen, placement), names);
                setAdded(names);
              }}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Add {chosen.length} skill{chosen.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      }
    >
      <p className="text-sm text-gray-600">
        The job asks for these and your resume doesn&apos;t mention them. Untick any you couldn&apos;t discuss in an interview.
      </p>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">{chosen.length} of {missing.length} selected</span>
        <span className="flex gap-3">
          <button type="button" className="font-medium text-brand hover:underline" onClick={() => setPicked(new Set(missing.map((k) => k.display)))}>
            Select all
          </button>
          <button type="button" className="font-medium text-brand hover:underline" onClick={() => setPicked(new Set())}>
            Select none
          </button>
        </span>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {missing.map((k) => (
          <label
            key={k.display}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
              picked.has(k.display) ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200"
            }`}
          >
            <input type="checkbox" checked={picked.has(k.display)} onChange={() => toggle(k.display)} className="h-4 w-4 accent-emerald-600" />
            <span className="font-medium">{k.display}</span>
            {k.required && <span className="ml-auto rounded bg-red-100 px-1.5 text-[10px] font-bold uppercase text-red-700">Req</span>}
            {k.preferred && <span className="ml-auto rounded bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600">Nice to have</span>}
          </label>
        ))}
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">Where should they go?</legend>
        <div className="mt-2 space-y-2">
          <label className="flex cursor-pointer gap-2.5 rounded-lg border border-gray-200 p-3 has-[:checked]:border-brand has-[:checked]:bg-blue-50/50">
            <input type="radio" name="placement" checked={placement === "familiar"} onChange={() => setPlacement("familiar")} className="mt-0.5 accent-[#2f5bd3]" />
            <span className="text-sm">
              <b>A &ldquo;{FAMILIAR_LABEL}&rdquo; group</b> <span className="text-emerald-700">(recommended)</span>
              <span className="block text-gray-600">Counts for ATS keyword matching and tells recruiters honestly that you&apos;re still building depth.</span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-2.5 rounded-lg border border-gray-200 p-3 has-[:checked]:border-brand has-[:checked]:bg-blue-50/50">
            <input type="radio" name="placement" checked={placement === "main"} onChange={() => setPlacement("main")} className="mt-0.5 accent-[#2f5bd3]" />
            <span className="text-sm">
              <b>My main skill groups</b>
              <span className="block text-gray-600">Mixed in with your existing skills. Only choose this if you&apos;re confident in them.</span>
            </span>
          </label>
        </div>
      </fieldset>
    </Modal>
  );
}
