import { describe, expect, it } from "vitest";
import { sanitizePageViewUrl } from "./pageview-url";

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

  it("does not alter encoded safe route segments", () => {
    expect(sanitizePageViewUrl("https://toolify365.com/en/tools/%63ase-converter?s=should-not-leak").page_path).toBe("/en/tools/%63ase-converter");
  });
});
