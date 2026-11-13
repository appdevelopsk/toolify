import { describe, expect, it } from "vitest";
import { buildPublisherEmbedSnippet, escapeEmbedAttribute, FEATURED_EMBED_SLUGS } from "./embed-guide";
import { LOCALES } from "@/lib/i18n/locales";

describe("share-safe international widget installation snippets", () => {
  it("curates four unique registered tool slugs", () => {
    expect(FEATURED_EMBED_SLUGS).toHaveLength(4);
    expect(new Set(FEATURED_EMBED_SLUGS).size).toBe(4);
  });
  it("includes lazy localized widgets and a visible canonical tool link in all 17 languages", () => {
    for (const locale of LOCALES) {
      for (const slug of FEATURED_EMBED_SLUGS) {
        const result = buildPublisherEmbedSnippet(slug, "A useful tool", locale);
        expect(result).toContain(`/embed/${locale}/${slug}`);
        expect(result).toContain(`/tools/${slug}`);
        expect(result).toContain('loading="lazy"');
        expect(result).toContain('target="_blank" rel="nofollow noopener noreferrer"');
        expect(result).not.toContain("utm_");
        expect(result).toContain(`/${locale}/tools/${slug}`);
        expect(result).not.toContain('rel="noopener noreferrer"');
      }
    }
  });
  it("escapes HTML entities in localized display titles", () => {
    const result = buildPublisherEmbedSnippet("workdays-calculator", '<Work & "Hours">', "en");
    expect(result).toContain("&lt;Work &amp; &quot;Hours&quot;&gt;");
    expect(result).not.toContain('<Work & "Hours">');
    expect(escapeEmbedAttribute("A'B")).toBe("A&#39;B");
  });
  it("rejects unregistered slugs and unsupported locales", () => {
    expect(() => buildPublisherEmbedSnippet("any-route", "Title", "en")).toThrow();
    expect(() => buildPublisherEmbedSnippet("workdays-calculator", "Title", "zz")).toThrow();
  });
});