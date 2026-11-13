import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/locales";
import { SEARCH_RECOVERY_COPY, searchRecoveryCopyFor } from "./searchRecoveryCopy";
import { readFileSync } from "node:fs";

describe("international search recovery copy", () => {
  it("covers all 17 active locales with meaningful retry instructions", () => {
    expect(Object.keys(SEARCH_RECOVERY_COPY).sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      const copy = searchRecoveryCopyFor(locale);
      expect(copy.message.trim().length).toBeGreaterThan(15);
      expect(copy.retry.trim().length).toBeGreaterThan(1);
    }
  });
  it("keeps localized messages for Arabic, French, and Japanese", () => {
    expect(searchRecoveryCopyFor("ar").retry).toBe("إعادة المحاولة");
    expect(searchRecoveryCopyFor("fr").retry).toBe("Réessayer");
    expect(searchRecoveryCopyFor("ja").retry).toBe("再試行");
  });
  it("falls back to English only for unknown locale", () => {
    expect(searchRecoveryCopyFor("missing")).toEqual(SEARCH_RECOVERY_COPY.en);
  });
  it("shows a genuine retry control without falsely reporting empty matches", () => {
    const source = readFileSync(new URL("../../components/layout/HeaderSearch.tsx", import.meta.url), "utf8");
    expect(source).toContain("useSearchIndexStatus(");
    expect(source).toContain("searchUnavailable ? (");
    expect(source).toContain("onClick={retrySearch}");
    expect(source).toContain('useDebouncedSearchEvent(query, hits.length, locale, "header", index !== null)');
    expect(source.indexOf("searchUnavailable ? (")).toBeLessThan(source.indexOf('t("searchNoResults")'));
  });
});
