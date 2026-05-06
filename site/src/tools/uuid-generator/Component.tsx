"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Version = "v4" | "v7";

function bytesToHex(bytes: Uint8Array, start: number, end: number): string {
  let s = "";
  for (let i = start; i < end; i++) s += bytes[i]!.toString(16).padStart(2, "0");
  return s;
}

function uuidV4(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  return `${bytesToHex(b, 0, 4)}-${bytesToHex(b, 4, 6)}-${bytesToHex(b, 6, 8)}-${bytesToHex(b, 8, 10)}-${bytesToHex(b, 10, 16)}`;
}

function uuidV7(): string {
  const ms = BigInt(Date.now());
  const b = new Uint8Array(16);
  // Time portion (48 bits)
  b[0] = Number((ms >> 40n) & 0xffn);
  b[1] = Number((ms >> 32n) & 0xffn);
  b[2] = Number((ms >> 24n) & 0xffn);
  b[3] = Number((ms >> 16n) & 0xffn);
  b[4] = Number((ms >> 8n) & 0xffn);
  b[5] = Number(ms & 0xffn);
  // Random portion
  const r = new Uint8Array(10);
  crypto.getRandomValues(r);
  for (let i = 0; i < 10; i++) b[6 + i] = r[i]!;
  // Version 7
  b[6] = (b[6]! & 0x0f) | 0x70;
  // Variant
  b[8] = (b[8]! & 0x3f) | 0x80;
  return `${bytesToHex(b, 0, 4)}-${bytesToHex(b, 4, 6)}-${bytesToHex(b, 6, 8)}-${bytesToHex(b, 8, 10)}-${bytesToHex(b, 10, 16)}`;
}

export default function UuidGenerator() {
  const t = useTranslations("tools.uuid-generator");
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const regenerate = useCallback(() => {
    const fn = version === "v4" ? uuidV4 : uuidV7;
    const out: string[] = [];
    for (let i = 0; i < Math.max(1, Math.min(100, count)); i++) out.push(fn());
    setList(out);
    setCopiedIdx(null);
    setCopiedAll(false);
  }, [version, count]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  async function copy(idx: number) {
    if (!list[idx]) return;
    await navigator.clipboard.writeText(list[idx]);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  }
  async function copyAll() {
    if (list.length === 0) return;
    await navigator.clipboard.writeText(list.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1200);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setVersion("v4")} className={`px-3 py-1.5 text-sm ${version === "v4" ? "bg-brand-600 text-white" : ""}`}>UUID v4</button>
          <button onClick={() => setVersion("v7")} className={`px-3 py-1.5 text-sm ${version === "v7" ? "bg-brand-600 text-white" : ""}`}>UUID v7</button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          {t("count")}:
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))} className="w-20 rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <button onClick={regenerate} className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">{t("regenerate")}</button>
        {list.length > 1 && (
          <button onClick={copyAll} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            {copiedAll ? t("copied") : t("copyAll")}
          </button>
        )}
      </div>

      <div aria-live="polite" className="space-y-1">
        {list.map((id, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
            <code className="flex-1 truncate font-mono text-sm">{id}</code>
            <button onClick={() => copy(idx)} className="text-xs hover:underline">{copiedIdx === idx ? t("copied") : t("copy")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
