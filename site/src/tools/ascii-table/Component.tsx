"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface AsciiEntry {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  category: "control" | "printable";
  description: string;
}

const CONTROL_NAMES: Record<number, string> = {
  0: "NUL — Null", 1: "SOH — Start of Heading", 2: "STX — Start of Text",
  3: "ETX — End of Text", 4: "EOT — End of Transmission", 5: "ENQ — Enquiry",
  6: "ACK — Acknowledge", 7: "BEL — Bell", 8: "BS — Backspace", 9: "HT — Horizontal Tab",
  10: "LF — Line Feed", 11: "VT — Vertical Tab", 12: "FF — Form Feed",
  13: "CR — Carriage Return", 14: "SO — Shift Out", 15: "SI — Shift In",
  16: "DLE — Data Link Escape", 17: "DC1 — Device Control 1 (XON)",
  18: "DC2 — Device Control 2", 19: "DC3 — Device Control 3 (XOFF)",
  20: "DC4 — Device Control 4", 21: "NAK — Negative Acknowledge",
  22: "SYN — Synchronous Idle", 23: "ETB — End of Transmission Block",
  24: "CAN — Cancel", 25: "EM — End of Medium", 26: "SUB — Substitute",
  27: "ESC — Escape", 28: "FS — File Separator", 29: "GS — Group Separator",
  30: "RS — Record Separator", 31: "US — Unit Separator", 32: "SP — Space",
  127: "DEL — Delete",
};

const CONTROL_ABBR: Record<number, string> = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB",
  24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US",
  32: "SP", 127: "DEL",
};

function buildTable(): AsciiEntry[] {
  const entries: AsciiEntry[] = [];
  for (let i = 0; i <= 127; i++) {
    const isControl = i < 32 || i === 32 || i === 127;
    const isDisplayControl = i < 32 || i === 127;
    entries.push({
      dec: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      oct: i.toString(8).padStart(3, "0"),
      bin: i.toString(2).padStart(8, "0"),
      char: isDisplayControl ? CONTROL_ABBR[i] ?? "?" : String.fromCharCode(i),
      category: isDisplayControl ? "control" : "printable",
      description: CONTROL_NAMES[i] ?? "",
    });
  }
  return entries;
}

const ASCII_TABLE = buildTable();

type View = "all" | "printable" | "control";

export default function AsciiTable() {
  const t = useTranslations("tools.ascii-table");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ASCII_TABLE.filter((entry) => {
      if (view === "printable" && entry.category !== "printable") return false;
      if (view === "control" && entry.category !== "control") return false;
      if (!q) return true;
      const numQ = parseInt(q, 10);
      return (
        (!isNaN(numQ) && entry.dec === numQ) ||
        entry.hex.toLowerCase() === q.replace(/^0x/i, "") ||
        entry.char.toLowerCase() === q ||
        entry.description.toLowerCase().includes(q)
      );
    });
  }, [search, view]);

  const inputClass =
    "rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          className={inputClass + " flex-1 min-w-[160px]"}
        />
        <div className="flex gap-2">
          {(["all", "printable", "control"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={
                "rounded px-3 py-1.5 text-xs font-medium " +
                (view === v
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
              }
            >
              {t(`filter.${v}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.dec")}</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.hex")}</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">{t("col.oct")}</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">{t("col.bin")}</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.char")}</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.description")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((entry) => (
              <tr
                key={entry.dec}
                className={
                  entry.category === "control"
                    ? "bg-amber-50/60 dark:bg-amber-900/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }
              >
                <td className="px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200">{entry.dec}</td>
                <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">0x{entry.hex}</td>
                <td className="px-3 py-1.5 font-mono text-slate-600 dark:text-slate-400 hidden sm:table-cell">{entry.oct}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-slate-500 dark:text-slate-500 hidden md:table-cell">{entry.bin}</td>
                <td className="px-3 py-1.5">
                  {entry.category === "control" ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                      {entry.char}
                    </span>
                  ) : (
                    <span className="font-mono text-base font-semibold text-slate-900 dark:text-slate-100">
                      {entry.char}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {entry.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("search.noResults")}
          </p>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t("note", { count: filtered.length })}
      </p>
    </div>
  );
}
