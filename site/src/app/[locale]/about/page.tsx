import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.about"), description: t("site.description"), path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      <h1>{t("nav.about")}</h1>
      <p>{t("about.intro")}</p>
      <h2>{t("about.principlesHeading")}</h2>
      <ul>
        <li>{t("about.p1")}</li>
        <li>{t("about.p2")}</li>
        <li>{t("about.p3")}</li>
        <li>{t("about.p4")}</li>
      </ul>
      <h2>{t("about.operatedHeading")}</h2>
      <p>
        {t("about.operated", {
          org: siteConfig.organization,
          email: siteConfig.contactEmail,
        })}
      </p>
    </div>
  );
}
