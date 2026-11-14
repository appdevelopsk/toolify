import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCommon, loadToolSlugMessages } from "./loader";

describe("lightweight international iframe translations", () => {
  it("keeps the valid standalone HTML shell and common-message provider", () => {
    const shell = readFileSync(new URL("../../app/embed/[locale]/layout.tsx", import.meta.url), "utf8");
    expect(shell).toContain("<html lang={locale} dir={dir}>");
    expect(shell).toContain('className="bg-transparent antialiased"');
    expect(shell).toContain("loadCommon(locale)");
    expect(shell).toContain("<NextIntlClientProvider locale={locale} messages={messages}>");
    expect(shell).not.toContain("getMessages()");
    expect(shell).not.toContain("loadMessages(locale)");
  });

  it("injects a nested provider for exactly the current tool, as regular tool pages do", () => {
    const embed = readFileSync(new URL("../../app/embed/[locale]/[slug]/page.tsx", import.meta.url), "utf8");
    const regular = readFileSync(new URL("../../app/[locale]/tools/[slug]/page.tsx", import.meta.url), "utf8");
    for (const source of [embed, regular]) {
      expect(source).toContain("loadToolSlugMessages(locale, slug)");
      expect(source).toContain("<NextIntlClientProvider messages={{ tools: { [slug]: toolMessages } }}>");
      expect(source).toContain("<Component />");
    }
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
