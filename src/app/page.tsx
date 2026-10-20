import Link from "next/link";
import HeroDemo from "@/components/landing/HeroDemo";
import Reveal from "@/components/landing/Reveal";
import SiteFooter from "@/components/landing/SiteFooter";
import SiteHeader from "@/components/landing/SiteHeader";
import { BRAND } from "@/lib/brand";
import { FREE_LIMITS } from "@/lib/plans";

// ---------- content ----------

const audiences = [
  { emoji: "🎓", title: "Freshers & campus placements", body: "Turn projects and internships into bullets that match each role." },
  { emoji: "🔁", title: "Moving from services to product", body: "Reframe real work in the language product companies use." },
  { emoji: "📨", title: "Applying to many jobs", body: "A tailored version for every application in about a minute." },
  { emoji: "🧭", title: "Changing fields, honestly", body: "We tell you when a job is outside your field instead of padding your resume." },
];

const steps = [
  { title: "Import your resume", body: "Upload a PDF or Word file. Your words are kept exactly as written. Or start from a clean form." },
  { title: "Paste the job description", body: "See your match score, the keywords the job requires, and which ones you're missing." },
  { title: "Approve AI edits and download", body: "Review each rewrite side by side, keep what you like, and download an ATS-safe PDF." },
];

const faqs = [
  { q: "How is this different from asking ChatGPT?", a: "A chatbot will happily invent metrics and skills to make you sound better. We check every AI suggestion against your resume in code and remove anything that adds a number, tool or skill you can't back up. You also see your match score change before you accept anything." },
  { q: "Will the AI make things up?", a: "It is instructed not to, and we don't rely on that alone: any rewrite that adds a number, tool or skill your resume doesn't already show is removed before you see it. You still approve every change." },
  { q: "Will this guarantee I pass an ATS?", a: "No tool can, since every ATS works differently. We make sure your resume is readable by them and honestly covers the job's keywords, which is what actually helps." },
  { q: "Do I need an account?", a: "Not to build, check and download your resume. A free Google sign-in is needed for AI import and tailoring. It keeps the free AI limits fair and saves your resume so you can use it on any device." },
  { q: "Where is my data stored?", a: "Without an account, your resume stays in your browser on this device. When you sign in, it is saved to your account so you can open it anywhere, and it is removed from the browser when you sign out. For AI import and tailoring, the text is sent to our AI provider to process that request." },
  { q: "Is the free plan really free?", a: `Yes. Building, job matching, ${FREE_LIMITS.tailor} AI tailoring runs a day and unlimited PDF downloads are free, with no watermark. AI features need a free Google sign-in.` },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    note: "forever",
    badge: "Live now",
    available: true,
    items: ["1 resume, 2 templates", `${FREE_LIMITS.tailor} AI tailoring runs per day`, `Import PDF or Word (${FREE_LIMITS.import} per day)`, "Job match score and missing keywords", "Recruiter checks", "Unlimited PDF downloads, no watermark"],
  },
  {
    name: "Plus",
    price: "$9",
    note: "/month · ₹299 in India",
    badge: "Coming soon",
    available: false,
    items: ["Everything in Free", "50 AI tailoring runs per month", "Unlimited imports", "Saved versions per job", "Cover letters", "Word (.docx) export"],
  },
  {
    name: "Pro",
    price: "$19",
    note: "/month · ₹699 in India",
    badge: "Coming soon",
    available: false,
    items: ["Everything in Plus", "More AI rewrites, stronger model", "Application tracker", "Interview questions from the job", "LinkedIn headline and About writer"],
  },
];

// ---------- small building blocks ----------

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <div className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-gray-600">{sub}</p>}
    </Reveal>
  );
}

