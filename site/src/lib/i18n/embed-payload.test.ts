import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCommon, loadToolSlugMessages } from "./loader";

describe("lightweight international iframe translations", () => {
  it("keeps a standalone RTL-aware HTML shell without a duplicate client messages provider", () => {
    const shell = readFileSync(new URL("../../app/embed/[locale]/layout.tsx", import.meta.url), "utf8");
    expect(shell).toContain("<html lang={locale} dir={dir}>");
    expect(shell).toContain('className="bg-transparent antialiased"');
    expect(shell).toContain("{children}");
    expect(shell).not.toContain("NextIntlClientProvider");
    expect(shell).not.toContain("loadCommon(locale)");
    expect(shell).not.toContain("getMessages()");
    expect(shell).not.toContain("loadMessages(locale)");
  });

  it("uses exactly one provider with merged common and one tool's messages", () => {
    const embed = readFileSync(new URL("../../app/embed/[locale]/[slug]/page.tsx", import.meta.url), "utf8");
    expect(embed).toContain("loadCommon(locale)");
    expect(embed).toContain("loadToolSlugMessages(locale, slug)");
    expect(embed).toContain("messages={{ ...commonMessages, tools: { [slug]: toolMessages } }}");
    expect(embed).toContain("locale={locale}");
    expect(embed).toContain("<Component />");
    expect(embed.match(/<NextIntlClientProvider/g)).toHaveLength(1);
    expect(embed).not.toContain("getMessages()");
    expect(embed).toContain('robots: { index: false, follow: true }');
    expect(embed).toContain('canonical: `${siteConfig.url}/${locale}/tools/${slug}`');
  });

  it("loads both common and correct single-tool translations in diverse locales", async () => {
    for (const locale of ["en", "ja", "fr", "ar"]) {
      const [common, workdays] = await Promise.all([
        loadCommon(locale),
        loadToolSlugMessages(locale, "workdays-calculator"),
      ]);
      expect(common.nav).toBeTruthy();
      expect(typeof workdays.title).toBe("string");
      const minimized = { ...common, tools: { "workdays-calculator": workdays } };
      expect(Object.keys(minimized.tools)).toEqual(["workdays-calculator"]);
      expect(minimized.nav).toEqual(common.nav);
      expect(minimized.tools["workdays-calculator"].title).toBe(workdays.title);
    }
  });

  it("preserves tool-specific access to user-facing locale hooks", () => {
    const base = new URL("../../tools/", import.meta.url);
    for (const slug of ["workdays-calculator", "date-calculator", "percentage-calculator", "timezone-converter"]) {
      const component = readFileSync(new URL(`${slug}/Component.tsx`, base), "utf8");
      expect(component).toContain("useTranslations");
      expect(component).toContain("useLocale");
    }
  });
});
