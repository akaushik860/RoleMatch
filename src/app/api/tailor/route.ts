import { buildRefs, resumeForPrompt, validateTailor } from "@/lib/ai";
import { AiError, generateJson, isMock } from "@/lib/server/gemini";
import { IMPROVE_ONLY_NOTE, TAILOR_SYSTEM } from "@/lib/server/prompts";
import { FREE_LIMITS } from "@/lib/plans";
import { creditsLeft, spendCredit } from "@/lib/server/credits";
import { allow, ipOf } from "@/lib/server/ratelimit";
import { AUTH_ENABLED } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";
import { normalizeState } from "@/lib/storage";

export const maxDuration = 60;

const KIND = "tailor" as const;
const LIMIT_MSG = `You've used today's ${FREE_LIMITS.tailor} free AI runs. They reset at midnight UTC.`;

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (!allow(ipOf(req))) return fail("Too many requests. Please try again in an hour.", 429);

  const { supabase, user } = await getUser();
  if (AUTH_ENABLED && (!supabase || !user)) return fail("Sign in with Google to use AI features.", 401);
  if (supabase && user) {
    const left = await creditsLeft(supabase, KIND).catch((e) => {
      console.error(e);
      return -1;
    });
    if (left === -1) return fail("Couldn't check your AI credits. Please try again.", 500);
    if (left === 0) return fail(LIMIT_MSG, 429);
  }

  const raw = await req.text();
  if (raw.length > 120_000) return fail("That's too much text. Shorten the job description.", 413);
  let body: { resume?: unknown; jd?: unknown; missing?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Bad request.", 400);
  }

  const resume = normalizeState({ resume: body.resume }).resume;
  const jd = typeof body.jd === "string" ? body.jd.trim().slice(0, 15_000) : "";
  const missing = Array.isArray(body.missing) ? body.missing.filter((m): m is string => typeof m === "string").slice(0, 40) : [];
  if (buildRefs(resume).size === 0 && !resume.summary.trim()) {
    return fail("Add some experience or project bullet points first.", 400);
  }

  const prompt = [
    jd ? `JOB DESCRIPTION:\n${jd}` : IMPROVE_ONLY_NOTE,
    missing.length ? `MISSING KEYWORDS (from the job, not found in the resume): ${missing.join(", ")}` : "",
    `RESUME (bullets are tagged with [ref]):\n${resumeForPrompt(resume)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const out = isMock() ? mockTailor(resume, missing) : await generateJson({ system: TAILOR_SYSTEM, parts: [{ text: prompt }] });
    const result = validateTailor(out, resume, missing);
    const left = supabase && user ? await spendCredit(supabase, KIND).catch(() => null) : null;
    return Response.json({ ...result, left });
  } catch (e) {
    if (e instanceof AiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Please try again.", 500);
  }
}

/** Fake AI output for testing the UI and guardrails without an API key (AI_MOCK=1). */
function mockTailor(resume: ReturnType<typeof normalizeState>["resume"], missing: string[]) {
  const refs = [...buildRefs(resume).entries()];
  return {
    summary: { text: `${resume.summary} Focused on reliable, well-tested backend services.`, reason: "Targets the role" },
    bullets: [
      ...refs.slice(0, 3).map(([ref, b]) => ({ ref, text: b.original.replace(/^\w+/, "Engineered"), reason: "Stronger opening verb", keywords: [] })),
      // These two must be thrown out by the guardrails:
      refs[0] && { ref: refs[0][0], text: "Boosted revenue by 47% across 12 markets", reason: "invented numbers" },
      refs[1] && { ref: refs[1][0], text: "Ran everything on Kubernetes and Terraform", reason: "invented tools", keywords: [{ keyword: "Kubernetes", evidence: "not in resume" }] },
    ].filter(Boolean),
    skills: missing.slice(0, 2).map((skill) => ({ skill, evidence: "GitHub Actions" })),
  };
}
