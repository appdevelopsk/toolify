"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(s: string): string {
  // Order matters: code first, then bold/italic/links
  s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/_([^_]+)_/g, "<em>$1</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let para: string[] = [];

  function flushPara() {
    if (para.length === 0) return;
    out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  }
  function flushList() {
    if (!listType) return;
    out.push(`</${listType}>`);
    listType = null;
  }

  while (i < lines.length) {
    const line = lines[i]!;

    if (inCode) {
      if (line.trim() === "```") {
        out.push(`<pre><code${codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ""}>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        codeLang = "";
        inCode = false;
      } else {
        codeBuf.push(line);
      }
      i++;
      continue;
    }

    const fenceMatch = /^```(\w*)\s*$/.exec(line);
    if (fenceMatch) {
      flushPara();
      flushList();
      inCode = true;
      codeLang = fenceMatch[1] ?? "";
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      const lvl = heading[1]!.length;
      out.push(`<h${lvl}>${inline(heading[2]!)}</h${lvl}>`);
      i++;
      continue;
    }

    const hr = /^[-*_]{3,}\s*$/.exec(line);
    if (hr) {
      flushPara();
      flushList();
      out.push("<hr>");
      i++;
      continue;
    }

    const bq = /^>\s?(.*)$/.exec(line);
    if (bq) {
      flushPara();
      flushList();
      out.push(`<blockquote><p>${inline(bq[1]!)}</p></blockquote>`);
      i++;
      continue;
    }

    const ul = /^[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (listType !== "ul") {
        flushList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1]!)}</li>`);
      i++;
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (listType !== "ol") {
        flushList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1]!)}</li>`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
    i++;
  }
  flushPara();
  flushList();
  return out.join("\n");
}

export default function MarkdownToHtml() {
  const t = useTranslations("tools.markdown-to-html");
  const [input, setInput] = useState("# Hello\n\nA **bold** statement and *italic* text.\n\n- Item 1\n- Item 2\n\n[Toolify](https://tools.appdevelopsk.com)");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => mdToHtml(input), [input]);

  async function copy() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium">{t("input.markdown")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={16}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output.html")}</span>
          <button onClick={copy} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">{copied ? t("copied") : t("copy")}</button>
        </div>
        <pre className="max-h-96 overflow-auto rounded border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900">{html}</pre>
        <details>
          <summary className="cursor-pointer text-sm">{t("preview")}</summary>
          <div className="prose prose-slate mt-2 max-w-none rounded border border-slate-200 p-3 dark:prose-invert dark:border-slate-800" dangerouslySetInnerHTML={{ __html: html }} />
        </details>
      </div>
    </div>
  );
}
