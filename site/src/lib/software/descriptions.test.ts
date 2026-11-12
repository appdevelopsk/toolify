import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/locales";
import { SOFTWARE_DESCRIPTIONS, softwareDescription } from "./descriptions";

const available = ["csv-cleaner-pro", "json-studio", "text-batch-studio"] as const;

describe("software descriptions", () => {
  it("covers all active locales for all currently available products", () => {
    expect([...Object.keys(SOFTWARE_DESCRIPTIONS)].sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      for (const slug of available) {
        expect(SOFTWARE_DESCRIPTIONS[locale][slug].trim().length).toBeGreaterThan(8);
      }
    }
  });

  it("uses native-language copy for available international software", () => {
    expect(softwareDescription("json-studio", "fr", "fallback")).toContain("JSON");
    expect(softwareDescription("csv-cleaner-pro", "ja", "fallback")).toContain("CSV");
    expect(softwareDescription("text-batch-studio", "ar", "fallback")).toContain("النص");
  });

  it("does not invent copy for planned products or unknown locales", () => {
    expect(softwareDescription("pdf-toolkit-pro", "de", "Original")).toBe("Original");
    expect(softwareDescription("json-studio", "unknown", "Original")).toBe("Original");
  });
});
