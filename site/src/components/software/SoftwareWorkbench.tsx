"use client";
import { useState } from "react";
import { trackSoftwareProcess, trackSoftwareDownload } from "@/lib/analytics/events";
import { FREE_SOFTWARE_LIMITS, isWithinSoftwareLimits } from "@/lib/software/limits";
import { cleanCsv, cleanTextLines, formatJson, prepareSoftwareDownload } from "@/lib/software/processors";

type ActiveSlug = "csv-cleaner-pro" | "json-studio" | "text-batch-studio";
export function SoftwareWorkbench({ slug, labels }: {slug: ActiveSlug; labels: {input:string; output:string; process:string; download:string; upload:string; limit:string; placeholder:string; error:string; minify:string}}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [minify, setMinify] = useState(false);
  const process = () => {
    setError(""); setOutput(null);
    try {
      if (!isWithinSoftwareLimits(slug, input)) throw new Error(labels.limit);
      const result = slug === "csv-cleaner-pro" ? cleanCsv(input) : slug === "json-studio" ? formatJson(input, minify) : cleanTextLines(input);
      setOutput(result);
      trackSoftwareProcess({ software: slug, success: true });
    } catch (e) {
      trackSoftwareProcess({ software: slug, success: false });
      setError(e instanceof Error && e.message === labels.limit ? labels.limit : labels.error);
    }
  };
  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    setError(""); setOutput(null);
    // Guard the file size before allocating a potentially large string.
    if (file.size > FREE_SOFTWARE_LIMITS[slug].maxBytes) {
      setInput(""); setError(labels.limit); return;
    }
    try {
      const text = await file.text();
      if (!isWithinSoftwareLimits(slug, text)) {
        setInput(""); setError(labels.limit); return;
      }
      setInput(text);
    } catch {
      setInput(""); setError(labels.error);
    }
  };
  const download = () => {
    if (output === null) return;
    const mime = slug === "csv-cleaner-pro" ? "text/csv" : slug === "json-studio" ? "application/json" : "text/plain";
    const ext = slug === "csv-cleaner-pro" ? "csv" : slug === "json-studio" ? "json" : "txt";
    const url = URL.createObjectURL(new Blob([prepareSoftwareDownload(output, ext)], {type: mime + ";charset=utf-8"}));
    const a = document.createElement("a"); a.href = url; a.download = "toolify365-output." + ext; document.body.appendChild(a); a.click(); a.remove();
    trackSoftwareDownload({ software: slug });
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  // User-supplied local files, editor contents and generated output are private.
  return <div data-clarity-mask="true" className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
    <label className="block text-sm font-semibold" htmlFor="software-file">{labels.upload}</label>
    <input id="software-file" type="file"
      accept={slug === "csv-cleaner-pro" ? ".csv,text/csv" : slug === "json-studio" ? ".json,application/json" : ".txt,text/plain"}
      className="block w-full text-base sm:text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-slate-300 file:bg-transparent file:px-4 file:py-2 file:font-semibold dark:file:border-slate-700"
      onChange={e => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ""; void loadFile(file); }}
    />
    <label className="block text-sm font-semibold" htmlFor="software-input">{labels.input}</label>
    <textarea id="software-input" className="min-h-40 w-full rounded-lg border border-slate-300 bg-transparent p-3 font-mono text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700" value={input} onChange={e=>{setInput(e.target.value);setOutput(null);setError("");}} placeholder={labels.placeholder}/>
    {slug === "json-studio" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={minify} onChange={e=>{setMinify(e.target.checked);setOutput(null);setError("");}}/>{labels.minify}</label>}
    <button type="button" onClick={process} className="min-h-11 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">{labels.process}</button>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {output !== null && <div className="space-y-2"><label htmlFor="software-output" className="block font-semibold">{labels.output}</label><textarea id="software-output" readOnly value={output} className="min-h-40 w-full rounded-lg border border-slate-300 bg-transparent p-3 font-mono text-base sm:text-sm dark:border-slate-700"/><button type="button" onClick={download} className="min-h-11 rounded-lg border px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{labels.download}</button></div>}
  </div>;
}
