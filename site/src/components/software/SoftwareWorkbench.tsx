"use client";
import { useState } from "react";
import { FREE_SOFTWARE_LIMITS, isWithinBytes } from "@/lib/software/limits";
import { cleanCsv, cleanTextLines, formatJson } from "@/lib/software/processors";

type ActiveSlug = "csv-cleaner-pro" | "json-studio" | "text-batch-studio";
export function SoftwareWorkbench({ slug, labels }: {slug: ActiveSlug; labels: {input:string; output:string; process:string; download:string; limit:string; placeholder:string; error:string; minify:string}}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [minify, setMinify] = useState(false);
  const process = () => {
    setError(""); setOutput(null);
    try {
      const limits = FREE_SOFTWARE_LIMITS[slug];
      if (!isWithinBytes(input, limits.maxBytes)) throw new Error(labels.limit);
      if (slug === "csv-cleaner-pro" && input.split(/\r?\n/).length > FREE_SOFTWARE_LIMITS["csv-cleaner-pro"].maxRows) throw new Error(labels.limit);
      if (slug === "text-batch-studio" && input.split(/\r?\n/).length > FREE_SOFTWARE_LIMITS["text-batch-studio"].maxLines) throw new Error(labels.limit);
      setOutput(slug === "csv-cleaner-pro" ? cleanCsv(input) : slug === "json-studio" ? formatJson(input, minify) : cleanTextLines(input));
    } catch (e) { setError(e instanceof Error && e.message === labels.limit ? labels.limit : labels.error); }
  };
  const download = () => {
    if (output === null) return;
    const mime = slug === "csv-cleaner-pro" ? "text/csv" : slug === "json-studio" ? "application/json" : "text/plain";
    const ext = slug === "csv-cleaner-pro" ? "csv" : slug === "json-studio" ? "json" : "txt";
    const url = URL.createObjectURL(new Blob([output], {type: mime + ";charset=utf-8"}));
    const a = document.createElement("a"); a.href = url; a.download = "toolify365-output." + ext; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="space-y-4 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
    <label className="block text-sm font-semibold" htmlFor="software-input">{labels.input}</label>
    <textarea id="software-input" className="min-h-40 w-full rounded-lg border border-slate-300 bg-transparent p-3 font-mono text-sm dark:border-slate-700" value={input} onChange={e=>setInput(e.target.value)} placeholder={labels.placeholder}/>
    {slug === "json-studio" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={minify} onChange={e=>setMinify(e.target.checked)}/>{labels.minify}</label>}
    <button type="button" onClick={process} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">{labels.process}</button>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {output !== null && <div className="space-y-2"><label htmlFor="software-output" className="block font-semibold">{labels.output}</label><textarea id="software-output" readOnly value={output} className="min-h-40 w-full rounded-lg border border-slate-300 bg-transparent p-3 font-mono text-sm dark:border-slate-700"/><button type="button" onClick={download} className="rounded-lg border px-4 py-2">{labels.download}</button></div>}
  </div>;
}
