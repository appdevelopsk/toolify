import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { siteConfig } from "@/lib/config";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 text-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-bold">{t("site.name")}</div>
          <p className="mt-2 text-slate-500">{t("site.tagline")}</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/tools" className="hover:underline">
            {t("nav.tools")}
          </Link>
          <Link href="/prompts" className="hover:underline">
            {t("nav.prompts")}
          </Link>
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
        <div className="text-xs text-slate-500">
          <div>
            © {year} {siteConfig.organization}.
          </div>
          <div>{t("footer.rights")}</div>
        </div>
      </div>
    </footer>
  );
}
