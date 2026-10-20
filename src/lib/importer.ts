import { uid } from "./sample";
import type { Resume } from "./types";

const s = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const arr = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
const lines = (v: unknown) => (Array.isArray(v) ? v.map(s).map((b) => b.replace(/^[-•*▪◦●]\s*/, "")).filter(Boolean) : []);

function url(v: unknown) {
  const u = s(v);
  if (!u) return "";
  if (/^mailto:|^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

/** Turns whatever the AI returned into a valid Resume, never throwing. */
export function normalizeImported(raw: unknown): Resume {
  const r = (raw ?? {}) as Record<string, unknown>;
  const b = (r.basics ?? {}) as Record<string, unknown>;
  return {
    basics: {
      name: s(b.name),
      headline: s(b.headline),
      email: s(b.email),
      phone: s(b.phone),
      location: s(b.location),
      links: arr(b.links)
        .map((l) => ({ id: uid(), label: s(l.label) || s(l.url).replace(/^https?:\/\/(www\.)?/, ""), url: url(l.url || l.label) }))
        .filter((l) => l.label || l.url),
    },
    summary: s(r.summary),
    experience: arr(r.experience).map((e) => ({
      id: uid(),
      company: s(e.company),
      role: s(e.role),
      location: s(e.location),
      start: s(e.start),
      end: s(e.end),
      bullets: lines(e.bullets),
    })),
    education: arr(r.education).map((e) => ({
      id: uid(),
      school: s(e.school),
      degree: s(e.degree),
      location: s(e.location),
      start: s(e.start),
      end: s(e.end),
      details: s(e.details),
    })),
    projects: arr(r.projects).map((p) => ({
      id: uid(),
      name: s(p.name),
      tech: s(p.tech),
      link: s(p.link) ? url(p.link) : "",
      start: s(p.start),
      end: s(p.end),
      bullets: lines(p.bullets),
    })),
    skills: arr(r.skills)
      .map((g) => ({ id: uid(), label: s(g.label), items: Array.isArray(g.items) ? g.items.map(s).join(", ") : s(g.items) }))
      .filter((g) => g.items),
  };
}

export function looksEmpty(r: Resume): boolean {
  return !r.basics.name && r.experience.length === 0 && r.education.length === 0 && r.skills.length === 0;
}
