"use client";

import { useMemo, useState } from "react";
import { allKeys, applyTailor, type TailorResult } from "@/lib/ai";
import { analyze } from "@/lib/analyze";
import { diffWords } from "@/lib/diff";
import { uid } from "@/lib/sample";
import type { Resume } from "@/lib/types";
import { scoreColor } from "./MatchPanel";
import Modal from "./Modal";

function After({ before, after }: { before: string; after: string }) {
  const parts = useMemo(() => diffWords(before, after), [before, after]);
  return (
    <p className="text-sm leading-relaxed text-gray-900">
      {parts
        .filter((p) => p.type !== "del")
        .map((p, i) =>
          p.type === "add" ? (
            <mark key={i} className="rounded-sm bg-emerald-100 text-emerald-900">
              {p.text}
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
    </p>
  );
}

function Row({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
        checked ? "border-emerald-300 bg-emerald-50/40" : "border-gray-200 bg-white opacity-70"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} className="mt-1 h-4 w-4 shrink-0 accent-emerald-600" />
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
    </label>
  );
}

export default function TailorReview({
  result,
  resume,
  jd,
  pages,
  onApply,
  onClose,
}: {
  result: TailorResult;
  resume: Resume;
  jd: string;
  pages: number;
  onApply: (next: Resume) => void;
  onClose: () => void;
}) {
  const keys = useMemo(() => allKeys(result), [result]);
  const [accepted, setAccepted] = useState(() => new Set(keys));
  const toggle = (k: string) =>
    setAccepted((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const next = useMemo(() => applyTailor(resume, result, accepted, uid), [resume, result, accepted]);
  const before = useMemo(() => analyze(resume, jd, pages).score, [resume, jd, pages]);
  const after = useMemo(() => analyze(next, jd, pages).score, [next, jd, pages]);

  const groups = useMemo(() => {
    const m = new Map<string, TailorResult["bullets"]>();
    for (const b of result.bullets) m.set(b.context, [...(m.get(b.context) ?? []), b]);
    return [...m.entries()];
  }, [result]);

  const empty = keys.length === 0;

  return (
    <Modal
      wide
      title="Review AI suggestions"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            {jd.trim() ? (
              <>
                Job match: <b className={scoreColor(before).text}>{before}</b> →{" "}
                <b className={scoreColor(after).text}>{after}</b>
              </>
            ) : (
              <>
                Resume health: <b className={scoreColor(before).text}>{before}</b> →{" "}
                <b className={scoreColor(after).text}>{after}</b>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100" onClick={onClose}>
              {empty ? "Close" : "Discard all"}
            </button>
            {!empty && (
              <button
                type="button"
                disabled={accepted.size === 0}
                onClick={() => onApply(next)}
                className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                Apply {accepted.size} change{accepted.size === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </div>
      }
    >
      {empty ? (
        <div className="py-8 text-center">
          <div className="text-3xl">👍</div>
          <p className="mt-2 font-medium">Nothing worth changing</p>
          <p className="text-sm text-gray-600">Your resume already reads well for this job. Check the missing keywords for skills you can add.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
            <span>Untick anything you don&apos;t want. Nothing changes until you press Apply.</span>
            <span className="flex gap-3">
              <button type="button" className="font-medium text-brand hover:underline" onClick={() => setAccepted(new Set(keys))}>Select all</button>
              <button type="button" className="font-medium text-brand hover:underline" onClick={() => setAccepted(new Set())}>Select none</button>
            </span>
          </div>

          {result.discarded > 0 && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">
              🛡 We removed {result.discarded} AI suggestion{result.discarded === 1 ? "" : "s"} that added numbers, tools or claims not in your resume.
            </p>
          )}

          {result.summary && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Summary</h3>
              <Row checked={accepted.has("summary")} onToggle={() => toggle("summary")}>
                {result.summary.original && <p className="text-xs text-gray-500 line-through decoration-gray-300">{result.summary.original}</p>}
                <After before={result.summary.original} after={result.summary.text} />
                {result.summary.reason && <p className="text-xs text-gray-500">{result.summary.reason}</p>}
              </Row>
            </section>
          )}

          {groups.map(([context, items]) => (
            <section key={context}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{context || "Bullet points"}</h3>
              <div className="space-y-2">
                {items.map((b) => (
                  <Row key={b.key} checked={accepted.has(b.key)} onToggle={() => toggle(b.key)}>
                    <p className="text-xs text-gray-500 line-through decoration-gray-300">{b.original}</p>
                    <After before={b.original} after={b.text} />
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {b.keywords.map((k) => (
                        <span key={k} className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">+ {k}</span>
                      ))}
                      {b.reason && <span className="text-gray-500">{b.reason}</span>}
                    </div>
                  </Row>
                ))}
              </div>
            </section>
          ))}

          {result.skills.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Add to skills</h3>
              <div className="space-y-2">
                {result.skills.map((s) => (
                  <Row key={s.key} checked={accepted.has(s.key)} onToggle={() => toggle(s.key)}>
                    <p className="text-sm font-medium">{s.skill}</p>
                    <p className="text-xs text-gray-500">Your resume shows it: &ldquo;{s.evidence}&rdquo;</p>
                  </Row>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}
