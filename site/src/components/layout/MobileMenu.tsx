"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/navigation";

/**
 * <sm 専用のハンバーガーメニュー。
 *
 * モバイルのヘッダーは「ロゴ + 検索 + ツール + プロンプト + 言語 select」で
 * 横幅を使い切っていたため、ナビと言語切替をここへ収容し、ヘッダー本体は
 * ロゴ / 検索アイコン / メニューの 3 点にする。デスクトップは従来どおり。
 */
export function MobileMenu({ showPrompts, children }: { showPrompts: boolean; children?: ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkCls =
    "block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeMenu") : t("menu")}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label={t("menu")}
          className="absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <Link href="/tools" className={linkCls}>
            {t("tools")}
          </Link>
          {showPrompts && (
            <Link href="/prompts" className={linkCls}>
              {t("prompts")}
            </Link>
          )}
          <Link href="/about" className={linkCls}>
            {t("about")}
          </Link>
          {children && <div className="mt-2 border-t border-slate-200 px-3 pt-3 dark:border-slate-800">{children}</div>}
        </nav>
      )}
    </div>
  );
}
