import { describe, expect, it } from "vitest";
import { sanitizePageReferrer, sanitizePageViewUrl } from "./pageview-url";

describe("privacy-safe pageview URL", () => {
  it("omits all query parameters including share state and workflow tags", () => {
    expect(sanitizePageViewUrl("https://toolify365.com/ja/tools/word-counter?wf=writing&ws=1&s=c2Vuc2l0aXZl#secret")).toEqual({
      page_path: "/ja/tools/word-counter",
      page_location: "https://toolify365.com/ja/tools/word-counter",
    });
  });

  it("retains genuine localized paths and ports", () => {
    expect(sanitizePageViewUrl("http://localhost:3000/ar/tools/date-calculator?test=yes")).toEqual({
      page_path: "/ar/tools/date-calculator",
      page_location: "http://localhost:3000/ar/tools/date-calculator",
    });
  });

  it("removes same-site share data from GA4 referrers without losing the route", () => {
    expect(sanitizePageReferrer(
      "https://toolify365.com/ja/tools/word-counter?s=private-input&wf=writing#result",
      "https://toolify365.com/ja/tools/slug-generator"
    )).toBe("https://toolify365.com/ja/tools/word-counter");
  });

  it("keeps only the external referrer origin to protect third-party paths", () => {
    expect(sanitizePageReferrer(
      "https://example.org/private/jane@example.com?token=secret#sensitive",
      "https://toolify365.com/en"
    )).toBe("https://example.org");
  });

  it("removes invalid, empty and non-web referrers", () => {
    for (const url of ["", "not a URL", "about:blank", "javascript:alert(1)", "data:text/html,payload"]) {
      expect(sanitizePageReferrer(url, "https://toolify365.com/en")).toBe("");
    }
  });

  it("does not alter encoded safe route segments", () => {
    expect(sanitizePageViewUrl("https://toolify365.com/en/tools/%63ase-converter?s=should-not-leak").page_path).toBe("/en/tools/%63ase-converter");
  });
});
