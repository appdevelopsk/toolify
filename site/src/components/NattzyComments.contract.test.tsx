import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NattzyComments } from "./NattzyComments";

const promptPath = "/prompts/blog-outline";

describe("Nattzy curated prompt discussion", () => {
  it("exposes one optional public topic link for blog-outline readers", () => {
    const html = renderToStaticMarkup(
      createElement(NattzyComments, { path: promptPath, locale: "en" }),
    );
    expect(html).toContain("nattzy.com/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149");
    expect(html).toContain("utm_source=toolify365");
    expect(html).toContain("utm_medium=editorial");
    expect(html).toContain("utm_campaign=prompt_discussion");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Compare prompt-writing techniques");
    expect(html).toContain('id="discourse-comments"');
  });

  it("does not add the link on unrelated prompt or tool pages", () => {
    for (const path of ["/prompts/email-rewriter", "/tools/word-counter", "/"]) {
      const html = renderToStaticMarkup(
        createElement(NattzyComments, { path, locale: "en" }),
      );
      expect(html).not.toContain("utm_campaign=prompt_discussion");
      expect(html).toContain('id="discourse-comments"');
    }
  });

  it("keeps localized link labels in all supported prompt locales", () => {
    const locales = [
      "en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr",
      "de", "it", "ru", "ar", "hi", "id", "th", "vi", "tr",
    ];
    for (const locale of locales) {
      const html = renderToStaticMarkup(
        createElement(NattzyComments, { path: promptPath, locale }),
      );
      expect(html).toContain("utm_campaign=prompt_discussion");
      if (locale !== "en") expect(html).not.toContain("Compare prompt-writing techniques");
    }
  });
});
