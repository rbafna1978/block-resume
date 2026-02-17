"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SectionEditor } from "@/components/SectionEditor";
import { SectionList } from "@/components/SectionList";
import { defaultResume } from "@/lib/defaultResume";
import { ResumeDocument, SectionBlock, validateResumeDocument } from "@/lib/schema";

const STORAGE_VERSION = "v2";
const STORAGE_KEY = `block-resume-doc:${STORAGE_VERSION}`;
const LEGACY_STORAGE_KEYS = ["block-resume-doc"];
const COMPILE_API_BASE = process.env.NEXT_PUBLIC_COMPILE_API_URL?.replace(/\/$/, "");
const COMPILE_ENDPOINT = COMPILE_API_BASE ? `${COMPILE_API_BASE}/api/compile` : "/api/compile";

const cloneDoc = (doc: ResumeDocument): ResumeDocument => JSON.parse(JSON.stringify(doc));

export default function HomePage() {
  const [doc, setDoc] = useState<ResumeDocument>(() => cloneDoc(defaultResume));
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDoc(JSON.parse(saved));
      } catch {
        setDoc(cloneDoc(defaultResume));
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  }, [doc]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  const updateSection = (index: number, section: SectionBlock) => {
    const next = [...doc.blocks];
    next[index] = section;
    setDoc({ ...doc, blocks: next, meta: { ...doc.meta, updatedAt: new Date().toISOString() } });
  };

  const updateSections = (sections: SectionBlock[]) => {
    setDoc({ ...doc, blocks: sections, meta: { ...doc.meta, updatedAt: new Date().toISOString() } });
  };

  const removeSection = (index: number) => {
    const next = doc.blocks.filter((_, idx) => idx !== index);
    setDoc({ ...doc, blocks: next, meta: { ...doc.meta, updatedAt: new Date().toISOString() } });
  };

  const headerLinks = useMemo(() => doc.header.links ?? [], [doc.header.links]);

  const updateHeaderLink = (index: number, patch: { label?: string; url?: string }) => {
    const next = [...headerLinks];
    next[index] = { ...next[index], ...patch };
    setDoc({ ...doc, header: { ...doc.header, links: next } });
  };

  const addHeaderLink = () => {
    setDoc({ ...doc, header: { ...doc.header, links: [...headerLinks, { label: "", url: "" }] } });
  };

  const removeHeaderLink = (index: number) => {
    const next = headerLinks.filter((_, idx) => idx !== index);
    setDoc({ ...doc, header: { ...doc.header, links: next } });
  };

  const compileResume = async () => {
    setIsCompiling(true);
    setCompileError(null);
    try {
      const response = await fetch(COMPILE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as {
          latexLogSnippet?: string;
          message?: string;
        };
        setCompileError(errorBody.latexLogSnippet || errorBody.message || "Compilation failed");
        setIsCompiling(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (error) {
      setCompileError(error instanceof Error ? error.message : "Compilation failed");
    } finally {
      setIsCompiling(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${doc.meta.title || "resume"}.pdf`;
    link.click();
  };

  const reset = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setDoc(cloneDoc(defaultResume));
    setPdfUrl(null);
    setCompileError(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ResumeDocument;
        if (!validateResumeDocument(data)) {
          setCompileError("Invalid resume schema in imported JSON");
          return;
        }
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setDoc(data);
        setPdfUrl(null);
        setCompileError(null);
      } catch {
        setCompileError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">BlockResume</h1>
            <p className="text-xs text-slate-500">Edit blocks, compile, and export polished PDFs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn"
              onClick={reset}
            >
              New Resume
            </button>
            <label className="btn">
              Import JSON
              <input type="file" className="hidden" accept="application/json" onChange={importJson} />
            </label>
            <button
              type="button"
              className="btn"
              onClick={exportJson}
            >
              Export JSON
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={compileResume}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Compile PDF"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={downloadPdf}
              disabled={!pdfUrl}
            >
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold">Header</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill in your contact details. Examples are shown below so you can paste either usernames or full links.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">Full name</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  placeholder="Jane Smith"
                  value={doc.header.name}
                  onChange={(event) => setDoc({ ...doc, header: { ...doc.header, name: event.target.value } })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">Location</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  placeholder="Seattle, WA"
                  value={doc.header.location}
                  onChange={(event) =>
                    setDoc({ ...doc, header: { ...doc.header, location: event.target.value } })
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">Phone</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  placeholder="(206) 555-1234"
                  inputMode="tel"
                  value={doc.header.phone}
                  onChange={(event) => setDoc({ ...doc, header: { ...doc.header, phone: event.target.value } })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">Email</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  type="email"
                  placeholder="jane.smith@email.com"
                  value={doc.header.email}
                  onChange={(event) => setDoc({ ...doc, header: { ...doc.header, email: event.target.value } })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">LinkedIn</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  placeholder="john-doe OR linkedin.com/in/john-doe"
                  value={doc.header.linkedin}
                  onChange={(event) =>
                    setDoc({ ...doc, header: { ...doc.header, linkedin: event.target.value } })
                  }
                />
                <div className="text-[11px] text-slate-500">You can paste either the full profile URL or just the last part.</div>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-700">GitHub</span>
                <input
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                  placeholder="janesmith OR github.com/janesmith"
                  value={doc.header.github}
                  onChange={(event) => setDoc({ ...doc, header: { ...doc.header, github: event.target.value } })}
                />
                <div className="text-[11px] text-slate-500">You can paste either the full profile URL or just your username.</div>
              </label>
            </div>
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Additional Links</div>
              <div className="text-[11px] text-slate-500">Examples: portfolio site, personal website, publications, or a project demo.</div>
              {headerLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 p-2 text-sm"
                    placeholder="Label (e.g., Portfolio)"
                    value={link.label}
                    onChange={(event) => updateHeaderLink(index, { label: event.target.value })}
                  />
                  <input
                    className="flex-[2] rounded-lg border border-slate-200 p-2 text-sm"
                    type="url"
                    placeholder="URL (e.g., https://janesmith.dev)"
                    value={link.url}
                    onChange={(event) => updateHeaderLink(index, { url: event.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeHeaderLink(index)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button type="button" className="btn" onClick={addHeaderLink}>
                Add link
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold">Sections</h2>
            <div className="mt-3">
              <SectionList sections={doc.blocks} onChange={updateSections} />
            </div>
          </div>

          <div className="space-y-4">
            {doc.blocks.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(next) => updateSection(index, next)}
                onRemove={() => removeSection(index)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold">Preview</h2>
            {pdfUrl ? (
              <iframe className="mt-3 h-[80vh] w-full rounded-lg border border-slate-200" src={pdfUrl} />
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Compile to preview PDF.
              </div>
            )}
          </div>
          {compileError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <div className="font-semibold">Compilation failed</div>
              <details className="mt-2 whitespace-pre-wrap text-xs">
                <summary className="cursor-pointer">Show log snippet</summary>
                {compileError}
              </details>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
