import { Fragment } from "react";
import type { Resume, Settings } from "@/lib/types";

const clean = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean);

function dateRange(start: string, end: string) {
  const s = start.trim();
  const e = end.trim();
  if (s && e) return `${s} – ${e}`;
  return s || e;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-title">{title}</div>
      {children}
    </section>
  );
}

/** The resume itself. Pure markup + CSS so it prints as real, selectable text. */
export default function ResumeDocument({ resume, settings }: { resume: Resume; settings: Settings }) {
  const { basics, summary, experience, education, projects, skills } = resume;
  const contact = [
    basics.phone && { text: basics.phone },
    basics.email && { text: basics.email, href: `mailto:${basics.email}` },
    basics.location && { text: basics.location },
    ...basics.links.filter((l) => l.label || l.url).map((l) => ({ text: l.label || l.url, href: l.url })),
  ].filter(Boolean) as { text: string; href?: string }[];

  const skillRows = skills.filter((s) => s.items.trim());

  return (
    <div className={`resume-page tpl-${settings.template} paper-${settings.paper}`}>
      <header>
        <div className="name">{basics.name || "Your Name"}</div>
        {basics.headline && <div className="headline">{basics.headline}</div>}
        {contact.length > 0 && (
          <div className="contact">
            {contact.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="sep">|</span>}
                {c.href ? <a href={c.href}>{c.text}</a> : <span>{c.text}</span>}
              </Fragment>
            ))}
          </div>
        )}
      </header>

      {summary.trim() && (
        <Section title="Summary">
          <p>{summary}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          {experience.map((e) => (
            <div className="entry" key={e.id}>
              <div className="entry-head">
                <div className="row">
                  <span className="org">{e.company}</span>
                  <span>{dateRange(e.start, e.end)}</span>
                </div>
                {(e.role || e.location) && (
                  <div className="row sub">
                    <span>{e.role}</span>
                    <span>{e.location}</span>
                  </div>
                )}
              </div>
              {clean(e.bullets).length > 0 && (
                <ul>
                  {clean(e.bullets).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((p) => (
            <div className="entry" key={p.id}>
              <div className="row entry-head">
                <span>
                  <span className="org">{p.link ? <a href={p.link}>{p.name}</a> : p.name}</span>
                  {p.tech && <span className="sub"> | {p.tech}</span>}
                </span>
                <span>{dateRange(p.start, p.end)}</span>
              </div>
              {clean(p.bullets).length > 0 && (
                <ul>
                  {clean(p.bullets).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          {education.map((e) => (
            <div className="entry" key={e.id}>
              <div className="row">
                <span className="org">{e.school}</span>
                <span>{e.location}</span>
              </div>
              <div className="row sub">
                <span>
                  {e.degree}
                  {e.details && `, ${e.details}`}
                </span>
                <span>{dateRange(e.start, e.end)}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {skillRows.length > 0 && (
        <Section title="Skills">
          <div className="skills">
            {skillRows.map((s) => (
              <div key={s.id}>
                {s.label && <b>{s.label}: </b>}
                {s.items}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
