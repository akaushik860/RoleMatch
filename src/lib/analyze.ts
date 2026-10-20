import { CASE_SENSITIVE, DICTIONARY, type DictTerm, type Domain } from "./dictionary";
import type { Resume } from "./types";

// ---------- text helpers ----------

export function bulletsOf(resume: Resume): string[] {
  return [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
  ]
    .map((b) => b.trim())
    .filter(Boolean);
}

export function resumeText(resume: Resume): string {
  const b = resume.basics;
  return [
    b.headline,
    resume.summary,
    ...resume.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.name, p.tech, ...p.bullets]),
    ...resume.education.flatMap((e) => [e.degree, e.school, e.details]),
    ...resume.skills.flatMap((s) => [s.label, s.items]),
  ].join("\n");
}

function evidenceText(resume: Resume): string {
  return [
    resume.summary,
    ...resume.experience.flatMap((e) => [e.role, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.tech, ...p.bullets]),
  ].join("\n");
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const aliasRegexCache = new Map<string, RegExp>();
function aliasRegex(alias: string): RegExp {
  let re = aliasRegexCache.get(alias);
  if (!re) {
    re = new RegExp(`(?<![A-Za-z0-9+#.])${escapeRe(alias)}(?![A-Za-z0-9+#])`, "gi");
    aliasRegexCache.set(alias, re);
  }
  re.lastIndex = 0;
  return re;
}

function countTerm(text: string, term: DictTerm): number {
  // Max, not sum: aliases overlap ("REST" and "REST APIs" match the same words).
  let n = 0;
  for (const alias of term.aliases) {
    const matches = text.match(aliasRegex(alias)) ?? [];
    const c = CASE_SENSITIVE.has(alias) ? matches.filter((m) => m !== m.toLowerCase()).length : matches.length;
    n = Math.max(n, c);
  }
  return n;
}

// ---------- job description parsing ----------

export interface Keyword {
  display: string;
  kind: "skill" | "term";
  domain: Domain;
  category: string;
  count: number;
  required: boolean;
  preferred: boolean;
  weight: number;
  matched: boolean;
  /** Matched only in the Skills list, not backed by any bullet or summary. */
  skillsOnly: boolean;
}

const STOPWORDS = new Set(
  (
    "a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each else etc ever every few for from further get got had has have having he her here hers him his how i if in into is it its itself just like make many may me more most much must my no nor not now of off on once only or other our ours out over own per same she should so some such than that the their theirs them then there these they this those through to too under until up upon us very via was we well were what when where which while who whom why will with within without would yet you your yours " +
    // Generic job-ad words that never help ranking.
    "ability able across ad additional applicant applicants apply benefit benefits best bonus build building candidate candidates career company role roles position job jobs work working team teams teammates experience experienced experiences year years skill skills strong excellent good great knowledge understanding responsibilities responsibility requirement requirements required qualification qualifications preferred plus including include includes etc opportunity opportunities environment looking join new using use used help ensure provide support within world class fast paced paced high level day days time based minimum least degree equivalent related field background who what offer offers salary range pay equal employer status gender race religion location remote hybrid office full part type please submit resume cv apply today must nice have bonus points ideal ideally key strongly highly demonstrated proven track record familiarity familiar comfortable passion passionate love enjoy want wants need needs needed will would make makes made drive driven impact global customers customer clients client users user people others products product services service business businesses solutions solution systems system across multiple various different own owning"
  ).split(/\s+/),
);

type Mode = "required" | "preferred" | "neutral";

function lineMode(line: string, current: Mode): Mode {
  const l = line.toLowerCase();
  const isHeader = line.trim().length < 60 && !/[.]\s*$/.test(line.trim());
  if (/nice to have|preferred|bonus|good to have|a plus|desirable/.test(l)) {
    return isHeader ? "preferred" : current === "neutral" ? "preferred" : current;
  }
  if (/requirement|qualification|must have|what you('|’)?ll need|you have|you bring|minimum|required/.test(l)) {
    return "required";
  }
  if (isHeader && /about|responsibilit|what you('|’)?ll do|benefit|perks|offer/.test(l)) return "neutral";
  return current;
}

export function extractKeywords(jd: string): Omit<Keyword, "matched" | "skillsOnly">[] {
  const lines = jd.split(/\r?\n/);
  const found = new Map<string, { term: DictTerm; count: number; required: boolean; preferred: boolean }>();
  let mode: Mode = "neutral";

  for (const line of lines) {
    if (!line.trim()) continue;
    mode = lineMode(line, mode);
    const lineL = line.toLowerCase();
    const lineRequired = mode === "required" || /\b(required|must)\b/.test(lineL);
    const linePreferred = !lineRequired && (mode === "preferred" || /\b(preferred|plus|bonus|nice)\b/.test(lineL));
    for (const term of DICTIONARY) {
      const n = countTerm(line, term);
      if (!n) continue;
      const prev = found.get(term.display) ?? { term, count: 0, required: false, preferred: false };
      prev.count += n;
      prev.required ||= lineRequired;
      prev.preferred ||= linePreferred;
      found.set(term.display, prev);
    }
  }

  const skills = [...found.values()].map(({ term, count, required, preferred }) => {
    const isPreferred = preferred && !required;
    const base = required ? 1.5 : isPreferred ? 0.7 : 1;
    const softDiscount = term.domain === "general" ? 0.5 : 1;
    return {
      display: term.display,
      kind: "skill" as const,
      domain: term.domain,
      category: term.category,
      count,
      required,
      preferred: isPreferred,
      weight: base * softDiscount * (1 + Math.min(count - 1, 3) * 0.25),
    };
  });

  return [...skills, ...extractRecurringTerms(jd)].sort((a, b) => b.weight - a.weight);
}

/** Words the JD repeats that are not in the dictionary (catches niche domains). */
function extractRecurringTerms(jd: string): Omit<Keyword, "matched" | "skillsOnly">[] {
  const covered = new Set(DICTIONARY.flatMap((t) => t.aliases.flatMap((a) => a.split(/\s+/))));
  const words = jd.toLowerCase().match(/[a-z][a-z+#-]{2,}/g) ?? [];
  const counts = new Map<string, number>();
  for (const w of words) {
    if (STOPWORDS.has(w) || covered.has(w) || w.length < 4) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w, n]) => ({
      display: w,
      kind: "term" as const,
      domain: "general" as Domain,
      category: "term",
      count: n,
      required: false,
      preferred: false,
      weight: 0.4 + Math.min(n - 3, 4) * 0.1,
    }));
}

// ---------- domain detection ----------

export function domainProfile(text: string): { top: Domain | null; hits: Partial<Record<Domain, number>>; total: number } {
  const hits: Partial<Record<Domain, number>> = {};
  let total = 0;
  for (const term of DICTIONARY) {
    if (term.domain === "general") continue;
    if (countTerm(text, term) > 0) {
      hits[term.domain] = (hits[term.domain] ?? 0) + 1;
      total++;
    }
  }
  const top = (Object.entries(hits).sort((a, b) => b[1] - a[1])[0]?.[0] as Domain) ?? null;
  return { top, hits, total };
}

export interface DomainCheck {
  mismatch: boolean;
  jdDomain: Domain | null;
  resumeDomain: Domain | null;
}

export function checkDomain(resume: Resume, jd: string): DomainCheck {
  const j = domainProfile(jd);
  const r = domainProfile(resumeText(resume));
  const mismatch =
    j.total >= 3 &&
    r.total >= 3 &&
    j.top !== r.top &&
    (r.hits[j.top!] ?? 0) / r.total < 0.2;
  return { mismatch, jdDomain: j.top, resumeDomain: r.top };
}

// ---------- quality checks ----------

export type Severity = "error" | "warn" | "tip";
export interface Issue {
  id: string;
  severity: Severity;
  title: string;
  detail?: string;
}

const NUMBER_RE = /\d|%|\$|₹|€|£/;
const WEAK_OPENERS = ["responsible for", "worked on", "helped", "assisted", "involved in", "duties included", "tasked with", "participated in", "in charge of"];
const BUZZWORDS = ["team player", "hard-working", "hardworking", "go-getter", "synergy", "detail-oriented", "results-driven", "think outside the box", "self-starter", "dynamic", "passionate", "rockstar", "ninja", "guru", "best of breed", "motivated individual"];
const PRESENT_VERBS = new Set("build develop manage lead create design implement drive own write work help maintain improve deliver analyze analyse support coordinate collaborate handle test deploy optimize optimise mentor run plan launch reduce increase automate migrate architect research conduct prepare negotiate train".split(" "));
const PRESENT_RE = /present|current|now|ongoing/i;

function datePattern(d: string): string | null {
  const s = d.trim();
  if (!s || PRESENT_RE.test(s)) return null;
  if (/^[A-Za-z]{3}\.? \d{4}$/.test(s)) return "Mon YYYY";
  if (/^[A-Za-z]{4,} \d{4}$/.test(s)) return "Month YYYY";
  if (/^\d{1,2}\/\d{4}$/.test(s)) return "MM/YYYY";
  if (/^\d{4}-\d{2}$/.test(s)) return "YYYY-MM";
  if (/^\d{4}$/.test(s)) return "YYYY";
  return "other";
}

const short = (s: string, n = 60) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function qualityIssues(resume: Resume, pages: number): Issue[] {
  const issues: Issue[] = [];
  const b = resume.basics;
  const bullets = bulletsOf(resume);

  if (!b.name.trim()) issues.push({ id: "name", severity: "error", title: "Add your name" });
  if (!b.email.trim()) issues.push({ id: "email", severity: "error", title: "Add an email address" });
  if (!b.phone.trim()) issues.push({ id: "phone", severity: "warn", title: "Add a phone number" });
  if (!b.links.some((l) => /linkedin/i.test(l.url + l.label)))
    issues.push({ id: "linkedin", severity: "tip", title: "Add your LinkedIn profile", detail: "Most recruiters check it before calling you." });

  if (pages > 1.02) {
    issues.push({
      id: "length",
      severity: pages > 2.02 ? "error" : "warn",
      title: `Resume is ${Math.ceil(pages)} pages`,
      detail: "Under 10 years of experience? Aim for one page. Cut older or weaker bullets first.",
    });
  }

  const pronounHits = [resume.summary, ...bullets].filter((t) => /\b(I|me|my|mine|myself)\b/.test(t));
  if (pronounHits.length)
    issues.push({ id: "pronouns", severity: "warn", title: "Remove first-person words (I, me, my)", detail: `e.g. "${short(pronounHits[0])}"` });

  const weak = bullets.filter((t) => WEAK_OPENERS.some((w) => t.toLowerCase().startsWith(w)));
  if (weak.length)
    issues.push({ id: "weak", severity: "warn", title: `${weak.length} bullet${weak.length > 1 ? "s" : ""} start with a weak phrase`, detail: `Start with an action verb instead, e.g. "Built", "Led", "Reduced". Found: "${short(weak[0])}"` });

  const buzz = BUZZWORDS.filter((w) => resumeText(resume).toLowerCase().includes(w));
  if (buzz.length)
    issues.push({ id: "buzz", severity: "tip", title: "Replace buzzwords with evidence", detail: `Found: ${buzz.map((w) => `"${w}"`).join(", ")}. Show it with a result instead.` });

  const noNumbers = bullets.filter((t) => !NUMBER_RE.test(t));
  if (bullets.length && noNumbers.length / bullets.length > 0.4)
    issues.push({ id: "numbers", severity: "warn", title: `${noNumbers.length} of ${bullets.length} bullets have no numbers`, detail: `Add scale or results: users, %, time saved, revenue. e.g. "${short(noNumbers[0])}"` });

  const long = bullets.filter((t) => t.length > 220);
  if (long.length)
    issues.push({ id: "long", severity: "tip", title: `${long.length} bullet${long.length > 1 ? "s are" : " is"} longer than two lines`, detail: `Split or trim: "${short(long[0])}"` });

  for (const e of resume.experience) {
    if (e.bullets.filter((x) => x.trim()).length < 2 && (e.company || e.role))
      issues.push({ id: `few-${e.id}`, severity: "tip", title: `Add more bullets to ${e.company || e.role}`, detail: "Two to five bullets per role reads best." });
    if (e.end && !PRESENT_RE.test(e.end)) {
      const present = e.bullets.find((x) => PRESENT_VERBS.has(x.trim().split(/\s+/)[0]?.toLowerCase() ?? ""));
      if (present)
        issues.push({ id: `tense-${e.id}`, severity: "warn", title: `Use past tense for ${e.company || "past roles"}`, detail: `"${short(present)}" should start with a past-tense verb.` });
    }
  }

  const firstWords = bullets.map((t) => t.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
  const counts = new Map<string, number>();
  firstWords.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  const repeated = [...counts.entries()].filter(([, n]) => n >= 3);
  if (repeated.length)
    issues.push({ id: "repeat", severity: "tip", title: "Vary your action verbs", detail: repeated.map(([w, n]) => `"${w}" ×${n}`).join(", ") });

  const patterns = new Set(
    [...resume.experience, ...resume.education, ...resume.projects]
      .flatMap((x) => [x.start, x.end])
      .map(datePattern)
      .filter((p): p is string => !!p),
  );
  if (patterns.size > 1)
    issues.push({ id: "dates", severity: "warn", title: "Use one date format everywhere", detail: `Found: ${[...patterns].join(", ")}. "Jan 2024" is the safest.` });

  if (!resume.skills.some((s) => s.items.trim()))
    issues.push({ id: "skills", severity: "error", title: "Add a skills section", detail: "ATS keyword matching leans heavily on it." });
  if (!resume.education.length) issues.push({ id: "edu", severity: "warn", title: "Add your education" });
  if (!resume.experience.length && !resume.projects.length)
    issues.push({ id: "exp", severity: "error", title: "Add experience or projects" });

  return issues;
}

// ---------- score ----------

export interface Analysis {
  hasJd: boolean;
  score: number;
  parts: { label: string; value: number; weight: number }[];
  keywords: Keyword[];
  issues: Issue[];
  domain: DomainCheck;
}

export function analyze(resume: Resume, jd: string, pages: number): Analysis {
  const issues = qualityIssues(resume, pages);
  const bullets = bulletsOf(resume);
  const full = resumeText(resume);
  const evidence = evidenceText(resume);

  const keywords: Keyword[] = extractKeywords(jd).map((k) => {
    const term = DICTIONARY.find((t) => t.display === k.display);
    const fallback: DictTerm = { display: k.display, aliases: [k.display.toLowerCase()], domain: "general", category: "term" };
    const t = term ?? fallback;
    const matched = countTerm(full, t) > 0;
    return { ...k, matched, skillsOnly: matched && k.kind === "skill" && countTerm(evidence, t) === 0 };
  });

  const totalW = keywords.reduce((s, k) => s + k.weight, 0);
  const matchedW = keywords.filter((k) => k.matched).reduce((s, k) => s + k.weight, 0);
  const keywordScore = totalW ? (matchedW / totalW) * 100 : 0;

  const withNumbers = bullets.filter((t) => NUMBER_RE.test(t)).length;
  const impactScore = bullets.length ? Math.min(1, withNumbers / bullets.length / 0.6) * 100 : 0;

  const b = resume.basics;
  const checks = [
    !!b.name.trim(),
    !!b.email.trim(),
    !!b.phone.trim(),
    b.links.length > 0,
    !!resume.summary.trim(),
    resume.experience.length + resume.projects.length > 0,
    resume.education.length > 0,
    resume.skills.some((s) => s.items.trim()),
    resume.experience.every((e) => e.bullets.filter((x) => x.trim()).length >= 2),
  ];
  const completeness = (checks.filter(Boolean).length / checks.length) * 100;

  const penalty = issues.reduce((s, i) => s + (i.severity === "error" ? 12 : i.severity === "warn" ? 6 : 2), 0);
  const quality = Math.max(0, 100 - penalty);

  const hasJd = jd.trim().length > 40 && keywords.length > 0;
  const parts = hasJd
    ? [
        { label: "Keyword match", value: keywordScore, weight: 0.6 },
        { label: "Measurable impact", value: impactScore, weight: 0.15 },
        { label: "Completeness", value: completeness, weight: 0.15 },
        { label: "Writing quality", value: quality, weight: 0.1 },
      ]
    : [
        { label: "Measurable impact", value: impactScore, weight: 0.4 },
        { label: "Completeness", value: completeness, weight: 0.35 },
        { label: "Writing quality", value: quality, weight: 0.25 },
      ];
  const score = Math.round(parts.reduce((s, p) => s + p.value * p.weight, 0));

  return { hasJd, score, parts, keywords, issues, domain: checkDomain(resume, jd) };
}

// ---------- adding a missing skill ----------

const CATEGORY_LABEL_RE: Record<string, RegExp> = {
  languages: /language/i,
  frameworks: /framework|librar|stack/i,
  cloud: /cloud|devops|infra|tool/i,
  data: /data|database|ml|ai|analytics/i,
  tools: /tool|technolog/i,
};

export function addSkill(resume: Resume, display: string, category: string, makeId: () => string): Resume {
  const groups = resume.skills;
  if (!groups.length) {
    return { ...resume, skills: [{ id: makeId(), label: "Skills", items: display }] };
  }
  const re = CATEGORY_LABEL_RE[category];
  const idx = Math.max(re ? groups.findIndex((g) => re.test(g.label)) : -1, -1);
  const target = idx >= 0 ? idx : groups.length - 1;
  return {
    ...resume,
    skills: groups.map((g, i) =>
      i === target ? { ...g, items: g.items.trim() ? `${g.items.replace(/[,\s]+$/, "")}, ${display}` : display } : g,
    ),
  };
}

// ---------- helpers for AI guardrails ----------

/** Dictionary terms mentioned anywhere in `text`. */
export function dictTermsIn(text: string): DictTerm[] {
  return DICTIONARY.filter((t) => countTerm(text, t) > 0);
}

export function categoryOf(display: string): string {
  return DICTIONARY.find((t) => t.display.toLowerCase() === display.toLowerCase())?.category ?? "tools";
}
