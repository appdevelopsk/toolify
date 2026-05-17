"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// RFC 4180 compliant CSV parser (handles quoted fields with commas, escaped quotes, line breaks).
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === delimiter) {
        row.push(field);
        field = "";
        i++;
      } else if (ch === "\n" || ch === "\r") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        if (ch === "\r" && text[i + 1] === "\n") i += 2;
        else i++;
      } else {
        field += ch;
        i++;
      }
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

function escapeCsvField(value: unknown, delimiter: string): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export default function CsvJsonConverter() {
  const t = useTranslations("tools.csv-json-converter");
  const [direction, setDirection] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
  const [delimiter, setDelimiter] = useState(",");
  const [headerRow, setHeaderRow] = useState(true);
  const [input, setInput] = useState(
    "name,age,city\nAlice,30,Tokyo\nBob,25,Seoul\nCarol,42,Madrid"
  );

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      if (direction === "csvToJson") {
        const rows = parseCsv(input, delimiter);
        if (rows.length === 0) return { ok: true as const, value: "[]" };
        if (headerRow) {
          const headers = rows[0]!;
          const data = rows.slice(1).map((r) => {
            const obj: Record<string, string> = {};
            for (let i = 0; i < headers.length; i++) {
              const key = headers[i]!;
              obj[key] = r[i] ?? "";
            }
            return obj;
          });
          return { ok: true as const, value: JSON.stringify(data, null, 2) };
        }
        return { ok: true as const, value: JSON.stringify(rows, null, 2) };
      } else {
        const data: unknown = JSON.parse(input);
        if (!Array.isArray(data)) throw new Error("expected an array of objects or arrays");
        if (data.length === 0) return { ok: true as const, value: "" };
        // Decide if array-of-objects or array-of-arrays
        if (typeof data[0] === "object" && data[0] !== null && !Array.isArray(data[0])) {
          const headers = [...new Set(data.flatMap((r) => Object.keys(r as object)))];
          const lines = [headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter)];
          for (const row of data) {
            const r = row as Record<string, unknown>;
            lines.push(headers.map((h) => escapeCsvField(r[h], delimiter)).join(delimiter));
          }
          return { ok: true as const, value: lines.join("\n") };
        }
        // Array of arrays
        const lines = (data as unknown[][]).map((row) => row.map((v) => escapeCsvField(v, delimiter)).join(delimiter));
        return { ok: true as const, value: lines.join("\n") };
      }
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, [direction, input, delimiter, headerRow]);

  async function copy() {
    if (result?.ok) await navigator.clipboard.writeText(result.value);
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 p-1 dark:border-slate-700">
        <button
          onClick={() => setDirection("csvToJson")}
          className={`rounded px-3 py-1 text-sm ${direction === "csvToJson" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("direction.csvToJson")}
        </button>
        <button
          onClick={() => setDirection("jsonToCsv")}
          className={`rounded px-3 py-1 text-sm ${direction === "jsonToCsv" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("direction.jsonToCsv")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_auto_1fr]">
        <label className="block">
          <span className="text-sm font-medium">{t("input.delimiter")}</span>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value=",">{t("delim.comma")}</option>
            <option value=";">{t("delim.semicolon")}</option>
            <option value={"\t"}>{t("delim.tab")}</option>
            <option value="|">{t("delim.pipe")}</option>
          </select>
        </label>
        {direction === "csvToJson" && (
          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" checked={headerRow} onChange={(e) => setHeaderRow(e.target.checked)} className="size-4" />
            <span>{t("input.headerRow")}</span>
          </label>
        )}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">{direction === "csvToJson" ? t("input.csv") : t("input.json")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          spellCheck={false}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output")}</span>
          <button onClick={copy} disabled={!result?.ok} className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">
            {t("copy")}
          </button>
        </div>
        {!result ? (
          <div className="mt-1 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">{t("empty")}</div>
        ) : !result.ok ? (
          <div className="mt-1 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-200">
            {t("error.label")}: {result.error}
          </div>
        ) : (
          <pre className="mt-1 overflow-auto whitespace-pre rounded border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900/50">{result.value}</pre>
        )}
      </div>
    </div>
  );
}
