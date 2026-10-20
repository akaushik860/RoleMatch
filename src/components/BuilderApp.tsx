"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { TailorResult } from "@/lib/ai";
import { addSkill, analyze, type Keyword } from "@/lib/analyze";
import { BRAND } from "@/lib/brand";
import { LogoMark } from "./landing/Logo";
import { DEFAULT_STATE, SAMPLE_RESUME, hasExampleDetails, scratchResume, uid } from "@/lib/sample";
import { fetchCredits, loadRemote, saveRemote, type Credits } from "@/lib/cloud";
import { clearLocal, downloadJson, getOwner, isUntouched, loadState, normalizeState, saveState, setOwner } from "@/lib/storage";
import { useAuth } from "./AuthProvider";
import UserMenu from "./UserMenu";
import type { AppState, Resume, Settings } from "@/lib/types";
import Editor from "./Editor";
import ImportDialog from "./ImportDialog";
import { ChecksPanel, MatchPanel, scoreColor } from "./MatchPanel";
import Preview, { PAGE_PX } from "./Preview";
import ResumeDocument from "./ResumeDocument";
import StartScreen from "./StartScreen";
import TailorReview from "./TailorReview";

type Tab = "edit" | "match" | "checks" | "preview";

const PRINT_TIP_KEY = "resumefit:print-tip-seen";

