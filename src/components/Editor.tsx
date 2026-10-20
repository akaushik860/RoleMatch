"use client";

import { useState } from "react";
import { uid } from "@/lib/sample";
import type { Education, Experience, Project, Resume, SkillGroup } from "@/lib/types";

const inputCls =
  "w-full min-w-0 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Bullets({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1 block text-xs font-medium text-gray-600">
        Bullet points <span className="font-normal text-gray-400">(one per line, start with an action verb, add a number)</span>
      </span>
      <textarea
        className={`${inputCls} min-h-28 leading-relaxed`}
        value={value.join("\n")}
        placeholder={"Built X that did Y, resulting in Z%\nLed ..."}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    </label>
  );
}

function Panel({
  title,
  children,
  defaultOpen = true,
  count,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold">
          {title}
          {count !== undefined && <span className="ml-2 text-xs font-normal text-gray-400">{count}</span>}
        </span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="space-y-3 border-t border-gray-100 px-4 py-4">{children}</div>}
    </section>
  );
}

function ItemCard({
  title,
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const btn = "rounded px-1.5 py-0.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30";
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-gray-700">{title}</span>
        <div className="flex shrink-0 items-center gap-0.5 text-sm">
          <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
          <button type="button" className={btn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
          <button type="button" className={`${btn} hover:text-red-600`} onClick={onRemove} aria-label="Remove">✕</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand"
    >
      + {label}
    </button>
  );
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Edits one list field of the resume (experience, projects, ...). */
function useList<K extends "experience" | "education" | "projects" | "skills">(
  resume: Resume,
  onChange: (r: Resume) => void,
  key: K,
) {
  type Item = Resume[K][number];
  const list = resume[key] as Item[];
  const set = (next: Item[]) => onChange({ ...resume, [key]: next });
  return {
    list,
    update: (i: number, patch: Partial<Item>) => set(list.map((x, j) => (j === i ? { ...x, ...patch } : x))),
    add: (item: Item) => set([...list, item]),
    remove: (i: number) => set(list.filter((_, j) => j !== i)),
    move: (i: number, dir: -1 | 1) => set(move(list, i, dir)),
  };
}

export default function Editor({ resume, onChange }: { resume: Resume; onChange: (r: Resume) => void }) {
  const b = resume.basics;
  const setBasics = (patch: Partial<Resume["basics"]>) => onChange({ ...resume, basics: { ...b, ...patch } });
  const exp = useList(resume, onChange, "experience");
  const edu = useList(resume, onChange, "education");
  const proj = useList(resume, onChange, "projects");
  const skills = useList(resume, onChange, "skills");

  return (
    <div className="space-y-3">
      <Panel title="Personal details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={b.name} placeholder="e.g. Priya Sharma" onChange={(v) => setBasics({ name: v })} />
          <Field label="Headline" value={b.headline} placeholder="e.g. Software Engineer" onChange={(v) => setBasics({ headline: v })} />
          <Field label="Email" value={b.email} placeholder="you@email.com" onChange={(v) => setBasics({ email: v })} />
          <Field label="Phone" value={b.phone} placeholder="+91 98765 43210" onChange={(v) => setBasics({ phone: v })} />
          <Field label="Location" value={b.location} placeholder="City, Country" onChange={(v) => setBasics({ location: v })} />
        </div>
        <div className="space-y-2">
          <span className="block text-xs font-medium text-gray-600">Links (LinkedIn, GitHub, portfolio)</span>
          {b.links.map((l, i) => (
            <div key={l.id} className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Shown as, e.g. linkedin.com/in/you"
                value={l.label}
                onChange={(e) => setBasics({ links: b.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              />
              <input
                className={inputCls}
                placeholder="https://..."
                value={l.url}
                onChange={(e) => setBasics({ links: b.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
              />
              <button
                type="button"
                className="px-2 text-gray-400 hover:text-red-600"
                aria-label="Remove link"
                onClick={() => setBasics({ links: b.links.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
          <AddButton label="Add link" onClick={() => setBasics({ links: [...b.links, { id: uid(), label: "", url: "" }] })} />
        </div>
      </Panel>

      <Panel title="Summary">
        <textarea
          className={`${inputCls} min-h-24 leading-relaxed`}
          value={resume.summary}
          placeholder="2–3 lines: who you are, years of experience, your strongest result."
          onChange={(e) => onChange({ ...resume, summary: e.target.value })}
        />
      </Panel>

      <Panel title="Experience" count={exp.list.length}>
        {exp.list.map((e: Experience, i) => (
          <ItemCard key={e.id} title={e.company || e.role || "New role"} index={i} total={exp.list.length} onMove={(d) => exp.move(i, d)} onRemove={() => exp.remove(i)}>
            <Field label="Company" value={e.company} placeholder="e.g. Infosys" onChange={(v) => exp.update(i, { company: v })} />
            <Field label="Job title" value={e.role} placeholder="e.g. Software Engineer" onChange={(v) => exp.update(i, { role: v })} />
            <Field label="Start" value={e.start} placeholder="Jan 2023" onChange={(v) => exp.update(i, { start: v })} />
            <Field label="End" value={e.end} placeholder="Present" onChange={(v) => exp.update(i, { end: v })} />
            <Field label="Location" value={e.location} placeholder="e.g. Pune, India or Remote" className="sm:col-span-2" onChange={(v) => exp.update(i, { location: v })} />
            <Bullets value={e.bullets} onChange={(v) => exp.update(i, { bullets: v })} />
          </ItemCard>
        ))}
        <AddButton label="Add role" onClick={() => exp.add({ id: uid(), company: "", role: "", location: "", start: "", end: "", bullets: [] })} />
      </Panel>

      <Panel title="Projects" count={proj.list.length} defaultOpen={false}>
        {proj.list.map((p: Project, i) => (
          <ItemCard key={p.id} title={p.name || "New project"} index={i} total={proj.list.length} onMove={(d) => proj.move(i, d)} onRemove={() => proj.remove(i)}>
            <Field label="Project name" value={p.name} placeholder="e.g. Expense tracker app" onChange={(v) => proj.update(i, { name: v })} />
            <Field label="Tech used" value={p.tech} placeholder="React, Node.js" onChange={(v) => proj.update(i, { tech: v })} />
            <Field label="Link" value={p.link} placeholder="https://..." onChange={(v) => proj.update(i, { link: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" value={p.start} placeholder="Mar 2024" onChange={(v) => proj.update(i, { start: v })} />
              <Field label="End" value={p.end} placeholder="Jun 2024" onChange={(v) => proj.update(i, { end: v })} />
            </div>
            <Bullets value={p.bullets} onChange={(v) => proj.update(i, { bullets: v })} />
          </ItemCard>
        ))}
        <AddButton label="Add project" onClick={() => proj.add({ id: uid(), name: "", tech: "", link: "", start: "", end: "", bullets: [] })} />
      </Panel>

      <Panel title="Education" count={edu.list.length} defaultOpen={false}>
        {edu.list.map((e: Education, i) => (
          <ItemCard key={e.id} title={e.school || "New school"} index={i} total={edu.list.length} onMove={(d) => edu.move(i, d)} onRemove={() => edu.remove(i)}>
            <Field label="School" value={e.school} placeholder="e.g. VIT Vellore" onChange={(v) => edu.update(i, { school: v })} />
            <Field label="Degree" value={e.degree} placeholder="B.Tech in Computer Science" onChange={(v) => edu.update(i, { degree: v })} />
            <Field label="Start" value={e.start} placeholder="Aug 2019" onChange={(v) => edu.update(i, { start: v })} />
            <Field label="End" value={e.end} placeholder="May 2023" onChange={(v) => edu.update(i, { end: v })} />
            <Field label="Location" value={e.location} placeholder="City, Country" onChange={(v) => edu.update(i, { location: v })} />
            <Field label="Details" value={e.details} placeholder="GPA, honours, coursework" onChange={(v) => edu.update(i, { details: v })} />
          </ItemCard>
        ))}
        <AddButton label="Add education" onClick={() => edu.add({ id: uid(), school: "", degree: "", location: "", start: "", end: "", details: "" })} />
      </Panel>

      <Panel title="Skills" count={skills.list.length}>
        {skills.list.map((s: SkillGroup, i) => (
          <ItemCard key={s.id} title={s.label || "Skill group"} index={i} total={skills.list.length} onMove={(d) => skills.move(i, d)} onRemove={() => skills.remove(i)}>
            <Field label="Group" value={s.label} placeholder="Languages" onChange={(v) => skills.update(i, { label: v })} />
            <Field label="Skills (comma separated)" value={s.items} placeholder="Python, SQL" onChange={(v) => skills.update(i, { items: v })} />
          </ItemCard>
        ))}
        <AddButton label="Add skill group" onClick={() => skills.add({ id: uid(), label: "", items: "" })} />
      </Panel>
    </div>
  );
}
