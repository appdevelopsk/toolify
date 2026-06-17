import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { isPromptLocale } from "@/lib/i18n/locales";
import { NewsletterForm } from "@/components/cross/NewsletterForm";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const showPrompts = isPromptLocale(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 text-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto mb-8 max-w-6xl px-4">
        <NewsletterForm source="toolify" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-bold">{t("site.name")}</div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{t("site.tagline")}</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/tools" className="hover:underline">
            {t("nav.tools")}
          </Link>
          <Link href="/pregnancy" className="hover:underline">
            {t("nav.pregnancy")}
          </Link>
          {showPrompts && (
            <Link href="/prompts" className="hover:underline">
              {t("nav.prompts")}
            </Link>
          )}
          <Link href="/about" className="hover:underline">
            {t("nav.about")}
          </Link>
          <Link href="/contact" className="hover:underline">
            {t("nav.contact")}
          </Link>
        </nav>
        <nav className="flex flex-col gap-2">
          <Link href="/privacy" className="hover:underline">
            {t("nav.privacy")}
          </Link>
          <Link href="/terms" className="hover:underline">
            {t("nav.terms")}
          </Link>
          <Link href="/disclosure" className="hover:underline">
            {t("affiliate.footerLink")}
          </Link>
        </nav>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <div>
            © {year} {siteConfig.organization}.
          </div>
          <div>{t("footer.rights")}</div>
        </div>
      </div>

      {/* 関連サイト（クロスプロモ・統合集客） */}
      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-200 px-4 pt-6 dark:border-slate-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("crossPromo.title")}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
          <a href="https://pickly.blog" className="group">
            <span className="font-bold text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-200">
              Pickly
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {t("crossPromo.pickly")}
            </span>
          </a>
          <a href="https://fxea365.com" className="group">
            <span className="font-bold text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-200">
              FXEA365
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {t("crossPromo.fxea")}
            </span>
          </a>
          <a href="https://nattzy.com" className="group">
            <span className="font-bold text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-200">
              nattzy
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {t("crossPromo.nattzy")}
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
