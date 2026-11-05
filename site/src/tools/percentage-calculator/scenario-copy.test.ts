import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { resumeCopy, scenarioCopy } from "./scenario-copy";

describe("scenario action localization", () => {
  it.each(LOCALES)("provides every action label in %s", (locale) => {
    const compare = scenarioCopy(locale);
    const resume = resumeCopy(locale);
    expect(Object.values(compare)).toHaveLength(5);
    expect(Object.values(resume)).toHaveLength(4);
    for (const label of [...Object.values(compare), ...Object.values(resume)]) {
      expect(typeof label).toBe("string");
      expect(label.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses English for unknown locales", () => {
    expect(scenarioCopy("unknown")).toEqual(scenarioCopy("en"));
    expect(resumeCopy("unknown")).toEqual(resumeCopy("en"));
  });
});
