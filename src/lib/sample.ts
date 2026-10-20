import type { AppState, Resume } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const SAMPLE_RESUME: Resume = {
  basics: {
    name: "Alex Morgan",
    headline: "Software Engineer",
    email: "alex.morgan@email.com",
    phone: "+1 555 010 2030",
    location: "Austin, TX",
    links: [
      { id: "l1", label: "linkedin.com/in/alexmorgan", url: "https://linkedin.com/in/alexmorgan" },
      { id: "l2", label: "github.com/alexmorgan", url: "https://github.com/alexmorgan" },
    ],
  },
  summary:
    "Backend engineer with 4 years of experience building scalable APIs and data pipelines in Python and TypeScript. Shipped services handling 2M+ requests per day on AWS.",
  experience: [
    {
      id: "e1",
      company: "Northwind Labs",
      role: "Software Engineer",
      location: "Austin, TX",
      start: "Jun 2022",
      end: "Present",
      bullets: [
        "Designed and built a REST API in Python (FastAPI) serving 2M+ requests per day with 99.95% uptime",
        "Cut cloud costs by 32% by moving batch jobs from EC2 to AWS Lambda and right-sizing PostgreSQL instances",
        "Led migration of 14 services to Docker and GitHub Actions CI, reducing deploy time from 40 to 8 minutes",
      ],
    },
    {
      id: "e2",
      company: "Brightpath",
      role: "Junior Developer",
      location: "Remote",
      start: "Jan 2021",
      end: "May 2022",
      bullets: [
        "Built React dashboards used by 300+ internal users to track order fulfilment",
        "Wrote integration tests that raised coverage from 45% to 80% and caught 20+ regressions before release",
      ],
    },
  ],
  education: [
    {
      id: "ed1",
      school: "University of Texas at Austin",
      degree: "B.S. in Computer Science",
      location: "Austin, TX",
      start: "Aug 2016",
      end: "May 2020",
      details: "GPA: 3.7/4.0",
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Queue Watch",
      tech: "Go, Redis, Grafana",
      link: "",
      start: "Mar 2023",
      end: "",
      bullets: ["Open-source monitoring tool for Redis queues with 400+ GitHub stars"],
    },
  ],
  skills: [
    { id: "s1", label: "Languages", items: "Python, TypeScript, JavaScript, SQL, Go" },
    { id: "s2", label: "Frameworks", items: "FastAPI, Django, React, Node.js" },
    { id: "s3", label: "Cloud & Tools", items: "AWS, Docker, PostgreSQL, Redis, Git, GitHub Actions" },
  ],
};

/** Faint stand-in shown in the preview while the user's resume is still empty. */
export const GHOST_RESUME: Resume = {
  basics: {
    name: "Your Name",
    headline: "Your Job Title",
    email: "you@email.com",
    phone: "+91 98765 43210",
    location: "City, Country",
    links: [{ id: "g1", label: "linkedin.com/in/you", url: "" }],
  },
  summary: "Two or three lines about who you are, your years of experience and your strongest result.",
  experience: [
    {
      id: "g1",
      company: "Company Name",
      role: "Job Title",
      location: "City",
      start: "Jan 2023",
      end: "Present",
      bullets: [
        "Start with an action verb and say what you built, led or improved",
        "Add a number that shows the result: users, %, time saved or revenue",
      ],
    },
  ],
  education: [{ id: "g1", school: "University Name", degree: "Degree, Subject", location: "City", start: "2018", end: "2022", details: "" }],
  projects: [],
  skills: [{ id: "g1", label: "Skills", items: "Your top skills, separated by commas" }],
};

/** True if any of the example resume's personal details are still in `resume`. */
export function hasExampleDetails(resume: Resume): boolean {
  const b = resume.basics;
  return b.email === SAMPLE_RESUME.basics.email || b.name === SAMPLE_RESUME.basics.name || b.phone === SAMPLE_RESUME.basics.phone;
}

/** True if the user hasn't typed anything yet (empty entries don't count). */
export function isBlank(resume: Resume): boolean {
  const hasText = (v: unknown): boolean =>
    typeof v === "string"
      ? v.trim() !== ""
      : Array.isArray(v)
        ? v.some(hasText)
        : !!v && typeof v === "object" && Object.entries(v).some(([k, x]) => k !== "id" && hasText(x));
  return !hasText(resume);
}

/** Blank resume with one empty entry per section, so the form's hints are visible. */
export function scratchResume(): Resume {
  return {
    ...EMPTY_RESUME,
    basics: { ...EMPTY_RESUME.basics, links: [{ id: uid(), label: "", url: "" }] },
    experience: [{ id: uid(), company: "", role: "", location: "", start: "", end: "", bullets: [] }],
    education: [{ id: uid(), school: "", degree: "", location: "", start: "", end: "", details: "" }],
    skills: [{ id: uid(), label: "", items: "" }],
  };
}

export const EMPTY_RESUME: Resume = {
  basics: { name: "", headline: "", email: "", phone: "", location: "", links: [] },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
};

export const DEFAULT_STATE: AppState = {
  version: 1,
  started: false,
  resume: EMPTY_RESUME,
  jobDescription: "",
  learning: [],
  settings: { template: "classic", paper: "a4", zoom: 0 },
};
