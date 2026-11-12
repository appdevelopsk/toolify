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

  it("localizes French labels and keeps English fallback", () => {
    for (const category of categories) {
      expect(categoryLabel(category, "en")).toBe(CATEGORY_CONFIG[category].label);
      expect(categoryLabel(category, "fr").length).toBeGreaterThan(1);
      expect(categoryLabel(category, "unknown")).toBe(CATEGORY_CONFIG[category].label);
    }
    expect(categoryLabel("health", "fr")).toBe("Santé et forme");
  });

  it("covers every registered category", () => {
    expect(categories).toHaveLength(8);
  });
});
