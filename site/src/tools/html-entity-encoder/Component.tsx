"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "encode" | "decode";
type EncodeMode = "named" | "numeric" | "hex";

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  "¡": "&iexcl;", "¢": "&cent;", "£": "&pound;", "¤": "&curren;", "¥": "&yen;",
  "¦": "&brvbar;", "§": "&sect;", "¨": "&uml;", "©": "&copy;", "ª": "&ordf;",
  "«": "&laquo;", "¬": "&not;", "®": "&reg;", "°": "&deg;", "±": "&plusmn;",
  "²": "&sup2;", "³": "&sup3;", "´": "&acute;", "µ": "&micro;", "¶": "&para;",
  "·": "&middot;", "¸": "&cedil;", "¹": "&sup1;", "º": "&ordm;", "»": "&raquo;",
  "¼": "&frac14;", "½": "&frac12;", "¾": "&frac34;", "¿": "&iquest;",
  "À": "&Agrave;", "Á": "&Aacute;", "Â": "&Acirc;", "Ã": "&Atilde;", "Ä": "&Auml;",
  "Å": "&Aring;", "Æ": "&AElig;", "Ç": "&Ccedil;", "È": "&Egrave;", "É": "&Eacute;",
  "Ê": "&Ecirc;", "Ë": "&Euml;", "Ì": "&Igrave;", "Í": "&Iacute;", "Î": "&Icirc;",
  "Ï": "&Iuml;", "Ð": "&ETH;", "Ñ": "&Ntilde;", "Ò": "&Ograve;", "Ó": "&Oacute;",
  "Ô": "&Ocirc;", "Õ": "&Otilde;", "Ö": "&Ouml;", "×": "&times;", "Ø": "&Oslash;",
  "Ù": "&Ugrave;", "Ú": "&Uacute;", "Û": "&Ucirc;", "Ü": "&Uuml;", "Ý": "&Yacute;",
  "Þ": "&THORN;", "ß": "&szlig;", "à": "&agrave;", "á": "&aacute;", "â": "&acirc;",
  "ã": "&atilde;", "ä": "&auml;", "å": "&aring;", "æ": "&aelig;", "ç": "&ccedil;",
  "è": "&egrave;", "é": "&eacute;", "ê": "&ecirc;", "ë": "&euml;", "ì": "&igrave;",
  "í": "&iacute;", "î": "&icirc;", "ï": "&iuml;", "ð": "&eth;", "ñ": "&ntilde;",
  "ò": "&ograve;", "ó": "&oacute;", "ô": "&ocirc;", "õ": "&otilde;", "ö": "&ouml;",
  "÷": "&divide;", "ø": "&oslash;", "ù": "&ugrave;", "ú": "&uacute;", "û": "&ucirc;",
  "ü": "&uuml;", "ý": "&yacute;", "þ": "&thorn;", "ÿ": "&yuml;",
  "–": "&ndash;", "—": "&mdash;", "‘": "&lsquo;", "’": "&rsquo;",
  "“": "&ldquo;", "”": "&rdquo;", "•": "&bull;", "…": "&hellip;",
  "€": "&euro;", "™": "&trade;", "←": "&larr;", "→": "&rarr;", "↑": "&uarr;",
  "↓": "&darr;", "↔": "&harr;", "♠": "&spades;", "♣": "&clubs;", "♥": "&hearts;",
  "♦": "&diams;",
};

const ENTITY_TO_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENTITIES).map(([ch, ent]) => [ent, ch])
);

function encodeHtml(text: string, mode: EncodeMode, encodeAll: boolean): string {
  return Array.from(text).map((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    const mustEncode = ch === "&" || ch === "<" || ch === ">" || ch === '"' || ch === "'";
    const shouldEncode = mustEncode || encodeAll;
    if (!shouldEncode && code < 128) return ch;

    if (mode === "named" && NAMED_ENTITIES[ch]) return NAMED_ENTITIES[ch];
    if (mode === "hex") return `&#x${code.toString(16).toUpperCase()};`;
    return `&#${code};`;
  }).join("");
}

function decodeHtml(text: string): string {
  return text
    .replace(/&([a-zA-Z]+);/g, (match) => ENTITY_TO_CHAR[match] ?? match)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

export default function HtmlEntityEncoder() {
  const t = useTranslations("tools.html-entity-encoder");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<EncodeMode>("named");
  const [encodeAll, setEncodeAll] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? encodeHtml(input, encodeMode, encodeAll) : decodeHtml(input);
  }, [input, mode, encodeMode, encodeAll]);

  const handleCopy = () => { if (output) navigator.clipboard.writeText(output).catch(() => {}); };
  const handleSwap = () => { if (output) { setInput(output); setMode((m) => m === "encode" ? "decode" : "encode"); } };

  const inputClass = "w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded border border-slate-300 overflow-hidden dark:border-slate-700">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput(""); }}
              className={
                "px-4 py-2 text-sm font-medium " +
                (mode === m
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <select
              value={encodeMode}
              onChange={(e) => setEncodeMode(e.target.value as EncodeMode)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="named">{t("encodeMode.named")}</option>
              <option value="numeric">{t("encodeMode.numeric")}</option>
              <option value="hex">{t("encodeMode.hex")}</option>
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={encodeAll}
                onChange={(e) => setEncodeAll(e.target.checked)}
                className="accent-brand-600"
              />
              {t("option.encodeAll")}
            </label>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {mode === "encode" ? t("label.inputText") : t("label.inputEncoded")}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            placeholder={mode === "encode" ? t("placeholder.text") : t("placeholder.encoded")}
            className={inputClass}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {mode === "encode" ? t("label.outputEncoded") : t("label.outputText")}
            </span>
            <div className="flex gap-2">
              <button onClick={handleSwap} disabled={!output} className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-40 dark:text-brand-400">
                ⇄ {t("action.swap")}
              </button>
              <button onClick={handleCopy} disabled={!output} className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-40 dark:text-brand-400">
                {t("action.copy")}
              </button>
            </div>
          </div>
          <textarea readOnly value={output} rows={10} className={inputClass + " bg-slate-50 dark:bg-slate-800/50"} />
        </div>
      </div>
    </div>
  );
}
