import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NattzyRemoteWorkLink } from "./NattzyRemoteWorkLink";

const render = (slug: string, locale: string) =>
  renderToStaticMarkup(createElement(NattzyRemoteWorkLink, { slug, locale }));

describe("timezone-specific Nattzy referral", () => {
  it("shows a single contextual source-tagged link after the tool workflow", () => {
    const html = render("timezone-converter", "en");
    expect(html).toContain("/t/working-from-home-how-do-you-stay-focused-when-nobody-is-watching/147");
    expect(html).toContain("utm_source=toolify365");
    expect(html).toContain("utm_medium=editorial");
    expect(html).toContain("utm_campaign=remote_work_timezone");
    expect(html).toContain('rel="noopener noreferrer"');
    expect((html.match(/<a\b/g) ?? []).length).toBe(1);
  });

  it("shows no link on unrelated tools", () => {
    for (const slug of ["date-calculator", "workdays-calculator", "image-resizer", ""]) {
      expect(render(slug, "en")).toBe("");
    }
  });

  it("provides language-specific labels for all 17 locales", () => {
    const locales = ["en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"];
    for (const locale of locales) {
      const html = render("timezone-converter", locale);
      expect(html).toContain("utm_campaign=remote_work_timezone");
      if (locale !== "en") expect(html).not.toContain("Working across time zones?");
    }
  });
});
