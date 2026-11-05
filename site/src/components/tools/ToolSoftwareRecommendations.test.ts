import { describe, expect, it } from "vitest";
import { SOFTWARE_RECOMMENDATIONS } from "./ToolSoftwareRecommendations";
import { AVAILABLE_SOFTWARE } from "@/lib/software/catalog";

describe("tool -> available software recommendations", () => {
  it("points only to products currently available", () => {
    const available = new Set(AVAILABLE_SOFTWARE.map((product) => product.slug));
    for (const [tool, recommendations] of Object.entries(SOFTWARE_RECOMMENDATIONS)) {
      expect(recommendations.length, tool).toBeGreaterThan(0);
      expect(new Set(recommendations).size, tool).toBe(recommendations.length);
      for (const slug of recommendations) expect(available.has(slug), `${tool} -> ${slug}`).toBe(true);
    }
  });

  it("routes CSV and JSON use cases to related free products", () => {
    expect(SOFTWARE_RECOMMENDATIONS["csv-json-converter"]).toContain("csv-cleaner-pro");
    expect(SOFTWARE_RECOMMENDATIONS["json-formatter"]).toContain("json-studio");
    expect(SOFTWARE_RECOMMENDATIONS["duplicate-line-remover"]).toContain("text-batch-studio");
  });
});
