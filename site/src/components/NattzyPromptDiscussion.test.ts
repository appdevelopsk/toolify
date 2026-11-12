import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NattzyPromptDiscussion } from "./NattzyPromptDiscussion";

const renderDiscussion = (slug: string, locale = "en") =>
  renderToStaticMarkup(
    createElement(NattzyPromptDiscussion, { slug, locale }),
  );

describe("Nattzy contextual cross-property discovery", () => {
  it("preserves the existing blog outline discussion CTA", () => {
    const html = renderDiscussion("blog-outline");
    expect(html).toContain("/t/how-do-you-write-prompts-that-stop-ai-chatbots-from-giving-generic-empty-answers/149");
    expect(html).toContain("utm_campaign=prompt_discussion");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it.each(["code-review", "research-summary"])(
    "points the relevant %s prompt to the published clinic",
    (slug) => {
      const html = renderDiscussion(slug, "ja");
      expect(html).toContain("/t/prompt-clinic-turn-a-vague-ai-answer-into-an-actionable-plan/1958");
      expect(html).toContain("utm_source=toolify365");
      expect(html).toContain("utm_medium=editorial");
      expect(html).toContain("utm_content=" + slug);
      expect(html).toContain("Nattzyでプロンプトの改善方法を議論する");
    },
  );

  it("does not show a forum CTA on unrelated or malformed slugs", () => {
    for (const slug of ["email-rewriter", "word-counter", "__proto__", ""]) {
      expect(renderDiscussion(slug)).not.toContain("nattzy.com");
    }
  });

  it("uses only curated first-party URLs without personal query strings", () => {
    for (const slug of ["blog-outline", "code-review", "research-summary"]) {
      const html = renderDiscussion(slug);
      expect(html).toContain("https://nattzy.com/t/");
      expect(html).not.toContain("access_token");
      expect(html).not.toContain("user_id");
      expect(html).not.toContain("email=");
    }
  });
});
