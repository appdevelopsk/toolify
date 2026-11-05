import { describe, expect, it } from "vitest";
import { selectRecentRecommendations } from "./recent-recommendations";

const known = new Set(["bmi-calculator", "percentage-calculator", "age-calculator", "length-converter"]);

describe("selectRecentRecommendations", () => {
  it("hides the current page and preserves most-recent order", () => {
    expect(selectRecentRecommendations(["bmi-calculator", "age-calculator", "length-converter"], "bmi-calculator", known))
      .toEqual(["age-calculator", "length-converter"]);
  });

  it("deduplicates history and ignores removed tools", () => {
    expect(selectRecentRecommendations(["deleted", "age-calculator", "age-calculator", "bmi-calculator"], "bmi-calculator", known))
      .toEqual(["age-calculator"]);
  });

  it("limits suggestions and returns none for new users", () => {
    expect(selectRecentRecommendations([], "bmi-calculator", known)).toEqual([]);
    expect(selectRecentRecommendations(["age-calculator", "length-converter", "percentage-calculator"], "bmi-calculator", known, 2))
      .toEqual(["age-calculator", "length-converter"]);
    expect(selectRecentRecommendations(["age-calculator"], "bmi-calculator", known, 0)).toEqual([]);
  });
});
