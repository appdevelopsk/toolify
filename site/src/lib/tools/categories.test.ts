import { describe, expect, it } from "vitest";
import { CATEGORY_CONFIG, categoryLabel } from "./categories";

describe("localized SEO breadcrumb category labels", () => {
  const categories = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>;

  it("uses Japanese labels on Japanese tool pages", () => {
    for (const category of categories) {
      const label = categoryLabel(category, "ja");
      expect(label).not.toBe(CATEGORY_CONFIG[category].label);
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("keeps English labels for English and other locales", () => {
    for (const category of categories) {
      expect(categoryLabel(category, "en")).toBe(CATEGORY_CONFIG[category].label);
      expect(categoryLabel(category, "fr")).toBe(CATEGORY_CONFIG[category].label);
    }
  });

  it("covers every registered category", () => {
    expect(categories).toHaveLength(8);
  });
});
