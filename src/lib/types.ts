export type TemplateId = "classic" | "modern";
export type PaperSize = "a4" | "letter";

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Basics {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: Link[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  tech: string;
  link: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string;
}

export interface Resume {
  basics: Basics;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: SkillGroup[];
}

export interface Settings {
  template: TemplateId;
  paper: PaperSize;
  zoom: number;
}

export interface AppState {
  version: 1;
  /** False until the user picks import / scratch / example on the start screen. */
  started: boolean;
  resume: Resume;
  jobDescription: string;
  /** Job keywords the user added to their skills to learn before interviews. */
  learning: string[];
  settings: Settings;
}
