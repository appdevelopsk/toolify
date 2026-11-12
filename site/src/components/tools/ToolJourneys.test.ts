import { describe, expect, it } from "vitest";
import { TOOL_JOURNEYS } from "./ToolJourneys";
import { listTools } from "@/lib/tools/registry";
import { journeyCopyFor } from "./journeyCopy";

describe("goal-based journeys", () => {
  const known = new Set(listTools().map((tool) => tool.slug));
  it("links only to registered tools", () => {
    for (const journey of TOOL_JOURNEYS) {
      expect(journey.slugs.length).toBeGreaterThanOrEqual(2);
      for (const slug of journey.slugs) expect(known.has(slug), `${journey.id}: ${slug}`).toBe(true);
    }
  });
  it("keeps unique journey identifiers and steps", () => {
    expect(new Set(TOOL_JOURNEYS.map((x) => x.id)).size).toBe(TOOL_JOURNEYS.length);
    for (const journey of TOOL_JOURNEYS) {
      expect(new Set(journey.slugs).size).toBe(journey.slugs.length);
      expect(journeyCopyFor("en")[journey.descriptionKey].length).toBeGreaterThan(30);
      expect(journeyCopyFor("ja")[journey.descriptionKey].length).toBeGreaterThan(10);
    }
  });
});
