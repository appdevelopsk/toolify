import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPrompt, getRelatedPrompts, listPrompts } from "@/lib/prompts/registry";
import { RELATED_TOOLS } from "@/lib/prompts/related-tools";
import { getTool } from "@/lib/tools/registry";
import { PromptFrame } from "@/components/prompts/PromptFrame";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { LOCALES, PROMPT_LOCALES, isPromptLocale, type Locale } from "@/lib/i18n/locales";

export function generateStaticParams() {
  return PROMPT_LOCALES.flatMap((locale) =>
    listPrompts().map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPromptLocale(locale)) return {};
  const p = getPrompt(slug);
  if (!p) return {};
  const t = await getTranslations({ locale, namespace: `prompts.${slug}` });
  return buildMetadata({
    locale: locale as Locale,
    title: t.raw("title") as string,
    description: t.raw("metaDescription") as string,
    path: `/prompts/${slug}`,
    keywords: t.raw("keywords") as string[],
    type: "article",
    modifiedTime: p.meta.updatedAt,
  });
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isPromptLocale(locale)) notFound();
  setRequestLocale(locale);
  const p = getPrompt(slug);
  if (!p) notFound();

  const t = await getTranslations();
  const tt = await getTranslations(`prompts.${slug}`);
  const related = getRelatedPrompts(slug, 4);
  const url = `${siteConfig.url}/${locale}/prompts/${slug}`;

  // Curated cross-link to calculators the same audience uses.
  // Each tool's title is read from its own messages namespace via t.raw().
  const relatedToolSlugs = (RELATED_TOOLS[p.meta.category] ?? []).filter((s) => Boolean(getTool(s)));
  const relatedTools = relatedToolSlugs.map((s) => ({
    slug: s,
    title: t.raw(`tools.${s}.title`) as string,
  }));

  // Use raw() everywhere — these strings contain {placeholders} that next-intl
  // would otherwise try to parse as ICU MessageFormat arguments and fail.
  const title = tt.raw("title") as string;
  const description = tt.raw("description") as string;
  const metaDescription = tt.raw("metaDescription") as string;
  const promptText = tt.raw("promptText") as string;
  const exampleHeading = tt.has("exampleHeading") ? (tt.raw("exampleHeading") as string) : undefined;
  const exampleOutput = tt.has("exampleOutput") ? (tt.raw("exampleOutput") as string) : undefined;
  const faq = (tt.raw("faq") as { q: string; a: string }[]) ?? [];
  const useCase = tt.raw("useCase") as { headline: string; items: string[] } | undefined;
  const modelTipsRaw = tt.raw("modelTips") as Record<string, string> | undefined;
  const article = tt.raw("article") as
    | { sections: { heading: string; paragraphs: string[] }[] }
    | undefined;

  const ld: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: metaDescription,
      url,
      inLanguage: locale,
      datePublished: p.meta.updatedAt,
      dateModified: p.meta.updatedAt,
      author: { "@type": "Organization", name: siteConfig.name },
    },
    breadcrumbJsonLd([
      { name: t("nav.home"), url: `${siteConfig.url}/${locale}` },
      { name: t("nav.prompts"), url: `${siteConfig.url}/${locale}/prompts` },
      { name: title, url },
    ]),
  ];
  if (faq.length > 0) ld.push(faqJsonLd(faq, locale));

  return (
    <>
      <PromptFrame
        meta={p.meta}
        title={title}
        description={description}
        promptText={promptText}
        useCase={useCase}
        modelTips={modelTipsRaw}
        exampleHeading={exampleHeading}
        exampleOutput={exampleOutput}
        article={article}
        faq={faq}
        related={related}
        relatedTools={relatedTools}
      />
      <JsonLd data={ld} />
    </>
  );
}
