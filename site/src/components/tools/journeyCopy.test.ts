import { describe, expect, it } from "vitest";
import { LOCALES } from "../../lib/i18n/locales";
import { JOURNEY_COPY, journeyCopyFor } from "./journeyCopy";

const REQUIRED_KEYS = [
  "heading", "intro", "cta",
  "deadlineTitle", "deadlineDescription",
  "writingTitle", "writingDescription",
  "dataTitle", "dataDescription",
  "designTitle", "designDescription",
] as const;

describe("localized tool journeys", () => {
  it("covers every active site locale without introducing unsupported locales", () => {
    expect([...Object.keys(JOURNEY_COPY)].sort()).toEqual([...LOCALES].sort());
  });

  it.each(LOCALES)("has complete, readable copy for %s", (locale) => {
    const copy = journeyCopyFor(locale);
    for (const key of REQUIRED_KEYS) {
      expect(copy[key].trim().length).toBeGreaterThan(3);
    }
  });

  it("keeps the two existing languages and falls back safely", () => {
    expect(journeyCopyFor("ja").heading).toBe("目的からツールを探す");
    expect(journeyCopyFor("en").heading).toBe("Start with what you want to do");
    expect(journeyCopyFor("unknown")).toEqual(JOURNEY_COPY.en);
  });

  it("provides native-language journey headings in representative locales", () => {
    expect(journeyCopyFor("es").heading).toContain("Empieza");
    expect(journeyCopyFor("ar").heading).toContain("ابدأ");
    expect(journeyCopyFor("pt-BR").heading).toContain("Comece");
  });
});
