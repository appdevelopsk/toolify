import { describe, expect, it } from "vitest";
import { shouldLoadImpactTracking } from "./impact-policy";

describe("affiliate vendor privacy on first page load", () => {
  it("keeps normal affiliate measurement eligible on ordinary pages", () => {
    for (const href of [
      "https://toolify365.com/en",
      "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=2",
      "https://toolify365.com/en/tools/word-counter#section",
      "http://localhost:3000/en/tools/date-calculator",
    ]) {
      expect(shouldLoadImpactTracking(href)).toBe(true);
    }
  });

  it("avoids initial vendor injection when a result is embedded in a URL", () => {
    for (const href of [
      "https://toolify365.com/en/tools/word-counter#s=YWJj",
      "https://toolify365.com/ja/tools/bmi-calculator?wf=data&ws=2#s=YWJj",
      "https://toolify365.com/en/tools/bmi-calculator?s=LEGACY",
      "https://toolify365.com/en/tools/bmi-calculator?s=",
    ]) {
      expect(shouldLoadImpactTracking(href)).toBe(false);
    }
  });

  it("fails closed on malformed or unsafe URLs", () => {
    for (const href of [
      "", "/relative", "not a URL", "javascript:alert(1)", "data:text/html,test",
    ]) {
      expect(shouldLoadImpactTracking(href)).toBe(false);
    }
  });
});
