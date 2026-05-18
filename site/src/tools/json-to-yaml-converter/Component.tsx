"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Pure-JS JSON → YAML converter
// ---------------------------------------------------------------------------

function needsQuotes(s: string): boolean {
  // Quote strings that: are empty, start with special chars, look like numbers/booleans/null,
  // or contain characters that would confuse YAML parsers.
  if (s === "") return true;
  const YAML_SPECIAL = /^[{}\[\],&*#?|<>=!%@`~]|:\s|^[\s]|[\s]$|^(true|false|null|yes|no|on|off)$/i;
  if (YAML_SPECIAL.test(s)) return true;
  // If it parses as a number, quote it (to preserve string type)
  if (!isNaN(Number(s)) && s.trim() !== "") return true;
  // Colons in the middle
  if (s.includes(": ") || s.includes(" #")) return true;
  return false;
}

function yamlString(s: string): string {
  if (needsQuotes(s)) {
    // escape backslashes then double-quotes
    return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"';
  }
  return s;
}

function jsonToYamlValue(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);

  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return yamlString(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const lines: string[] = [];
    for (const item of value) {
      if (item !== null && typeof item === "object") {
        const inner = jsonToYamlValue(item, indent + 1);
        // For objects inside arrays, first key on same line as "- "
        const innerLines = inner.split("\n");
        lines.push(pad + "- " + innerLines[0]);
        for (let i = 1; i < innerLines.length; i++) {
          lines.push(pad + "  " + innerLines[i]);
        }
      } else {
        lines.push(pad + "- " + jsonToYamlValue(item, 0));
      }
    }
    return lines.join("\n");
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    const lines: string[] = [];
    for (const key of keys) {
      const yamlKey = yamlString(key);
      const child = obj[key];
      if (child !== null && typeof child === "object") {
        const inner = jsonToYamlValue(child, indent + 1);
        if (Array.isArray(child) && (child as unknown[]).length === 0) {
          lines.push(pad + yamlKey + ": []");
        } else if (!Array.isArray(child) && Object.keys(child as object).length === 0) {
          lines.push(pad + yamlKey + ": {}");
        } else {
          lines.push(pad + yamlKey + ":");
          lines.push(inner);
        }
      } else {
        lines.push(pad + yamlKey + ": " + jsonToYamlValue(child, 0));
      }
    }
    return lines.join("\n");
  }

  return String(value);
}

export function convertJsonToYaml(jsonText: string): { ok: true; yaml: string } | { ok: false; error: string } {
  if (!jsonText.trim()) return { ok: true, yaml: "" };
  try {
    const parsed: unknown = JSON.parse(jsonText);
    const yaml = jsonToYamlValue(parsed, 0);
    return { ok: true, yaml };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Pure-JS YAML → JSON converter
// ---------------------------------------------------------------------------

interface YamlLine {
  indent: number;
  raw: string;    // full content after indent
  key: string | null;
  value: string | null; // inline value after colon, or null
  isListItem: boolean;  // starts with "- "
  listValue: string;    // content after "- "
}

function parseYamlString(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    const inner = t.slice(1, -1);
    if (t.startsWith('"')) {
      return inner
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t");
    }
    return inner.replace(/''/g, "'");
  }
  return t;
}

function inferScalar(s: string): unknown {
  const t = s.trim();
  if (t === "null" || t === "~") return null;
  if (t === "true" || t === "yes" || t === "on") return true;
  if (t === "false" || t === "no" || t === "off") return false;
  // Quoted string – return as string
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return parseYamlString(t);
  }
  // Number
  if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) {
    const n = Number(t);
    if (!isNaN(n)) return n;
  }
  return t;
}

