"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  /** Canonical, absolute URL of the tool page (built server-side from siteConfig). */
  url: string;
  /** Absolute URL of the embeddable widget route. */
  embedUrl: string;
  /** Localized tool title, used as share text and iframe title. */
  title: string;
}

const ICON = "h-4 w-4";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}
function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
      <path d="M24 10.3C24 4.94 18.63.57 12 .57S0 4.94 0 10.3c0 4.8 4.26 8.82 10.02 9.58.39.08.92.26 1.05.6.12.3.08.78.04 1.09l-.17 1.02c-.05.3-.24 1.18 1.03.64 1.27-.54 6.86-4.04 9.36-6.92C22.99 14.42 24 12.5 24 10.3zM7.77 13.4H5.39a.63.63 0 0 1-.63-.63V8.02a.63.63 0 0 1 1.26 0v4.12h1.75a.63.63 0 0 1 0 1.26zm2.46-.63a.63.63 0 0 1-1.26 0V8.02a.63.63 0 0 1 1.26 0zm5.74 0a.63.63 0 0 1-.43.6.63.63 0 0 1-.73-.23l-2.43-3.31v2.94a.63.63 0 0 1-1.26 0V8.02a.63.63 0 0 1 .43-.6.63.63 0 0 1 .73.23l2.44 3.31V8.02a.63.63 0 0 1 1.26 0zm4-2.38a.63.63 0 0 1 0 1.26h-1.75v1.12h1.75a.63.63 0 0 1 0 1.26h-2.38a.63.63 0 0 1-.63-.63V8.02a.63.63 0 0 1 .63-.63h2.38a.63.63 0 0 1 0 1.26h-1.75v1.11z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 0 0 1.51 5.26l-.999 3.648zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
      <path d="M24 11.78c0-1.45-1.18-2.63-2.63-2.63-.7 0-1.34.28-1.81.73-1.78-1.27-4.22-2.09-6.93-2.19l1.18-5.55 3.86.82a1.88 1.88 0 1 0 .19-.9l-4.31-.91a.44.44 0 0 0-.52.34l-1.32 6.2c-2.74.09-5.21.92-7.01 2.2a2.62 2.62 0 0 0-1.81-.73A2.63 2.63 0 0 0 0 11.78c0 1.04.6 1.93 1.49 2.36-.04.27-.06.54-.06.82 0 4.14 4.82 7.49 10.77 7.49s10.77-3.35 10.77-7.49c0-.27-.02-.54-.06-.81.89-.43 1.49-1.32 1.49-2.37zM6.21 13.7c0-1.04.84-1.88 1.88-1.88s1.88.84 1.88 1.88-.84 1.88-1.88 1.88-1.88-.84-1.88-1.88zm10.59 5.01c-1.29 1.29-3.76 1.39-4.48 1.39s-3.19-.1-4.48-1.39a.49.49 0 0 1 .69-.69c.81.81 2.55.99 3.79.99s2.97-.18 3.79-.99a.49.49 0 0 1 .69 0c.18.18.18.5-.01.69zm-.29-3.13c-1.04 0-1.88-.84-1.88-1.88s.84-1.88 1.88-1.88 1.88.84 1.88 1.88-.84 1.88-1.88 1.88z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

const btn =
  "inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 transition-colors hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";

export function ShareBar({ url, embedUrl, title }: Props) {
  const t = useTranslations("tool");
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const enc = encodeURIComponent;
  // 埋め込みコードには iframe に加えて「ホストページ側の dofollow 被リンク」を必ず付ける。
  // iframe 内の "Powered by" は toolify 自身のドキュメント内に閉じており被リンク価値が渡らないため、
  // 埋め込んだ他サイトの HTML に、ツール名をアンカーテキストにした当該ツールページへの直リンクを置く。
  // これが量産ツール(222本)を被リンク資産に変える肝（toolify は権威性不足で平均48位＝page5のため）。
  const safeTitle = title.replace(/"/g, "&quot;");
  const anchorTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const snippet = `<iframe src="${embedUrl}" width="100%" height="520" style="border:1px solid #e2e8f0;border-radius:12px" loading="lazy" title="${safeTitle}"></iframe>\n<p style="font:13px/1.6 system-ui,-apple-system,sans-serif;text-align:center;margin:6px 0;color:#64748b">Free <a href="${url}" target="_blank" rel="noopener">${anchorTitle}</a> by <a href="https://toolify365.com" target="_blank" rel="noopener">toolify365</a></p>`;

  const socials = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, Icon: XIcon },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: FacebookIcon },
    { name: "LINE", href: `https://social-plugins.line.me/lineit/share?url=${enc(url)}`, Icon: LineIcon },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${enc(`${title} ${url}`)}`, Icon: WhatsAppIcon },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`, Icon: RedditIcon },
  ];

  async function copy(text: string, mark: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      mark(true);
      setTimeout(() => mark(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through */
      }
    }
    copy(url, setLinkCopied);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={nativeShare} className={btn} aria-label={t("share")}>
        <ShareIcon />
        <span>{t("share")}</span>
      </button>

      <button type="button" onClick={() => copy(url, setLinkCopied)} className={btn}>
        <LinkIcon />
        <span>{linkCopied ? t("copied") : t("copy")}</span>
      </button>

      {socials.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label={`${t("share")}: ${name}`}
          title={name}
        >
          <Icon />
        </a>
      ))}

      <button
        type="button"
        onClick={() => setShowEmbed((v) => !v)}
        className={btn}
        aria-expanded={showEmbed}
      >
        <CodeIcon />
        <span>{t("embed")}</span>
      </button>

      {showEmbed && (
        <div className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <textarea
            readOnly
            value={snippet}
            onFocus={(e) => e.currentTarget.select()}
            rows={3}
            className="w-full resize-none rounded border border-slate-300 bg-white p-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          />
          <button type="button" onClick={() => copy(snippet, setCodeCopied)} className={`${btn} mt-2`}>
            <LinkIcon />
            <span>{codeCopied ? t("copied") : t("copy")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
