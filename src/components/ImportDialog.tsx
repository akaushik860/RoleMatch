"use client";

import { useState } from "react";
import { FREE_LIMITS } from "@/lib/plans";
import type { Resume } from "@/lib/types";
import Modal from "./Modal";
import { GoogleIcon } from "./UserMenu";

export default function ImportDialog({
  onClose,
  onImported,
  left,
  needsSignIn,
  onSignIn,
  onUsed,
}: {
  onClose: () => void;
  onImported: (r: Resume) => void;
  /** AI imports left today; null when unknown or unlimited. */
  left: number | null;
  needsSignIn: boolean;
  onSignIn: () => void;
  onUsed: (left: number) => void;
}) {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const out = left === 0;
  const canSubmit = !busy && !out && (mode === "file" ? !!file : text.trim().length > 50);

  const submit = async () => {
    setBusy(true);
    setError("");
    const form = new FormData();
    if (mode === "file" && file) form.append("file", file);
    else form.append("text", text);
    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Import failed. Please try again.");
      if (typeof data.left === "number") onUsed(data.left);
      onImported(data.resume as Resume);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Modal title="Import your resume" onClose={busy ? undefined : onClose}>
      <p className="text-sm text-gray-600">
        Upload your current resume and AI fills in the editor for you. Your text is kept word for word. This replaces
        what&apos;s in the editor now.
      </p>

      <div className="mt-4 inline-flex rounded-lg bg-gray-100 p-0.5 text-sm font-medium">
        {(["file", "text"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1 ${mode === m ? "bg-white shadow-sm" : "text-gray-600"}`}
          >
            {m === "file" ? "Upload file" : "Paste text"}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center ${
            dragging ? "border-brand bg-blue-50" : "border-gray-300 hover:border-brand"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="text-2xl" aria-hidden>📄</span>
          <span className="mt-1 text-sm font-medium">{file ? file.name : "Drop your resume here or click to choose"}</span>
          <span className="mt-0.5 text-xs text-gray-500">PDF, Word (.docx) or .txt, up to 5 MB</span>
        </label>
      ) : (
        <textarea
          className="mt-3 min-h-48 w-full rounded-md border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="Paste the full text of your resume"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {needsSignIn && (
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-900">
          AI import needs a free account. Sign in with Google and your current resume comes with you.
        </p>
      )}
      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {out && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You&apos;ve used today&apos;s {FREE_LIMITS.import} free imports. Try again tomorrow, or type your details in the editor.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">
          {left !== null && `${left} of ${FREE_LIMITS.import} free imports left today`}
        </span>
        <div className="flex gap-2">
          <button type="button" className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          {needsSignIn ? (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-gray-50"
            >
              <GoogleIcon /> Sign in to import
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {busy ? "Reading your resume…" : "Import"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
