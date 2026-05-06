"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGORITHMS: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i]!.toString(16).padStart(2, "0");
  return s;
}

export default function HashGenerator() {
  const t = useTranslations("tools.hash-generator");
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "",
  });
  const [copied, setCopied] = useState<Algorithm | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function compute() {
      if (!text) {
        if (!cancelled) setHashes({ "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" });
        return;
      }
      const data = new TextEncoder().encode(text);
      const out: Record<Algorithm, string> = { "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" };
      for (const algo of ALGORITHMS) {
        try {
          const buf = await crypto.subtle.digest(algo, data);
          out[algo] = bufferToHex(buf);
        } catch {
          out[algo] = "(unavailable)";
        }
      }
      if (!cancelled) setHashes(out);
    }
    compute();
    return () => { cancelled = true; };
  }, [text]);

  async function copy(algo: Algorithm) {
    if (!hashes[algo]) return;
    await navigator.clipboard.writeText(hashes[algo]);
    setCopied(algo);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" placeholder={t("input.placeholder")} />
      </label>

      <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        {t("md5Note")}
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {ALGORITHMS.map((algo) => (
          <div key={algo} className="rounded border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 dark:bg-slate-900">
              <span className="font-medium">{algo}</span>
              <button onClick={() => copy(algo)} disabled={!hashes[algo]} className="text-xs hover:underline disabled:opacity-30">
                {copied === algo ? t("copied") : t("copy")}
              </button>
            </div>
            <pre className="overflow-x-auto break-all px-3 py-2 font-mono text-sm">{hashes[algo] || " "}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
