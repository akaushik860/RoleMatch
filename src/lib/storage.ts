// Browser copy of the editor state. Guests only have this; signed-in users also
// get a copy in their account (see cloud.ts), and this acts as a fast cache.
import type { AppState } from "./types";
import { DEFAULT_STATE, SAMPLE_RESUME, isBlank } from "./sample";

const KEY = "resumefit:v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return normalizeState(JSON.parse(raw));
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked (private mode). The app keeps working in memory.
  }
}

/** Fills in anything missing so old or hand-edited JSON files still load. */
export function normalizeState(input: unknown): AppState {
  const s = (input ?? {}) as Partial<AppState>;
  const r = (s.resume ?? {}) as Partial<AppState["resume"]>;
  return {
    version: 1,
    // Saved states from before the start screen existed were already "started".
    started: typeof s.started === "boolean" ? s.started : true,
    jobDescription: typeof s.jobDescription === "string" ? s.jobDescription : "",
    settings: { ...DEFAULT_STATE.settings, ...(s.settings ?? {}) },
    resume: {
      basics: { ...DEFAULT_STATE.resume.basics, links: [], ...(r.basics ?? {}) },
      summary: r.summary ?? "",
      experience: r.experience ?? [],
      education: r.education ?? [],
      projects: r.projects ?? [],
      skills: r.skills ?? [],
    },
  };
}

export function downloadJson(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = state.resume.basics.name.trim().replace(/\s+/g, "_") || "resume";
  a.href = url;
  a.download = `${name}_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- which account the local copy belongs to ----------
// Lets us wipe the browser copy on sign-out (shared computers) and tell
// guest edits apart from a signed-in user's cached resume.

const OWNER_KEY = "resumefit:owner";

export function getOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

export function setOwner(userId: string): void {
  try {
    localStorage.setItem(OWNER_KEY, userId);
  } catch {}
}

/** Removes the resume and its owner from this browser. */
export function clearLocal(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(OWNER_KEY);
  } catch {}
}

/** True if the user hasn't changed anything from the blank or example resume. */
export function isUntouched(state: AppState): boolean {
  return !state.jobDescription.trim() && (isBlank(state.resume) || JSON.stringify(state.resume) === JSON.stringify(SAMPLE_RESUME));
}
