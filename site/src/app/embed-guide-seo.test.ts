import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { buildMetadata } from "@/lib/seo/metadata";
import { INDEXED_LOCALES, LOCALES, isIndexedLocale, type Locale } from "@/lib/i18n/locales";

const origin = "https://toolify365.com";
const guide = "/embed-guide";

describe("publisher embed guide discoverability with careful locale pruning", () => {
  it("adds exactly the English and Japanese guides to the sitemap", () => {
    const pages = sitemap().filter((entry) => entry.url.endsWith(guide));
    expect(INDEXED_LOCALES).toEqual(["en", "ja"]);
    expect(pages.map((entry) => entry.url).sort()).toEqual([
      `${origin}/en/embed-guide`,
      `${origin}/ja/embed-guide`,
    ]);
    for (const entry of pages) {
      const alternates = entry.alternates?.languages;
      expect(alternates?.en).toBe(`${origin}/en/embed-guide`);
      expect(alternates?.ja).toBe(`${origin}/ja/embed-guide`);
      expect(alternates?.["x-default"]).toBe(`${origin}/en/embed-guide`);
      expect(alternates?.fr).toBeUndefined();
    }
  });

  it("marks publisher-guide metadata indexable only for allowed locales", () => {
    for (const locale of LOCALES) {
      const metadata = buildMetadata({
        locale: locale as Locale,
        title: "Embed free calculators on your website",
        description: "Instructions, accessible iframe previews and ready-to-copy code for adding calculators to education sites.",
        path: guide,
        noindex: !isIndexedLocale(locale),
      });
      const expected = isIndexedLocale(locale);
      expect(metadata.robots).toMatchObject({ index: expected, follow: true });
      expect(metadata.alternates?.canonical).toBe(`${origin}/${locale}/embed-guide`);
      const languages = metadata.alternates?.languages as Record<string, string> | undefined;
      if (expected) {
        expect(languages?.en).toBe(`${origin}/en/embed-guide`);
        expect(languages?.ja).toBe(`${origin}/ja/embed-guide`);
      } else {
        expect(Object.keys(languages ?? {})).toHaveLength(0);
      }
    }
  });

  it("keeps the guide content distinct from calculator canonical pages", () => {
    const page = readFileSync(new URL("./[locale]/embed-guide/page.tsx", import.meta.url), "utf8");
    expect(page).toContain('path: "/embed-guide"');
    expect(page).toContain("noindex: !isIndexedLocale(locale)");
    expect(page).toContain("buildPublisherEmbedSnippet(slug, title, locale)");
    expect(page).not.toContain('noindex: false');
  });
});
