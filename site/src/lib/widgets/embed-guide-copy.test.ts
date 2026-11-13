import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { EMBED_GUIDE_COPY, embedGuideCopyFor } from "./embed-guide-copy";
import { buildPublisherEmbedSnippet, FEATURED_EMBED_SLUGS } from "./embed-guide";

describe("native-language widget publishing guide", () => {
  it("covers all active 17 languages without empty installation instructions", () => {
    expect(Object.keys(EMBED_GUIDE_COPY).sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      const c = embedGuideCopyFor(locale);
      expect(c.metaTitle.trim().length).toBeGreaterThan(5);
      expect(c.metaDescription.trim().length).toBeGreaterThan(15);
      expect(c.heading.trim().length).toBeGreaterThan(5);
      expect(c.intro.trim().length).toBeGreaterThan(20);
      expect(c.steps).toHaveLength(3);
      for (const step of c.steps) expect(step.trim().length).toBeGreaterThan(10);
      expect(c.notesBody.trim().length).toBeGreaterThan(20);
    }
  });

  it("provides native instructions to Spanish, French, Arabic and Thai publishers", () => {
    expect(embedGuideCopyFor("es").installHeading).toBe("Cómo instalar");
    expect(embedGuideCopyFor("fr").installHeading).toBe("Installation");
    expect(embedGuideCopyFor("ar").installHeading).toBe("طريقة التثبيت");
    expect(embedGuideCopyFor("th").installHeading).toBe("วิธีติดตั้ง");
    expect(embedGuideCopyFor("unknown")).toEqual(EMBED_GUIDE_COPY.en);
  });

  it("retains indexed tool SEO policy but does not index an installation helper", () => {
    const page = readFileSync(new URL("../../app/[locale]/embed-guide/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("embedGuideCopyFor(locale)");
    expect(page).toContain("buildPublisherEmbedSnippet(slug, title, locale)");
    expect(page).toContain('noindex: true');
    expect(page).not.toContain('const language = locale === "ja" ? "ja" : "en"');
    expect(page).toContain('dir="ltr"');
  });

  it("links original localized widgets and avoids distributing followed ranking-credit links", () => {
    for (const locale of LOCALES) {
      for (const slug of FEATURED_EMBED_SLUGS) {
        const html = buildPublisherEmbedSnippet(slug, '<Example & Tool>', locale);
        expect(html).toContain(`/embed/${locale}/${slug}`);
        expect(html).toContain(`/${locale}/tools/${slug}`);
        expect(html).toContain('rel="nofollow noopener noreferrer"');
        expect(html).toContain("&lt;Example &amp; Tool&gt;");
        expect(html).not.toContain("utm_");
      }
    }
  });
  it("lets publishers copy a localized snippet with one click and tracks success only", () => {
    const page = readFileSync(new URL("../../app/[locale]/embed-guide/page.tsx", import.meta.url), "utf8");
    const button = readFileSync(new URL("../../components/tools/CopyEmbedSnippet.tsx", import.meta.url), "utf8");
    expect(page).toContain("<CopyEmbedSnippet snippet={snippet} slug={slug} />");
    expect(button).toContain("const success = await copyText(snippet)");
    expect(button).toContain('if (success) copyResult("embed")');
    expect(button).toContain('t("copied") : t("copy")');
  });

  it("offers the publisher guide from every tool in the visitor's own language", () => {
    const shareBar = readFileSync(new URL("../../components/tools/ShareBar.tsx", import.meta.url), "utf8");
    expect(shareBar).toContain('href="/embed-guide"');
    expect(shareBar).toContain('t("embed")');
    expect(shareBar).toContain('t("howItWorks")');
    expect(shareBar).not.toContain('locale === "ja" ?');
  });

});