function Check({ className = "text-emerald-600" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-5 w-5 shrink-0 ${className}`} fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}

function FeatureCard({ title, body, children, className = "", delay = 0 }: { title: string; body: string; children?: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`min-w-0 ${className}`}>
      <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_50px_-25px_rgba(47,91,211,0.45)]">
        {children && <div className="mb-5">{children}</div>}
        <h3 className="text-lg font-semibold text-gray-950">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p>
      </div>
    </Reveal>
  );
}

// ---------- page ----------

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="animate-blob absolute -left-32 -top-24 -z-10 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" aria-hidden />
        <div className="animate-blob absolute -right-24 top-40 -z-10 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl [animation-delay:-6s]" aria-hidden />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Fact-checked AI tailoring
            </div>
            <h1 className="animate-fade-up mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-gray-950 [animation-delay:80ms] sm:text-5xl lg:text-[3.4rem]">
              Tailor your resume to every job.{" "}
              <span className="bg-gradient-to-r from-brand to-emerald-600 bg-clip-text text-transparent">
                Without a single line you can&apos;t defend.
              </span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-gray-600 [animation-delay:160ms]">
              Paste a job description. AI rewrites your bullets around it using only facts already in your resume, and blocks
              anything it can&apos;t prove. You approve every change.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link
                href="/builder"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30"
              >
                Tailor my resume, free
                <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
              <a href="#how" className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold transition hover:border-gray-400 hover:bg-gray-50">
                See how it works
              </a>
            </div>
            <ul className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 [animation-delay:320ms]">
              {["Free forever plan", "No sign-up to start", "No watermark"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up [animation-delay:200ms]">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* BUILT FOR */}
      <section className="border-y border-gray-100 bg-gray-50/70 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500">Built for job seekers who</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 90}>
                <div className="h-full rounded-xl bg-white p-5 ring-1 ring-gray-200 transition hover:ring-brand/40">
                  <div className="text-2xl" aria-hidden>{a.emoji}</div>
                  <div className="mt-3 font-semibold text-gray-950">{a.title}</div>
                  <p className="mt-1 text-sm text-gray-600">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* THE DIFFERENCE */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle
            eyebrow="The difference"
            title="Interviewers ask about every line"
            sub="Generic AI makes you sound impressive on paper and exposed in the interview. We only use what you can talk about."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/60 to-white p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">✕</span>
                  A typical generic AI rewrite
                </div>
                <p className="mt-5 font-serif text-[17px] leading-relaxed text-gray-800">
                  &ldquo;Spearheaded a <u className="decoration-red-400 decoration-wavy underline-offset-4">Kubernetes</u> migration of 14 microservices,
                  saving <u className="decoration-red-400 decoration-wavy underline-offset-4">$200K annually</u> through{" "}
                  <u className="decoration-red-400 decoration-wavy underline-offset-4">synergistic</u> DevOps transformation.&rdquo;
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["Kubernetes: never used it", "$200K: number made up", "“Synergistic”: buzzword recruiters skip"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-red-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white p-6 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.6)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">✓</span>
                  {BRAND.name}
                </div>
                <p className="mt-5 font-serif text-[17px] leading-relaxed text-gray-800">
                  &ldquo;Built a <span className="rounded bg-emerald-100 px-1">CI/CD pipeline</span> with GitHub Actions for 14 services, cutting deploy time from 40 to 8 minutes.&rdquo;
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["CI/CD: proven by “GitHub Actions CI” in your resume", "14, 40 and 8: all from your original bullet", "Plain, specific, easy to explain"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-emerald-900">
                      <Check className="h-4 w-4 text-emerald-600" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <p className="mt-5 text-center text-xs text-gray-400">Illustrative example.</p>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative overflow-hidden bg-gray-950 py-24 text-white">
        <div className="absolute left-1/2 top-0 -z-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-blue-300">How it works</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">From job post to tailored PDF in about a minute</h2>
          </Reveal>
          <Reveal className="relative mt-16">
            <div className="draw-line absolute left-[16.6%] right-[16.6%] top-6 hidden h-px bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 md:block" aria-hidden />
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="relative text-center">
                  <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-950 shadow-[0_0_0_6px_rgba(255,255,255,0.08)]">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-400">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="What we're good at" title="Honest tailoring, with the receipts" />
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            <FeatureCard
              className="md:col-span-2"
              title="Every AI suggestion is fact-checked"
              body="Rewrites that add a number, tool or skill your resume doesn't show are thrown out before you see them. Any keyword the AI adds comes with the line from your resume that proves it."
            >
              <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-emerald-200">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Kept</span>
                  <span className="truncate">Built a CI/CD pipeline with GitHub Actions…</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-red-200">
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">Blocked</span>
                  <span className="truncate text-gray-500 line-through">Boosted revenue by 47% across 12 markets</span>
                </div>
              </div>
            </FeatureCard>
            <FeatureCard delay={100} title="You approve every change" body="See each rewrite next to the original, untick what you don't like, and watch your score change before you apply.">
              <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 py-5 text-2xl font-bold">
                <span className="text-amber-500">58</span>
                <span className="text-gray-300">→</span>
                <span className="text-emerald-600">79</span>
              </div>
            </FeatureCard>
            <FeatureCard title="A score you can understand" body="Keyword match, measurable impact, completeness and writing quality, each shown separately. No mystery number.">
              <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                {[["Keywords", 72, "bg-amber-500"], ["Impact", 90, "bg-emerald-500"], ["Quality", 85, "bg-emerald-500"]].map(([l, v, c]) => (
                  <div key={l as string} className="text-xs">
                    <div className="flex justify-between text-gray-600"><span>{l}</span><span>{v}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-gray-200"><div className={`h-full rounded-full ${c}`} style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </div>
            </FeatureCard>
            <FeatureCard delay={100} title="Required vs nice-to-have" body="Missing keywords are ranked by what the job actually requires, so you fix what matters first.">
              <div className="flex flex-wrap gap-1.5 rounded-xl bg-gray-50 p-4 text-xs">
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-800">Terraform <b className="text-[10px]">REQ</b></span>
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-800">Kafka</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">✓ Python</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">✓ AWS</span>
              </div>
            </FeatureCard>
            <FeatureCard delay={200} title="Recruiter checks" body="Weak openers, bullets without numbers, wrong tense, buzzwords, mixed date formats and a resume that spills onto page two.">
              <div className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-xs">
                <div className="flex gap-2"><span className="text-amber-500">●</span> 3 of 9 bullets have no numbers</div>
                <div className="flex gap-2"><span className="text-amber-500">●</span> Use past tense for past roles</div>
                <div className="flex gap-2"><span className="text-blue-500">●</span> Vary your action verbs</div>
              </div>
            </FeatureCard>
            <FeatureCard title="Import PDF or Word" body="Upload your current resume and the editor fills itself in, keeping your wording exactly as written." />
            <FeatureCard delay={100} title="Wrong-field warning" body="Applying to a sales role with an engineering resume? We tell you, instead of stuffing in skills you don't have." />
            <FeatureCard delay={200} title="ATS-safe PDF" body="Clean single-column layouts with a LaTeX look. Real selectable text, A4 or US Letter, no watermark." />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-gray-100 bg-gray-50/70 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Pricing" title="Start free. Stay free if you want." sub="The free plan includes AI tailoring. Paid plans are coming soon." />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl bg-white p-7 transition duration-300 hover:-translate-y-1 ${
                    t.available ? "shadow-[0_25px_60px_-30px_rgba(47,91,211,0.6)] ring-2 ring-brand" : "ring-1 ring-gray-200 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.available ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                      {t.badge}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{t.price}</span>
                    <span className="text-sm text-gray-500">{t.note}</span>
                  </div>
                  <ul className="mt-7 flex-1 space-y-3 text-sm">
                    {t.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <Check className={t.available ? "text-brand" : "text-gray-400"} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {t.available ? (
                    <Link href="/builder" className="mt-8 rounded-xl bg-brand py-3 text-center font-semibold text-white transition hover:bg-brand-dark">
                      Start for free
                    </Link>
                  ) : BRAND.waitlistUrl ? (
                    <a href={BRAND.waitlistUrl} target="_blank" rel="noreferrer" className="mt-8 rounded-xl border border-gray-300 py-3 text-center font-semibold transition hover:bg-gray-50">
                      Join the waitlist
                    </a>
                  ) : (
                    <div className="mt-8 rounded-xl bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">Coming soon</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-4">
          <SectionTitle eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group rounded-xl border border-gray-200 bg-white transition open:border-brand/30 open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-300 group-open:rotate-45 group-open:bg-brand group-open:text-white">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-indigo-600 to-indigo-800 px-6 py-16 text-center text-white sm:px-12">
            <div className="animate-blob absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="animate-blob absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-2xl [animation-delay:-8s]" aria-hidden />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Your next application deserves its own resume</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Import your resume, paste the job, and approve honest edits. Free to start.
            </p>
            <Link
              href="/builder"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Tailor my resume, free <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
