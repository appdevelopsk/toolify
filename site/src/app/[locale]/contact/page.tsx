import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.contact"), description: t("site.description"), path: "/contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale === "ja";
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      <h1>{isJa ? "お問い合わせ" : "Contact"}</h1>
      <p>
        {isJa
          ? "ご意見・ご要望・不具合報告は以下までお寄せください。原則3営業日以内にご返信いたします。"
          : "Please send feedback, requests, or bug reports to the address below. We aim to reply within three business days."}
      </p>
      <p>
        <strong>{siteConfig.organization}</strong>
        <br />
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </div>
  );
}
