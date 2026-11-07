import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { getTool } from "@/lib/tools/registry";
import { WORKFLOWS, workflowCopy } from "./catalog";

describe("goal-based workflows", () => {
  it("has four three-step journeys with real, unique tools", () => {
    expect(WORKFLOWS).toHaveLength(4);
    const ids = new Set<string>();
    for (const journey of WORKFLOWS) {
      expect(ids.has(journey.id)).toBe(false);
      ids.add(journey.id);
      expect(journey.tools).toHaveLength(3);
      expect(new Set(journey.tools).size).toBe(journey.tools.length);
      for (const slug of journey.tools) expect(getTool(slug)).toBeTruthy();
    }
  });

  it("provides all on-page labels in every supported locale", () => {
    expect(LOCALES).toHaveLength(17);
    for (const locale of LOCALES) {
      const copy = workflowCopy(locale);
      for (const value of [copy.nav, copy.heading, copy.description, copy.step, copy.open, copy.privacy]) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const flow of WORKFLOWS) expect(copy.title(flow.id).trim().length).toBeGreaterThan(0);
    }
  });

  it("does not depend on user data and has a predictable fallback", () => {
    expect(workflowCopy("unknown").heading).toBe(workflowCopy("en").heading);
    expect(WORKFLOWS.every(({ tools }) => tools.every((slug) => !/[?&#/]/.test(slug)))).toBe(true);
  });
});
