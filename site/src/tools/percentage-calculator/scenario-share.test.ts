import { describe, expect, it } from "vitest";
import { parseSharedPercentageState } from "./scenario-share";

describe("shared percentage scenarios", () => {
  it("restores valid scenarios intact", () => {
    expect(parseSharedPercentageState({ mode: "pct_of", a: "20", b: "250" }))
      .toEqual({ mode: "pct_of", a: "20", b: "250" });
  });
  it("does not mix invalid or missing URL values with defaults", () => {
    expect(parseSharedPercentageState({ mode: "pct_of", a: "10" })).toBeNull();
    expect(parseSharedPercentageState({ mode: "bogus", a: "20", b: "250" })).toBeNull();
    expect(parseSharedPercentageState({ mode: "pct_of", a: "20xyz", b: "250" })).toBeNull();
    expect(parseSharedPercentageState({ mode: "pct_of", a: "1".repeat(41), b: "250" })).toBeNull();
    expect(parseSharedPercentageState({ mode: "what_pct", a: "20", b: "0" })).toBeNull();
    expect(parseSharedPercentageState([])).toBeNull();
    expect(parseSharedPercentageState(null)).toBeNull();
  });
});
