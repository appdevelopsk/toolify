import { describe, expect, it } from "vitest";
import { SOFTWARE_RECOMMENDATIONS, availableRecommendations } from "@/lib/software/recommendations";
import { AVAILABLE_SOFTWARE } from "@/lib/software/catalog";
import { INDEXED_SLUGS, getTool } from "@/lib/tools/registry";

describe("tool -> available software recommendations", () => {
  it("points only to products currently available", () => {
    const available = new Set<string>(AVAILABLE_SOFTWARE.map((product) => product.slug));
    for (const [tool, recommendations] of Object.entries(SOFTWARE_RECOMMENDATIONS)) {
      expect(getTool(tool), `Unknown tool: ${tool}`).toBeDefined();
      expect(recommendations.length, tool).toBeGreaterThan(0);
      expect(new Set(recommendations).size, tool).toBe(recommendations.length);
      for (const slug of recommendations) expect(available.has(slug), `${tool} -> ${slug}`).toBe(true);
    }
  });

  it("returns an empty list for tools without recommendations", () => {
    expect(availableRecommendations("nonexistent-tool")).toEqual([]);
  });

  it("includes at least one already-indexable tool page", () => {
    const indexedMatches = Object.keys(SOFTWARE_RECOMMENDATIONS).filter((slug) => INDEXED_SLUGS.has(slug));
    expect(indexedMatches).toContain("reverse-text-generator");
    expect(indexedMatches).toContain("character-frequency");
  });

  it("routes CSV and JSON use cases to related free products", () => {
    expect(SOFTWARE_RECOMMENDATIONS["csv-json-converter"]).toContain("csv-cleaner-pro");
    expect(SOFTWARE_RECOMMENDATIONS["json-formatter"]).toContain("json-studio");
    expect(SOFTWARE_RECOMMENDATIONS["duplicate-line-remover"]).toContain("text-batch-studio");
  });
});
