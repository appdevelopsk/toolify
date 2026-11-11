import { describe, expect, it } from "vitest";
import { CORE_TOOLS_BY_DEMAND, listByCategory, isIndexableIn } from "./registry";
import { orderCategoryToolsForLocale } from "./category-order";
import type { ToolCategory } from "./types";

describe("category discovery prioritizes genuinely indexable demand", () => {
  for (const locale of ["en", "ja", "es"]) {
    it(`keeps all tools and moves locale-indexed tools first in ${locale}`, () => {
      for (const cat of ["date", "text", "math", "finance", "health", "conversion", "color", "image"] as ToolCategory[]) {
        const original = listByCategory(cat);
        const ordered = orderCategoryToolsForLocale(original, locale);
        expect(ordered.map(x => x.slug).sort()).toEqual(original.map(x => x.slug).sort());
        let seenNonIndexed = false;
        for (const tool of ordered) {
          if (!isIndexableIn(locale, tool.slug)) seenNonIndexed = true;
          else expect(seenNonIndexed, `${locale} ${cat}: indexed tool ${tool.slug} was buried`).toBe(false);
        }
      }
    });
  }
  it("orders the existing date tools by measured core demand", () => {
    const original = listByCategory("date");
    const ordered = orderCategoryToolsForLocale(original, "en");
    const core = ordered.filter(t => CORE_TOOLS_BY_DEMAND.includes(t.slug as typeof CORE_TOOLS_BY_DEMAND[number]));
    const ranks = core.map(t => CORE_TOOLS_BY_DEMAND.indexOf(t.slug as typeof CORE_TOOLS_BY_DEMAND[number]));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
  it("never mutates the passed-in registry array", () => {
    const original = listByCategory("date");
    const before = original.map(t => t.slug);
    orderCategoryToolsForLocale(original, "en");
    expect(original.map(t => t.slug)).toEqual(before);
  });
});
