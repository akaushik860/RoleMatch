import mammoth from "mammoth";
import { looksEmpty, normalizeImported } from "@/lib/importer";
import { SAMPLE_RESUME } from "@/lib/sample";
import { AiError, generateJson, isMock } from "@/lib/server/gemini";
import { IMPORT_SYSTEM } from "@/lib/server/prompts";
import { FREE_LIMITS } from "@/lib/plans";
import { creditsLeft, spendCredit } from "@/lib/server/credits";
import { allow, ipOf } from "@/lib/server/ratelimit";
import { AUTH_ENABLED } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";

export const maxDuration = 60;

const KIND = "import" as const;
const LIMIT_MSG = `You've used today's ${FREE_LIMITS.import} free imports. They reset at midnight UTC.`;

const MAX_BYTES = 5 * 1024 * 1024;
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("Send a file or pasted text.", 400);
  }
  const file = form.get("file");
  const pasted = typeof form.get("text") === "string" ? (form.get("text") as string).trim() : "";

  let parts: Parameters<typeof generateJson>[0]["parts"];
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return fail("That file is over 5 MB. Try a smaller PDF or Word file.", 413);
    const name = file.name.toLowerCase();
    const buf = Buffer.from(await file.arrayBuffer());
    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      parts = [{ inlineData: { mimeType: "application/pdf", data: buf.toString("base64") } }, { text: "Convert this resume to JSON." }];
    } else if (file.type === DOCX || name.endsWith(".docx")) {
      const { value } = await mammoth.extractRawText({ buffer: buf }).catch(() => ({ value: "" }));
      if (!value.trim()) return fail("We couldn't read that Word file. Try saving it as PDF.", 422);
      parts = [{ text: `Convert this resume to JSON.\n\n${value.slice(0, 30_000)}` }];
    } else if (name.endsWith(".txt") || file.type.startsWith("text/")) {
      parts = [{ text: `Convert this resume to JSON.\n\n${buf.toString("utf8").slice(0, 30_000)}` }];
    } else if (name.endsWith(".doc")) {
      return fail("Old .doc files aren't supported. Save it as .docx or PDF and try again.", 415);
    } else {
      return fail("Upload a PDF, Word (.docx) or text file.", 415);
    }
  } else if (pasted.length > 50) {
    parts = [{ text: `Convert this resume to JSON.\n\n${pasted.slice(0, 30_000)}` }];
  } else {
    return fail("Upload a file or paste your resume text.", 400);
  }

  try {
    const raw = isMock() ? { ...SAMPLE_RESUME, basics: { ...SAMPLE_RESUME.basics, name: "Imported Person" } } : await generateJson({ system: IMPORT_SYSTEM, parts });
    const resume = normalizeImported(raw);
    if (looksEmpty(resume)) return fail("We couldn't find resume content in that file. Is it a scanned image? Try pasting the text instead.", 422);
    const left = supabase && user ? await spendCredit(supabase, KIND).catch(() => null) : null;
    return Response.json({ resume, left });
  } catch (e) {
    if (e instanceof AiError) return fail(e.message, e.status);
    console.error(e);
    return fail("Something went wrong. Please try again.", 500);
  }
}
