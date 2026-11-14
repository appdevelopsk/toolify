import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES, isIndexedLocale } from "@/lib/i18n/locales";
import { embedGuideCopyFor } from "./embed-guide-copy";

describe("publisher widget kit discoverability from international homepage", () => {
  const home = readFileSync(new URL("../../app/[locale]/page.tsx", import.meta.url), "utf8");
  const guide = readFileSync(new URL("../../app/[locale]/embed-guide/page.tsx", import.meta.url), "utf8");

  it("links visitors to the existing localized guide, without additional client-side scripts", () => {
    expect(home).toContain('import { embedGuideCopyFor } from "@/lib/widgets/embed-guide-copy"');
    expect(home).toContain("embedGuideCopyFor(locale)");
    expect(home).toContain('id="publisher-embed"');
    expect(home).toContain('href="/embed-guide"');
    expect(home).toContain("publisherGuide.heading");
    expect(home).toContain("publisherGuide.intro");
    expect(home).toContain("publisherGuide.installHeading");
    expect(home).toContain("prefetch={false}");
    expect(home.indexOf('id="publisher-embed"')).toBeGreaterThan(home.indexOf('home.byCategory'));
    expect(home.indexOf('id="publisher-embed"')).toBeLessThan(home.indexOf("Software product discovery"));
  });

  it("uses meaningful native-language publisher copy in all 17 locales", () => {
    expect(LOCALES).toHaveLength(17);
    for (const locale of LOCALES) {
      const copy = embedGuideCopyFor(locale);
      expect(copy.heading.trim().length).toBeGreaterThan(5);
      expect(copy.intro.trim().length).toBeGreaterThan(15);
      expect(copy.installHeading.trim().length).toBeGreaterThan(3);
    }
    expect(embedGuideCopyFor("ar").heading).toContain("حاسبات");
    expect(embedGuideCopyFor("ja").heading).toContain("サイト");
  });

  it("preserves the existing en/ja-only guide indexing policy", () => {
    expect(guide).toContain("noindex: !isIndexedLocale(locale)");
    expect(isIndexedLocale("en")).toBe(true);
    expect(isIndexedLocale("ja")).toBe(true);
    for (const locale of LOCALES.filter((l) => l !== "en" && l !== "ja")) {
      expect(isIndexedLocale(locale)).toBe(false);
    }
  });
});
