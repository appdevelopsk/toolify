import { describe, expect, it } from "vitest";
import { scenarioResult } from "./scenario-comparison";

describe("percentage scenarios", () => {
  it("computes all supported modes consistently", () => {
    expect(scenarioResult("pct_of", "20", "250")).toBe(50);
    expect(scenarioResult("what_pct", "20", "250")).toBe(8);
    expect(scenarioResult("pct_change", "20", "250")).toBe(1150);
    expect(scenarioResult("pct_add", "20", "250")).toBe(300);
    expect(scenarioResult("pct_sub", "20", "250")).toBe(200);
  });
  it("handles empty, zero denominator and non-finite values", () => {
    expect(scenarioResult("pct_of", "", "250")).toBeNull();
    expect(scenarioResult("pct_of", "   ", "250")).toBeNull();
    expect(scenarioResult("pct_of", "20xyz", "250")).toBeNull();
    expect(scenarioResult("what_pct", "20", "0")).toBeNull();
    expect(scenarioResult("pct_change", "0", "20")).toBeNull();
    expect(scenarioResult("pct_of", "Infinity", "250")).toBeNull();
    expect(scenarioResult("pct_of", "1e308", "1e308")).toBeNull();
  });
});
