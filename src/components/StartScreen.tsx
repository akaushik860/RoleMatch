"use client";

function Card({
  icon,
  title,
  body,
  badge,
  cta,
  primary = false,
  onClick,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
  cta: string;
  primary?: boolean;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-fade-up group relative flex flex-col rounded-2xl border bg-white p-6 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        primary
          ? "border-brand/40 shadow-[0_20px_50px_-25px_rgba(47,91,211,0.55)] hover:shadow-[0_25px_60px_-25px_rgba(47,91,211,0.7)]"
          : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
      }`}
    >
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">{badge}</span>
      )}
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${primary ? "bg-brand text-white" : "bg-gray-100"}`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="mt-5 text-lg font-semibold text-gray-950">{title}</span>
      <span className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">{body}</span>
      <span className={`mt-5 text-sm font-semibold ${primary ? "text-brand" : "text-gray-700"}`}>
        {cta}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </button>
  );
}

/** First screen of the builder: how does the user want to begin? */
export default function StartScreen({
  onImport,
  onScratch,
  onExample,
  importNeedsSignIn,
}: {
  onImport: () => void;
  onScratch: () => void;
  onExample: () => void;
  importNeedsSignIn: boolean;
}) {
  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
        <div className="animate-fade-up text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">How do you want to start?</h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Pick one to begin. You can switch any time, and everything stays editable.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card
            primary
            badge="Fastest"
            delay={80}
            icon="📄"
            title="Import my resume"
            cta="Upload resume"
            body={`Upload a PDF or Word file and we fill in everything for you, word for word.${importNeedsSignIn ? " Needs a free Google sign-in." : ""}`}
            onClick={onImport}
          />
          <Card
            delay={160}
            icon="✏️"
            title="Start from scratch"
            cta="Open blank editor"
            body="A blank, guided form. Every field shows an example of what to write, and the preview updates as you type."
            onClick={onScratch}
          />
          <Card
            delay={240}
            icon="👀"
            title="See an example first"
            cta="Show example"
            body="Explore a finished resume to see how the job match score and checks work, then start your own."
            onClick={onExample}
          />
        </div>
      </div>
    </div>
  );
}
