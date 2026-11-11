import { describe, expect, it } from "vitest";
import { parseJourneyAttribution } from "./journey-attribution";

const payload = { journey_id: "deadline", destination_tool: "date-calculator", step_position: 2, at: 1000 };
describe("session-only journey attribution", () => {
  it("accepts a recent exact destination", () => {
    expect(parseJourneyAttribution(JSON.stringify(payload), 5000, "date-calculator")).toEqual(payload);
  });
  it("cannot attribute interaction on an unrelated tool", () => {
    expect(parseJourneyAttribution(JSON.stringify(payload), 5000, "word-counter")).toBeUndefined();
  });
  it("expires after ten minutes and rejects future timestamps", () => {
    expect(parseJourneyAttribution(JSON.stringify(payload), 602000, "date-calculator")).toBeUndefined();
    expect(parseJourneyAttribution(JSON.stringify(payload), 999, "date-calculator")).toBeUndefined();
  });
  it("rejects malformed and out-of-range identifiers and steps", () => {
    for (const s of ["not-json", JSON.stringify({ ...payload, step_position: 0 }), JSON.stringify({ ...payload, journey_id: "x?a=private" }), JSON.stringify({ ...payload, at: "1000" })]) {
      expect(parseJourneyAttribution(s, 5000, "date-calculator")).toBeUndefined();
    }
  });
});
