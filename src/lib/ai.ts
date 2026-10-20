// Shared by the API routes and the UI: how resume content is referenced in
// prompts, how AI output is checked before the user sees it, and how accepted
// suggestions are applied.
import { addSkill, categoryOf, dictTermsIn, resumeText } from "./analyze";
import { DICTIONARY } from "./dictionary";
import type { Resume } from "./types";

export type Section = "experience" | "projects";

export interface BulletRef {
  section: Section;
  itemId: string;
  index: number;
  original: string;
  context: string;
}

export interface KeywordUse {
  keyword: string;
  evidence: string;
}

export interface BulletSuggestion {
  key: string;
  section: Section;
  itemId: string;
  index: number;
  context: string;
  original: string;
  text: string;
  keywords: string[];
  reason: string;
}

export interface SummarySuggestion {
  key: "summary";
  original: string;
  text: string;
  reason: string;
}

export interface SkillSuggestion {
  key: string;
  skill: string;
  evidence: string;
}

export interface TailorResult {
  summary: SummarySuggestion | null;
  bullets: BulletSuggestion[];
  skills: SkillSuggestion[];
  /** Suggestions dropped because they added facts not in the resume. */
  discarded: number;
}

// ---------- references used inside prompts ----------

export function buildRefs(resume: Resume): Map<string, BulletRef> {
  const refs = new Map<string, BulletRef>();
  resume.experience.forEach((e, i) =>
    e.bullets.forEach((b, j) => {
      if (b.trim()) refs.set(`E${i}.${j}`, { section: "experience", itemId: e.id, index: j, original: b.trim(), context: e.company || e.role });
    }),
  );
  resume.projects.forEach((p, i) =>
    p.bullets.forEach((b, j) => {
      if (b.trim()) refs.set(`P${i}.${j}`, { section: "projects", itemId: p.id, index: j, original: b.trim(), context: p.name });
    }),
  );
  return refs;
}

/** Resume as plain text with [ref] markers on each bullet. */
export function resumeForPrompt(resume: Resume): string {
  const lines: string[] = [];
  const b = resume.basics;
  lines.push(`HEADLINE: ${b.headline}`);
  lines.push(`SUMMARY: ${resume.summary || "(none)"}`);
  resume.experience.forEach((e, i) => {
    lines.push(`\nROLE: ${e.role} at ${e.company} (${e.start} – ${e.end || "?"})`);
    e.bullets.forEach((x, j) => x.trim() && lines.push(`[E${i}.${j}] ${x.trim()}`));
  });
  resume.projects.forEach((p, i) => {
    lines.push(`\nPROJECT: ${p.name}${p.tech ? ` (${p.tech})` : ""}`);
    p.bullets.forEach((x, j) => x.trim() && lines.push(`[P${i}.${j}] ${x.trim()}`));
  });
  lines.push(`\nEDUCATION: ${resume.education.map((e) => `${e.degree}, ${e.school}`).join("; ")}`);
  lines.push(`SKILLS: ${resume.skills.map((s) => `${s.label}: ${s.items}`).join(" | ")}`);
  return lines.join("\n");
}

// ---------- guardrails ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#%.]+/g, " ").trim();
const numbers = (s: string) => (s.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/,/g, ""));
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** True if every number in `next` already appears in `source`. */
export function noNewNumbers(next: string, source: string): boolean {
  const have = new Set(numbers(source));
  return numbers(next).every((n) => have.has(n));
}

function quoteIsReal(quote: string, haystack: string): boolean {
  const q = norm(quote);
  return q.length >= 3 && norm(haystack).includes(q);
}

/** The quote must actually be about the keyword: share a word with it or one of its aliases. */
function quoteMentions(keyword: string, quote: string): boolean {
  const term = DICTIONARY.find((t) => t.display.toLowerCase() === keyword.toLowerCase());
  const names = term ? term.aliases : [keyword.toLowerCase()];
  const words = new Set(norm(quote).split(" "));
  return names.some((n) => norm(n).split(" ").some((w) => w.length >= 2 && words.has(w)));
}

const backs = (u: KeywordUse, full: string) => quoteIsReal(u.evidence, full) && quoteMentions(u.keyword, u.evidence);

