import "server-only";

// Thin wrapper around the Gemini REST API. No SDK, so nothing to keep updated.
// Set GEMINI_API_KEY (and optionally GEMINI_MODEL) in .env.local.

export class AiError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function generateJson(opts: { system: string; parts: Part[] }): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("AI is not set up yet: add GEMINI_API_KEY to .env.local and restart the server.", 503);
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  // "low" thinking is ~4x faster than the default and good enough for this task.
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
          ...(withThinking && thinking ? { thinkingConfig: { thinkingLevel: thinking } } : {}),
        },
      }),
      signal: AbortSignal.timeout(55_000),
    }).catch((e: unknown) => {
      throw new AiError(e instanceof Error && e.name === "TimeoutError" ? "The AI took too long. Please try again." : "Couldn't reach the AI service.", 502);
    });

  let res = await call(true);
  // Model doesn't support this thinking level: retry without it.
  if (res.status === 400 && /thinking/i.test(await res.clone().text())) res = await call(false);
  // Google is briefly overloaded: one retry usually succeeds.
  if (res.status >= 500) {
    await new Promise((r) => setTimeout(r, 1500));
    res = await call(true);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("Gemini error", res.status, body.slice(0, 500));
    if (res.status === 404) throw new AiError(`AI model "${model}" not found. Set GEMINI_MODEL to a current model name.`, 502);
    if (res.status === 429 || res.status === 503) throw new AiError("The AI is busy right now. Please try again in a minute.", 429);
    throw new AiError("The AI service returned an error. Please try again.", 502);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) throw new AiError("The AI returned an empty answer. Please try again.", 502);
  try {
    return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    throw new AiError("The AI returned something unreadable. Please try again.", 502);
  }
}

export function isMock() {
  return process.env.AI_MOCK === "1";
}
