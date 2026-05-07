"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function htmlToMarkdown(html: string): string {
  // Strip scripts/styles
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  // Headings
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
    return "\n\n" + "#".repeat(parseInt(level, 10)) + " " + inner.replace(/<[^>]+>/g, "").trim() + "\n\n";
  });
  // Bold/italic/code/strike
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*");
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  s = s.replace(/<(del|s|strike)>([\s\S]*?)<\/\1>/gi, "~~$2~~");
  // Links and images
  s = s.replace(/<img[^>]*\salt="([^"]*)"[^>]*\ssrc="([^"]*)"[^>]*>/gi, "![$1]($2)");
  s = s.replace(/<img[^>]*\ssrc="([^"]*)"[^>]*\salt="([^"]*)"[^>]*>/gi, "![$2]($1)");
  s = s.replace(/<img[^>]*\ssrc="([^"]*)"[^>]*>/gi, "![]($1)");
  s = s.replace(/<a[^>]*\shref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  // Pre code blocks
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, content) => {
    const code = content.replace(/<[^>]+>/g, "");
    return "\n\n```\n" + code.trim() + "\n```\n\n";
  });
  // Blockquote
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    return "\n\n> " + inner.replace(/<[^>]+>/g, "").trim().split("\n").join("\n> ") + "\n\n";
  });
  // Lists
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    return "\n" + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, item: string) => "- " + item.replace(/<[^>]+>/g, "").trim() + "\n") + "\n";
  });
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    let n = 1;
    return "\n" + inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, item: string) => `${n++}. ` + item.replace(/<[^>]+>/g, "").trim() + "\n") + "\n";
  });
  // Paragraphs and breaks
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  s = s.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, "");
  // Decode HTML entities
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Collapse extra whitespace
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

export default function HtmlToMarkdown() {
  const t = useTranslations("tools.html-to-markdown");
  const [input, setInput] = useState('<h1>Hello</h1>\n<p>A <strong>bold</strong> statement and <em>italic</em> text.</p>\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n<p><a href="https://tools.appdevelopsk.com">Toolify</a></p>');
  const [copied, setCopied] = useState(false);

  const md = useMemo(() => htmlToMarkdown(input), [input]);

  async function copy() {
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium">{t("input.html")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={16}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output.markdown")}</span>
          <button onClick={copy} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">{copied ? t("copied") : t("copy")}</button>
        </div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900">{md}</pre>
      </div>
    </div>
  );
}
