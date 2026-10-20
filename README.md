# RoleMatch: free tier MVP

Resume builder + job description match checker + fact-checked AI tailoring.
Guests can build and download without an account (saved in the browser); a free
Google sign-in (Supabase) unlocks AI import/tailoring and saves the resume to the
account. API routes call Gemini, so the AI key never reaches the browser.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your key into GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Get a key at https://aistudio.google.com/apikey. No key yet? Set `AI_MOCK=1`
in `.env.local` to get fake AI answers so you can click through the flow.

**Before real users:** enable billing on the Google AI project. On the free
tier Google may use prompts (i.e. users' resumes) to improve its models.

- `/` is the landing page with pricing (Plus/Pro shown as "coming soon").
- `/builder` is the app.

## Accounts (Supabase + Google sign-in)

Guests can build, score and download. AI import/tailoring needs a free Google
sign-in; signed-in users' resumes are saved to their account, and signing out
wipes the browser copy (safe on shared computers). Without Supabase keys the app
runs in guest-only mode and AI works without sign-in (handy for local dev).

Setup: run `supabase/schema.sql` in the Supabase SQL editor, enable the Google
provider in Supabase (Authentication → Sign In / Providers), and add
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to
`.env.local`. Daily AI limits live in the database (`ai_limit` in
`supabase/schema.sql`); keep them in sync with `src/lib/plans.ts`.

## Change things quickly

| What | Where |
|---|---|
| Product name, tagline, waitlist link | `src/lib/brand.ts` |
| Sample resume shown to new users | `src/lib/sample.ts` |
| Skills dictionary (add terms for new fields) | `src/lib/dictionary.ts` |
| Score weights and recruiter checks | `src/lib/analyze.ts` |
| Resume templates (look of the PDF) | `src/components/ResumeDocument.tsx` + `.tpl-*` in `src/app/globals.css` |
| Landing page and pricing copy | `src/app/page.tsx` |
| Free-tier AI limits | `src/lib/plans.ts` |
| AI prompts | `src/lib/server/prompts.ts` |
| AI guardrails (what gets rejected) | `src/lib/ai.ts` |

## Deploy (free)

1. Push this folder to a GitHub repo.
2. Go to vercel.com → Add New Project → import the repo.
3. Under Environment Variables add `GEMINI_API_KEY`, `GEMINI_MODEL`,
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, then Deploy.
   Then add your live URL + `/auth/callback` to Supabase's allowed redirect URLs.
4. Optional: add a custom domain in Vercel → Settings → Domains.

## How it is built

- `src/lib/analyze.ts`: deterministic scoring. 60% keyword match (required
  keywords weigh more than nice-to-haves), 15% measurable impact, 15%
  completeness, 10% writing quality. Without a job description it shows a
  "health" score instead.
- `src/lib/storage.ts`: the browser copy of the resume (guests, and a cache for
  signed-in users). `src/lib/cloud.ts` saves it to the user's account.
- PDF export uses the browser's print engine, so the PDF has real selectable text
  and embedded fonts. Nothing is turned into an image.

## AI safety net

Every AI suggestion is checked in code before the user sees it
(`validateTailor` in `src/lib/ai.ts`). A rewrite is dropped if it:
- adds a number that isn't in the original bullet,
- mentions a tool/skill the resume doesn't show, unless the AI quoted real
  evidence from the resume that mentions it (e.g. "GitHub Actions CI" → CI/CD).

## Next (Plus tier)

Stripe (global) / Razorpay (India) payments, saved versions per job, cover
letters, Word export.
All in this same Next.js project; no separate backend folder.