/**
 * Tools/skills the rewrite mentions that the resume doesn't, unless the model
 * quoted real evidence for them from the resume.
 */
function unbackedTerms(next: string, fullResume: string, uses: KeywordUse[]): string[] {
  const known = new Set(dictTermsIn(fullResume).map((t) => t.display));
  return dictTermsIn(next)
    .filter((t) => !known.has(t.display))
    .filter((t) => !uses.some((u) => u.keyword.toLowerCase() === t.display.toLowerCase() && backs(u, fullResume)))
    .map((t) => t.display);
}

function parseUses(v: unknown): KeywordUse[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((u) => (typeof u === "string" ? { keyword: u, evidence: "" } : { keyword: str(u?.keyword), evidence: str(u?.evidence) }))
    .filter((u) => u.keyword);
}

export function validateTailor(raw: unknown, resume: Resume, missing: string[]): TailorResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  const refs = buildRefs(resume);
  const full = resumeText(resume);
  let discarded = 0;

  let summary: SummarySuggestion | null = null;
  const s = (r.summary ?? null) as Record<string, unknown> | null;
  const sText = str(s?.text);
  if (sText && sText !== resume.summary.trim()) {
    if (noNewNumbers(sText, full) && unbackedTerms(sText, full, parseUses(s?.keywords)).length === 0 && sText.length <= 600) {
      summary = { key: "summary", original: resume.summary.trim(), text: sText, reason: str(s?.reason) };
    } else discarded++;
  }

  const bullets: BulletSuggestion[] = [];
  const seen = new Set<string>();
  for (const item of Array.isArray(r.bullets) ? r.bullets : []) {
    const ref = str(item?.ref).replace(/[[\]]/g, "");
    const target = refs.get(ref);
    const text = str(item?.text).replace(/^[-•*]\s*/, "");
    if (!target || !text || seen.has(ref) || text === target.original) continue;
    const uses = parseUses(item?.keywords);
    const ok = noNewNumbers(text, target.original) && unbackedTerms(text, full, uses).length === 0 && text.length <= 260;
    if (!ok) {
      discarded++;
      continue;
    }
    seen.add(ref);
    bullets.push({
      key: ref,
      section: target.section,
      itemId: target.itemId,
      index: target.index,
      context: target.context,
      original: target.original,
      text,
      keywords: uses.map((u) => u.keyword).filter((k) => norm(text).includes(norm(k))),
      reason: str(item?.reason),
    });
  }

  const missingSet = new Map(missing.map((m) => [m.toLowerCase(), m]));
  const skills: SkillSuggestion[] = [];
  for (const item of Array.isArray(r.skills) ? r.skills : []) {
    const name = missingSet.get(str(item?.skill).toLowerCase());
    const evidence = str(item?.evidence);
    if (!name) continue;
    if (!backs({ keyword: name, evidence }, full)) {
      discarded++;
      continue;
    }
    if (!skills.some((x) => x.skill === name)) skills.push({ key: `skill:${name}`, skill: name, evidence });
  }

  return { summary, bullets, skills, discarded };
}

// ---------- applying accepted suggestions ----------

export function applyTailor(resume: Resume, result: TailorResult, accepted: Set<string>, makeId: () => string): Resume {
  let next: Resume = structuredClone(resume);
  if (result.summary && accepted.has("summary")) next.summary = result.summary.text;
  for (const b of result.bullets) {
    if (!accepted.has(b.key)) continue;
    const list = next[b.section] as { id: string; bullets: string[] }[];
    const item = list.find((x) => x.id === b.itemId);
    // Only replace if the user hasn't edited that bullet since asking.
    if (item && item.bullets[b.index]?.trim() === b.original) item.bullets[b.index] = b.text;
  }
  for (const s of result.skills) {
    if (accepted.has(s.key)) next = addSkill(next, s.skill, categoryOf(s.skill), makeId);
  }
  return next;
}

export function allKeys(result: TailorResult): string[] {
  return [...(result.summary ? ["summary"] : []), ...result.bullets.map((b) => b.key), ...result.skills.map((s) => s.key)];
}
