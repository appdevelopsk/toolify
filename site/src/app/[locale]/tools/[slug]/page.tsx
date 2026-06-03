import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getTool, getRelated, listTools, isIndexable } from "@/lib/tools/registry";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  softwareAppJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  howToJsonLd,
} from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    listTools().map((t) => ({ locale, slug: t.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: `tools.${slug}` });
  return buildMetadata({
    locale: locale as Locale,
    title: t("title"),
    description: t("metaDescription"),
    path: `/tools/${slug}`,
    keywords: t.raw("keywords") as string[],
    type: "article",
    modifiedTime: tool.updatedAt,
    noindex: !isIndexable(slug), // 剪定済みツールは index させない（docs/ADSENSE_RECOVERY_PLAN.md フェーズ2）
  });
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tool = getTool(slug);
  if (!tool) notFound();

  const t = await getTranslations();
  const tt = await getTranslations(`tools.${slug}`);
  const related = getRelated(slug, 6);
  const url = `${siteConfig.url}/${locale}/tools/${slug}`;

  const faq = (tt.raw("faq") as { q: string; a: string }[]) ?? [];
  const article = tt.raw("article") as {
    sections: { heading: string; paragraphs: string[] }[];
    howTo?: { name: string; text: string }[];
  };

  const ld: object[] = [
    softwareAppJsonLd({
      name: tt("title"),
      description: tt("metaDescription"),
      url,
      applicationCategory: tool.applicationCategory,
      inLanguage: locale,
      dateModified: tool.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: t("nav.home"), url: `${siteConfig.url}/${locale}` },
      { name: t("nav.tools"), url: `${siteConfig.url}/${locale}/tools` },
      { name: tt("title"), url },
    ]),
  ];
  if (tool.hasFaq && faq.length > 0) ld.push(faqJsonLd(faq, locale));
  if (tool.hasHowTo && article.howTo?.length) ld.push(howToJsonLd({ name: tt("title"), steps: article.howTo, inLanguage: locale }));

  const { default: Component } = await import(`@/tools/${slug}/Component`);

  return (
    <>
      <ToolFrame
        meta={tool}
        title={tt("title")}
        description={tt("description")}
        related={related}
        article={
          <>
            {article.sections.map((s, i) => (
              <section key={i}>
                <h3>{s.heading}</h3>
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
          </>
        }
        faq={faq}
      >
        <Component />
      </ToolFrame>
      <JsonLd data={ld} />
    </>
  );
}
