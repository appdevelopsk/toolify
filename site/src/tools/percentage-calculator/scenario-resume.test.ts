import { describe, expect, it } from "vitest";
import { parseSavedScenario, serializeSavedScenario } from "./scenario-resume";

describe("percentage resume draft", () => {
  const now = 1793900000000;
  it("round trips a deliberately saved scenario", () => {
    const saved = serializeSavedScenario("pct_change", "20", "250", now);
    expect(parseSavedScenario(saved, now)).toEqual({ mode: "pct_change", a: "20", b: "250", savedAt: now });
  });
  it("rejects expired, future, malformed or unexpectedly large data", () => {
    const saved = serializeSavedScenario("pct_of", "20", "250", now);
    expect(parseSavedScenario(saved, now + 8 * 86400000)).toBeNull();
    expect(parseSavedScenario(saved, now - 1)).toBeNull();
    expect(parseSavedScenario("{bad", now)).toBeNull();
    expect(parseSavedScenario(JSON.stringify({ mode: "unexpected", a: "1", b: "2", savedAt: now }), now)).toBeNull();
    expect(parseSavedScenario("x".repeat(513), now)).toBeNull();
    expect(serializeSavedScenario("pct_of", "20<script>", "250", now)).toBeNull();
    expect(serializeSavedScenario("pct_of", "e", "250", now)).toBeNull();
    expect(serializeSavedScenario("what_pct", "20", "0", now)).toBeNull();
    expect(serializeSavedScenario("pct_of", "20abc", "250", now)).toBeNull();
    expect(serializeSavedScenario("pct_of", "20", "250", Number.NaN)).toBeNull();
    expect(serializeSavedScenario("pct_of", "20", "250", -1)).toBeNull();
    expect(parseSavedScenario(JSON.stringify({mode: "pct_of", a: "1x", b: "250", savedAt: now}), now)).toBeNull();
  });
});