type MenuId = "importResume" | "export" | "import" | "sample" | "blank";
const MENU: { id: MenuId; label: string }[] = [
  { id: "importResume", label: "Import resume (PDF / Word)" },
  { id: "export", label: "Export backup (.json)" },
  { id: "import", label: "Import backup (.json)" },
  { id: "sample", label: "Load example resume" },
  { id: "blank", label: "Start blank" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2.5 py-1 ${value === o.value ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function BuilderApp() {
  const [state, setState] = useState<AppState>(loadState);
  const [tab, setTab] = useState<Tab>("edit");
  const [pages, setPages] = useState(1);
  const [showPrintTip, setShowPrintTip] = useState(false);
  const [fitWidth, setFitWidth] = useState(800);
  const previewBox = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // ?import=1 reopens the import dialog after the user signs in to use it.
  const [showImport, setShowImport] = useState(() => new URLSearchParams(window.location.search).get("import") === "1");
  const [tailorBusy, setTailorBusy] = useState(false);
  const [tailorError, setTailorError] = useState("");
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);
  const [undo, setUndo] = useState<{ resume: Resume; label: string } | null>(null);

  const { resume, jobDescription: jd, settings } = state;

  const { enabled: authOn, ready: authReady, user, signIn } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [sync, setSync] = useState<"loading" | "saving" | "saved" | "error">("saved");
  // Which user's account copy is loaded into the editor (null = guest / not yet).
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => saveState(state), 300);
    return () => clearTimeout(t);
  }, [state]);

  // Sign-in / sign-out: load the account's resume, or wipe this browser's copy.
  useEffect(() => {
    if (!authOn || !authReady) return;
    const syncAccount = async () => {
      if (!user) {
        syncedFor.current = null;
        setCredits(null);
        // Someone was signed in here and isn't any more: don't leave their resume behind.
        if (getOwner()) {
          clearLocal();
          setState(structuredClone(DEFAULT_STATE));
        }
        return;
      }
      if (syncedFor.current === user.id) return;
      setSync("loading");
      try {
        const remote = await loadRemote(user.id);
        const local = loadState();
        let next: AppState;
        if (getOwner() === user.id) next = remote ?? local;
        else if (!remote) next = local; // first sign-in: guest work moves into the account
        else if (!isUntouched(local) &&
          confirm("You edited a resume before signing in, and your account already has a saved resume.\n\nOK: keep the one you just edited (replaces the saved one)\nCancel: open your saved resume")) next = local;
        else next = remote;
        setOwner(user.id);
        syncedFor.current = user.id;
        setState(next);
        await saveRemote(user.id, next);
        setSync("saved");
      } catch (e) {
        console.error(e);
        setSync("error");
      }
      fetchCredits().then((c) => c && setCredits(c));
    };
    syncAccount();
  }, [authOn, authReady, user]);

  // Signed in: save to the account a moment after each change.
  useEffect(() => {
    if (!user || syncedFor.current !== user.id) return;
    const t = setTimeout(() => {
      setSync("saving");
      saveRemote(user.id, state)
        .then(() => setSync("saved"))
        .catch(() => setSync("error"));
    }, 1200);
    return () => clearTimeout(t);
  }, [state, user]);

  const needsSignIn = authOn && !user;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("import")) window.history.replaceState(null, "", "/builder");
  }, []);

  useEffect(() => {
    const el = previewBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth) setFitWidth(el.clientWidth - 32);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.started]);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 15_000);
    return () => clearTimeout(t);
  }, [undo]);

  const deferredResume = useDeferredValue(resume);
  const deferredJd = useDeferredValue(jd);
  const analysis = useMemo(() => analyze(deferredResume, deferredJd, pages), [deferredResume, deferredJd, pages]);

  const setResume = useCallback((r: Resume) => setState((s) => ({ ...s, resume: r })), []);
  const setSettings = (patch: Partial<Settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const onPages = useCallback((n: number) => setPages(Math.round(n * 100) / 100), []);

  const fitZoom = Math.min(1.5, Math.max(0.3, fitWidth / PAGE_PX[settings.paper].w));
  const zoom = settings.zoom === 0 ? fitZoom : settings.zoom;
  const stepZoom = (d: number) => setSettings({ zoom: Math.min(1.5, Math.max(0.3, Math.round((zoom + d) * 10) / 10)) });

  const onAddSkill = (k: Keyword) => setResume(addSkill(resume, k.display, k.category, uid));

  const print = () => {
    const prev = document.title;
    const name = resume.basics.name.trim().replace(/\s+/g, "_");
    document.title = name ? `${name}_Resume` : "Resume";
    window.print();
    document.title = prev;
  };

  const onDownload = () => {
    if (
      hasExampleDetails(resume) &&
      !confirm("This resume still has the example's name or contact details. Download it anyway?")
    ) return;
    let seen = false;
    try {
      seen = localStorage.getItem(PRINT_TIP_KEY) === "1";
    } catch {}
    if (seen) print();
    else setShowPrintTip(true);
  };

  const onImport = async (file: File) => {
    try {
      const next = normalizeState(JSON.parse(await file.text()));
      if (confirm("Replace your current resume with this file?")) setState(next);
    } catch {
      alert("That file isn't a valid backup. Export a backup first, then import that file.");
    }
  };

  const replaceResume = (r: Resume, msg: string) => {
    if (confirm(msg)) setResume(structuredClone(r));
  };

  const runTailor = async () => {
    if (needsSignIn) {
      signIn("/builder");
      return;
    }
    setTailorBusy(true);
    setTailorError("");
    try {
      const missing = analysis.keywords.filter((k) => !k.matched && k.kind === "skill").map((k) => k.display);
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd: analysis.hasJd ? jd : "", missing }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI request failed. Please try again.");
      if (typeof data.left === "number") setCredits((c) => (c ? { ...c, tailor: data.left } : c));
      setTailorResult(data as TailorResult);
    } catch (e) {
      setTailorError(e instanceof Error ? e.message : "AI request failed. Please try again.");
    } finally {
      setTailorBusy(false);
    }
  };

  const start = (r: Resume) => setState((s) => ({ ...s, started: true, resume: structuredClone(r) }));

  const startOwn = () => {
    if (isUntouched(state) || confirm("Clear the example and start with a blank resume?")) start(scratchResume());
  };

  const applyWithUndo = (next: Resume, label: string) => {
    setUndo({ resume, label });
    setResume(next);
  };

  const runMenu = (id: MenuId) => {
    if (id === "importResume") setShowImport(true);
    if (id === "export") downloadJson(state);
    if (id === "import") fileInput.current?.click();
    if (id === "sample") replaceResume(SAMPLE_RESUME, "Replace your resume with the example?");
    if (id === "blank") replaceResume(scratchResume(), "Clear everything and start blank? Export a backup first if you need one.");
  };

  const col = scoreColor(analysis.score);
  const errorCount = analysis.issues.filter((i) => i.severity !== "tip").length;

  const tabs: { id: Tab; label: React.ReactNode; mobileOnly?: boolean }[] = [
    { id: "edit", label: "Edit" },
    {
      id: "match",
      label: (
        <>
          Job match{analysis.hasJd && <span className={`ml-1 font-bold ${col.text}`}>{analysis.score}</span>}
        </>
      ),
    },
    {
      id: "checks",
      label: (
        <>
          Checks
          {errorCount > 0 && <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">{errorCount}</span>}
        </>
      ),
    },
    { id: "preview", label: "Preview", mobileOnly: true },
  ];

  return (
    <>
      <style>{`@page { size: ${settings.paper === "a4" ? "A4" : "letter"}; margin: 0; }`}</style>

      <div className="screen-only flex h-dvh flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <LogoMark className="h-7 w-7" />
            {BRAND.name}
          </Link>
          <span className={`hidden text-xs sm:inline ${sync === "error" && user ? "text-red-500" : "text-gray-400"}`}>
            {!user
              ? "Saved in this browser"
              : sync === "loading"
                ? "Loading your resume…"
                : sync === "saving"
                  ? "Saving…"
                  : sync === "error"
                    ? "Couldn't save to your account"
                    : "Saved to your account"}
          </span>
          <div className="min-w-0 flex-1" />
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
              File ▾
            </summary>
            <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-lg">
              {MENU.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                  onClick={(e) => {
                    (e.currentTarget.closest("details") as HTMLDetailsElement).open = false;
                    runMenu(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </details>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
          <UserMenu />
          {state.started && (
            <button
              type="button"
              onClick={onDownload}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <span className="sm:hidden">PDF</span>
              <span className="max-sm:hidden">Download PDF</span>
            </button>
          )}
        </header>

        {!state.started ? (
          <StartScreen
            importNeedsSignIn={needsSignIn}
            onImport={() => setShowImport(true)}
            onScratch={() => start(scratchResume())}
            onExample={() => start(SAMPLE_RESUME)}
          />
        ) : (

        <div className={`grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(420px,540px)_1fr] ${tab === "preview" ? "max-lg:grid-rows-[auto_minmax(0,1fr)]" : ""}`}>
          <div className="flex min-h-0 flex-col border-r border-gray-200">
            <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${t.mobileOnly ? "lg:hidden" : ""} ${
                    tab === t.id ? "border-brand text-brand" : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <div className={`min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 ${tab === "preview" ? "max-lg:hidden" : ""}`}>
              {(tab === "edit" || tab === "preview") && (
                <>
                  {hasExampleDetails(resume) ? (
                    <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                      <div className="text-sm">
                        <div className="font-semibold text-amber-900">You&apos;re looking at an example resume</div>
                        <div className="text-amber-800">Try the Job match and Checks tabs, then start your own.</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={startOwn}
                          className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                          Start my own
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowImport(true)}
                          className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          Import my resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-blue-50 px-4 py-3">
                      <div className="min-w-0 text-sm">
                        <div className="font-semibold">Already have a resume?</div>
                        <div className="text-gray-600">Import a PDF or Word file and AI fills this in.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowImport(true)}
                        className="shrink-0 rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                      >
                        Import
                      </button>
                    </div>
                  )}
                  <Editor resume={resume} onChange={setResume} />
                </>
              )}
              {tab === "match" && (
                <MatchPanel jd={jd} onJdChange={(v) => setState((s) => ({ ...s, jobDescription: v }))} analysis={analysis}
                  onAddSkill={onAddSkill}
                  tailor={{ busy: tailorBusy, error: tailorError, left: credits?.tailor ?? null, needsSignIn, run: runTailor }}
                />
              )}
              {tab === "checks" && <ChecksPanel issues={analysis.issues} />}
            </div>
          </div>

          <div
            className={`flex min-h-0 flex-col bg-gray-200/70 ${
              tab === "preview" ? "" : "max-lg:invisible max-lg:absolute max-lg:-left-[10000px] max-lg:top-0 max-lg:w-screen"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
              <Segmented
                value={settings.template}
                onChange={(v) => setSettings({ template: v })}
                options={[
                  { value: "classic", label: "Classic" },
                  { value: "modern", label: "Modern" },
                ]}
              />
              <Segmented
                value={settings.paper}
                onChange={(v) => setSettings({ paper: v })}
                options={[
                  { value: "a4", label: "A4" },
                  { value: "letter", label: "US Letter" },
                ]}
              />
              <div className="flex-1" />
              <div className="flex items-center gap-1 text-xs">
                <button type="button" onClick={() => stepZoom(-0.1)} className="h-7 w-7 rounded-md border border-gray-300 hover:bg-gray-50" aria-label="Zoom out">−</button>
                <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => stepZoom(0.1)} className="h-7 w-7 rounded-md border border-gray-300 hover:bg-gray-50" aria-label="Zoom in">+</button>
                <button
                  type="button"
                  onClick={() => setSettings({ zoom: 0 })}
                  className={`ml-1 rounded-md border px-2 py-1 ${settings.zoom === 0 ? "border-brand text-brand" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  Fit
                </button>
              </div>
            </div>
            <div ref={previewBox} className="min-h-0 flex-1 overflow-auto p-4">
              <Preview resume={resume} settings={settings} zoom={zoom} onPages={onPages} />
              <p className="mt-3 text-center text-xs text-gray-500">
                {pages > 1.02 ? `${Math.ceil(pages)} pages. One page is best for most roles.` : "Fits on one page ✓"}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>

      {showPrintTip && (
        <div className="screen-only fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Save as PDF</h2>
            <p className="mt-1 text-sm text-gray-600">Your browser&apos;s print window will open. Set it up once:</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
              <li>
                Destination: <b>Save as PDF</b>
              </li>
              <li>
                Margins: <b>None</b> or <b>Default</b>
              </li>
              <li>
                Turn <b>off</b> &ldquo;Headers and footers&rdquo;
              </li>
              <li>
                Turn <b>on</b> &ldquo;Background graphics&rdquo; for the Modern template
              </li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              The PDF has real, selectable text that ATS software can read. Chrome or Edge gives the cleanest result.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100" onClick={() => setShowPrintTip(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                onClick={() => {
                  try {
                    localStorage.setItem(PRINT_TIP_KEY, "1");
                  } catch {}
                  setShowPrintTip(false);
                  setTimeout(print, 50);
                }}
              >
                Got it, open print
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <ImportDialog
          left={credits?.import ?? null}
          needsSignIn={needsSignIn}
          onSignIn={() => signIn("/builder?import=1")}
          onUsed={(left) => setCredits((c) => (c ? { ...c, import: left } : c))}
          onClose={() => setShowImport(false)}
          onImported={(r) => {
            setShowImport(false);
            const wasStarted = state.started;
            applyWithUndo(r, "Resume imported.");
            setState((s) => ({ ...s, started: true }));
            if (!wasStarted) setUndo(null);
            setTab("edit");
          }}
        />
      )}

      {tailorResult && (
        <TailorReview
          result={tailorResult}
          resume={resume}
          jd={analysis.hasJd ? jd : ""}
          pages={pages}
          onClose={() => setTailorResult(null)}
          onApply={(next) => {
            setTailorResult(null);
            applyWithUndo(next, "AI changes applied.");
          }}
        />
      )}

      {undo && (
        <div className="screen-only fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg">
            <span>{undo.label}</span>
            <button
              type="button"
              className="font-semibold text-blue-300 hover:text-blue-200"
              onClick={() => {
                setResume(undo.resume);
                setUndo(null);
              }}
            >
              Undo
            </button>
            <button type="button" className="text-gray-400 hover:text-white" onClick={() => setUndo(null)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="print-only">
        <ResumeDocument resume={resume} settings={settings} />
      </div>
    </>
  );
}
