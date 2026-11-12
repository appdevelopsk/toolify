import { describe, expect, it } from "vitest";
import { LOCALES } from "../i18n/locales";
import { CATEGORY_LABELS, localizedCategoryLabel } from "./categoryLabels";

const categories = ["health", "math", "converter", "datetime", "text", "color", "finance", "image"] as const;

describe("global category navigation", () => {
  it("covers all active locales and every tool category", () => {
    expect([...Object.keys(CATEGORY_LABELS)].sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      const labels = CATEGORY_LABELS[locale];
      expect([...Object.keys(labels)].sort()).toEqual([...categories].sort());
      for (const category of categories) expect(labels[category].trim().length).toBeGreaterThan(1);
    }
  });

  it("has localized category names where English had leaked into UI", () => {
    expect(localizedCategoryLabel("math", "fr")).toBe("Maths et nombres");
    expect(localizedCategoryLabel("text", "ar")).toBe("النصوص والبرمجة");
    expect(localizedCategoryLabel("converter", "pt-BR")).toBe("Conversores de unidades");
  });

  it("retains English fallback for an unsupported locale", () => {
    expect(localizedCategoryLabel("health", "unknown")).toBe(CATEGORY_LABELS.en.health);
  });
});
