import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NattzyComments } from "./NattzyComments";
import { NattzyPromptDiscussion } from "./NattzyPromptDiscussion";

describe("curated Nattzy discussion link", () => {
  it("shows one safe public topic link with non-PII campaign for blog-outline", () => {
    const html = renderToStaticMarkup(
      createElement(NattzyPromptDiscussion, { slug: "blog-outline", locale: "en" }),
    );
    expect(html).toContain("nattzy.com/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149");
    expect(html).toContain("utm_source=toolify365");
    expect(html).toContain("utm_medium=editorial");
    expect(html).toContain("utm_campaign=prompt_discussion");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Compare prompt-writing techniques");
  });

  it("adds no extra CTA to unrelated prompts or tools", () => {
    for (const slug of ["email-rewriter", "word-counter", ""]) {
      expect(renderToStaticMarkup(createElement(NattzyPromptDiscussion, { slug, locale: "en" })))
        .not.toContain("nattzy.com");
    }
  });

  it("uses localized labels across all 17 supported prompt languages", () => {
    const locales = ["en", "ja", "zh-CN", "zh-TW", "ko", "es", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id", "th", "vi", "tr"];
    for (const locale of locales) {
      const html = renderToStaticMarkup(
        createElement(NattzyPromptDiscussion, { slug: "blog-outline", locale }),
      );
      expect(html).toContain("utm_campaign=prompt_discussion");
      if (locale !== "en") expect(html).not.toContain("Compare prompt-writing techniques");
    }
  });

  it("preserves comments embed without duplicate CTA", () => {
    const html = renderToStaticMarkup(
      createElement(NattzyComments, { path: "/prompts/blog-outline", locale: "en" }),
    );
    expect(html).toContain('id="discourse-comments"');
    expect(html).not.toContain("utm_campaign=prompt_discussion");
  });
});
