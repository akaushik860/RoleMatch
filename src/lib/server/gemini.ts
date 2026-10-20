import "server-only";

// Thin wrapper around the Gemini REST API. No SDK, so nothing to keep updated.
// Set GEMINI_API_KEY (and optionally GEMINI_MODEL / GEMINI_FALLBACK_MODELS) in .env.local.
//
// Gemini models are sometimes overloaded ("high demand" 503s) or hang for minutes.
// So we never wait on a single call: if the main model hasn't answered after
// HEDGE_MS we also ask the next model, a busy error moves on immediately, and the
// first good answer wins. Everything stops at DEADLINE_MS, inside Vercel's 60s limit.

const HEDGE_MS = 8_000;
const DEADLINE_MS = 52_000;

export class AiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

type Attempt =
  | { ok: true; value: unknown }
  | { ok: false; retryable: boolean; status: number; detail: string };

function modelList(): string[] {
  const primary = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.5-flash,gemini-3.5-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([primary, ...fallbacks])];
}

async function attempt(model: string, key: string, opts: { system: string; parts: Part[] }, signal: AbortSignal): Promise<Attempt> {
  // "low" thinking is several times faster than the default and good enough here.
  const thinking = process.env.GEMINI_THINKING ?? "low";
  const call = (withThinking: boolean) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: opts.parts }],
        // Gemini 3 models are tuned for their default temperature; don't override it.
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          ...(withThinking && thinking ? { thinkingConfig: { thinkingLevel: thinking } } : {}),
        },
      }),
      signal,
    });

  try {
    let res = await call(true);
    // This model doesn't support the thinking level: retry without it.
    if (res.status === 400 && /thinking/i.test(await res.clone().text())) res = await call(false);

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      // Bad key / bad request won't get better on another model; anything else might.
      const retryable = ![400, 401, 403].includes(res.status);
      return { ok: false, retryable, status: res.status, detail };
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    if (!text) return { ok: false, retryable: true, status: 502, detail: "empty answer" };
    try {
      return { ok: true, value: JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")) };
    } catch {
      return { ok: false, retryable: true, status: 502, detail: "unparseable JSON" };
    }
  } catch (e) {
    return { ok: false, retryable: true, status: 0, detail: e instanceof Error ? e.message : String(e) };
  }
}

export async function generateJson(opts: { system: string; parts: Part[] }): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("AI is not set up yet: add GEMINI_API_KEY to .env.local and restart the server.", 503);
  const models = modelList();
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const controllers: AbortController[] = [];
    let next = 0;
    let inFlight = 0;
    let done = false;
    let last: Extract<Attempt, { ok: false }> | null = null;

    const finish = (err: AiError | null, value?: unknown) => {
      if (done) return;
      done = true;
      clearTimeout(deadline);
      controllers.forEach((c) => c.abort());
      if (err) reject(err);
      else resolve(value);
    };

    const failure = (): AiError => {
      if (last) console.error("Gemini failed on all models", last.status, last.detail);
      if (last && [401, 403].includes(last.status)) return new AiError("The AI key was rejected. Check GEMINI_API_KEY.", 502);
      if (last?.status === 400) return new AiError("The AI couldn't process this request.", 502);
      return new AiError("The AI is very busy right now. Please try again in a minute.", 503);
    };

    const deadline = setTimeout(() => {
      console.error(`Gemini: no answer from ${models.slice(0, next).join(", ")} within ${DEADLINE_MS}ms`);
      finish(new AiError("The AI took too long. Please try again.", 504));
    }, DEADLINE_MS);

    const launch = (): boolean => {
      if (done || next >= models.length) return false;
      const model = models[next++];
      const ac = new AbortController();
      controllers.push(ac);
      inFlight++;
      const hedge = setTimeout(launch, HEDGE_MS);
      attempt(model, key, opts, ac.signal).then((r) => {
        clearTimeout(hedge);
        inFlight--;
        if (done) return;
        if (r.ok) {
          console.info(`Gemini: ${model} answered in ${Date.now() - started}ms`);
          finish(null, r.value);
          return;
        }
        console.warn(`Gemini: ${model} failed (${r.status}) ${r.detail.slice(0, 120)}`);
        last = r;
        if (!r.retryable) finish(failure());
        else if (!launch() && inFlight === 0) finish(failure());
      });
      return true;
    };

    launch();
  });
}

export function isMock() {
  return process.env.AI_MOCK === "1";
}