function tokenizeYaml(text: string): YamlLine[] {
  const lines: YamlLine[] = [];
  for (const raw of text.split("\n")) {
    // Skip blank lines and comments
    if (/^\s*(#.*)?$/.test(raw)) continue;

    const indentMatch = raw.match(/^(\s*)/);
    const indent = indentMatch?.[1]?.length ?? 0;
    const content = raw.slice(indent);

    if (content.startsWith("- ") || content === "-") {
      const listValue = content.startsWith("- ") ? content.slice(2) : "";
      // Check if list item is also a key:value
      const kvMatch = listValue.match(/^([^:]+?)\s*:\s*(.*)$/);
      if (kvMatch && !listValue.startsWith('"') && !listValue.startsWith("'")) {
        lines.push({ indent, raw: content, key: null, value: null, isListItem: true, listValue });
      } else {
        lines.push({ indent, raw: content, key: null, value: listValue, isListItem: true, listValue });
      }
    } else {
      // Key: value
      const colonIdx = findKeyColon(content);
      if (colonIdx !== -1) {
        const key = content.slice(0, colonIdx).trim();
        const value = content.slice(colonIdx + 1).trim();
        lines.push({ indent, raw: content, key: parseYamlString(key), value: value || null, isListItem: false, listValue: "" });
      } else {
        // Bare scalar (shouldn't happen at top level, but handle gracefully)
        lines.push({ indent, raw: content, key: null, value: content, isListItem: false, listValue: "" });
      }
    }
  }
  return lines;
}

function findKeyColon(content: string): number {
  // Find ": " or end-of-line colon that separates key from value
  // Respect quoted strings
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (!inSingle && !inDouble && ch === ":") {
      if (i + 1 === content.length || content[i + 1] === " " || content[i + 1] === "\t") {
        return i;
      }
    }
  }
  return -1;
}

function parseYamlTokens(lines: YamlLine[], startIdx: number, baseIndent: number): { value: unknown; nextIdx: number } {
  if (startIdx >= lines.length) return { value: null, nextIdx: startIdx };

  const first = lines[startIdx]!;

  // Detect structure type from first line
  if (first.isListItem) {
    // Array
    const arr: unknown[] = [];
    let i = startIdx;
    while (i < lines.length && lines[i]!.indent === baseIndent && lines[i]!.isListItem) {
      const line = lines[i]!;
      // Check if the list value contains a key:value pair (inline object start)
      const lv = line.listValue.trim();
      const colonIdx = findKeyColon(lv);
      if (colonIdx !== -1 && !lv.startsWith('"') && !lv.startsWith("'")) {
        // First key is inline, rest are on next lines with deeper indent
        const obj: Record<string, unknown> = {};
        const firstKey = parseYamlString(lv.slice(0, colonIdx).trim());
        const firstVal = lv.slice(colonIdx + 1).trim();
        // peek ahead for nested lines
        const nextIndent = baseIndent + 2;
        let j = i + 1;
        if (firstVal) {
          obj[firstKey] = inferScalar(firstVal);
        } else {
          // value is on next lines
          if (j < lines.length && lines[j]!.indent > baseIndent) {
            const res = parseYamlTokens(lines, j, lines[j]!.indent);
            obj[firstKey] = res.value;
            j = res.nextIdx;
          } else {
            obj[firstKey] = null;
          }
        }
        // Continue parsing more keys at nextIndent
        while (j < lines.length && lines[j]!.indent >= nextIndent && !lines[j]!.isListItem) {
          const kline = lines[j]!;
          if (kline.key !== null) {
            if (kline.value && kline.value !== "") {
              obj[kline.key] = inferScalar(kline.value);
              j++;
            } else {
              // nested
              const ni = j + 1;
              if (ni < lines.length && lines[ni]!.indent > kline.indent) {
                const res = parseYamlTokens(lines, ni, lines[ni]!.indent);
                obj[kline.key] = res.value;
                j = res.nextIdx;
              } else {
                obj[kline.key] = null;
                j++;
              }
            }
          } else {
            break;
          }
        }
        arr.push(obj);
        i = j;
      } else if (!lv) {
        // "- " followed by nothing → next lines are nested
        const ni = i + 1;
        if (ni < lines.length && lines[ni]!.indent > baseIndent) {
          const res = parseYamlTokens(lines, ni, lines[ni]!.indent);
          arr.push(res.value);
          i = res.nextIdx;
        } else {
          arr.push(null);
          i++;
        }
      } else {
        arr.push(inferScalar(lv));
        i++;
      }
    }
    return { value: arr, nextIdx: i };
  } else {
    // Object
    const obj: Record<string, unknown> = {};
    let i = startIdx;
    while (i < lines.length && lines[i]!.indent === baseIndent && !lines[i]!.isListItem) {
      const line = lines[i]!;
      if (line.key === null) { i++; continue; }
      if (line.value && line.value !== "") {
        obj[line.key] = inferScalar(line.value);
        i++;
      } else {
        // value is nested
        const ni = i + 1;
        if (ni < lines.length && lines[ni]!.indent > baseIndent) {
          const res = parseYamlTokens(lines, ni, lines[ni]!.indent);
          obj[line.key] = res.value;
          i = res.nextIdx;
        } else {
          obj[line.key] = null;
          i++;
        }
      }
    }
    return { value: obj, nextIdx: i };
  }
}

export function convertYamlToJson(yamlText: string): { ok: true; json: string } | { ok: false; error: string } {
  if (!yamlText.trim()) return { ok: true, json: "" };
  try {
    // Reject unsupported YAML features upfront with a helpful message
    const unsupported = [
      { pattern: /^---/m, name: "document separators (---)" },
      { pattern: /^\s*[^#\s].*:\s*[|>]/m, name: "multi-line block scalars (| or >)" },
      { pattern: /&\w+/m, name: "anchors (&name)" },
      { pattern: /\*\w+/m, name: "aliases (*name)" },
      { pattern: /!!\w+/m, name: "type tags (!!type)" },
    ];
    for (const { pattern, name } of unsupported) {
      if (pattern.test(yamlText)) {
        return { ok: false, error: `Unsupported YAML feature: ${name}. This converter handles simple key-value objects and arrays.` };
      }
    }

    const lines = tokenizeYaml(yamlText);
    if (lines.length === 0) return { ok: true, json: "null" };

    const topIndent = lines[0]!.indent;
    const { value } = parseYamlTokens(lines, 0, topIndent);
    return { ok: true, json: JSON.stringify(value, null, 2) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// React Component
// ---------------------------------------------------------------------------

type ActiveSide = "json" | "yaml";

export default function JsonToYamlConverter() {
  const t = useTranslations("tools.json-to-yaml-converter");

  const [jsonText, setJsonText] = useState(
    '{\n  "name": "Alice",\n  "age": 30,\n  "skills": ["TypeScript", "React"],\n  "address": {\n    "city": "Tokyo",\n    "country": "Japan"\n  }\n}'
  );
  const [yamlText, setYamlText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<ActiveSide>("json");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Convert JSON → YAML when JSON changes
  useEffect(() => {
    if (activeSide !== "json") return;
    if (!jsonText.trim()) {
      setYamlText("");
      setJsonError(null);
      return;
    }
    const result = convertJsonToYaml(jsonText);
    if (result.ok) {
      setYamlText(result.yaml);
      setJsonError(null);
    } else {
      setJsonError(result.error);
      setYamlText("");
    }
  }, [jsonText, activeSide]);

  // Convert YAML → JSON when YAML changes
  useEffect(() => {
    if (activeSide !== "yaml") return;
    if (!yamlText.trim()) {
      setJsonText("");
      setYamlError(null);
      return;
    }
    const result = convertYamlToJson(yamlText);
    if (result.ok) {
      setJsonText(result.ok ? result.json : "");
      setYamlError(null);
    } else {
      setYamlError(result.error);
      setJsonText("");
    }
  }, [yamlText, activeSide]);

  // Initialize YAML from default JSON on mount
  useEffect(() => {
    const result = convertJsonToYaml(jsonText);
    if (result.ok) setYamlText(result.yaml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJsonChange = useCallback((val: string) => {
    setActiveSide("json");
    setJsonText(val);
  }, []);

  const handleYamlChange = useCallback((val: string) => {
    setActiveSide("yaml");
    setYamlText(val);
  }, []);

  const handleClear = useCallback(() => {
    setJsonText("");
    setYamlText("");
    setJsonError(null);
    setYamlError(null);
  }, []);

  const handleSwap = useCallback(() => {
    // Try to convert current YAML back to JSON
    const result = convertYamlToJson(yamlText);
    if (result.ok && result.json) {
      setActiveSide("json");
      setJsonText(result.json);
    }
  }, [yamlText]);

  const handleFormatJson = useCallback(() => {
    try {
      const parsed: unknown = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setActiveSide("json");
      setJsonText(formatted);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : String(e));
    }
  }, [jsonText]);

  async function copyJson() {
    if (!jsonText) return;
    await navigator.clipboard.writeText(jsonText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1200);
  }

  async function copyYaml() {
    if (!yamlText) return;
    await navigator.clipboard.writeText(yamlText);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 1200);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleFormatJson}
          disabled={!jsonText.trim()}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("action.formatJson")}
        </button>
        <button
          onClick={handleSwap}
          disabled={!yamlText.trim()}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("action.swap")}
        </button>
        <button
          onClick={handleClear}
          disabled={!jsonText && !yamlText}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {t("action.clear")}
        </button>
      </div>

      {/* Two-panel editor */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* JSON Panel */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">{t("label.json")}</span>
            <button
              onClick={copyJson}
              disabled={!jsonText.trim()}
              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {copiedJson ? t("action.copied") : t("action.copy")}
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={t("placeholder.json")}
            aria-label={t("label.json")}
            className={`w-full rounded border px-3 py-2 font-mono text-sm dark:bg-slate-900 ${
              jsonError
                ? "border-red-400 dark:border-red-700"
                : activeSide === "json"
                ? "border-brand-500 dark:border-brand-500"
                : "border-slate-300 dark:border-slate-700"
            }`}
          />
          {jsonError && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {t("error.invalidJson")}: {jsonError}
            </p>
          )}
        </div>

        {/* YAML Panel */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold">{t("label.yaml")}</span>
            <button
              onClick={copyYaml}
              disabled={!yamlText.trim()}
              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {copiedYaml ? t("action.copied") : t("action.copy")}
            </button>
          </div>
          <textarea
            value={yamlText}
            onChange={(e) => handleYamlChange(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={t("placeholder.yaml")}
            aria-label={t("label.yaml")}
            className={`w-full rounded border px-3 py-2 font-mono text-sm dark:bg-slate-900 ${
              yamlError
                ? "border-red-400 dark:border-red-700"
                : activeSide === "yaml"
                ? "border-brand-500 dark:border-brand-500"
                : "border-slate-300 dark:border-slate-700"
            }`}
          />
          {yamlError && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {t("error.invalidYaml")}: {yamlError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
