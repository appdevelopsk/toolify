import { describe, it, expect } from "vitest";
import { searchTools, type SearchItem } from "./matcher";

const items: SearchItem[] = [
  { slug: "bmi-calculator", category: "health", title: "BMI Calculator", keyword: "bmi", description: "Body mass index" },
  { slug: "loan-calculator", category: "finance", title: "Loan Calculator", keyword: "loan payment" },
  { slug: "age-calculator", category: "datetime", title: "Age Calculator", keyword: "age" },
  { slug: "word-counter", category: "text", title: "Word Counter", keyword: "word count", description: "Count characters" },
  { slug: "hex-to-rgb", category: "color", title: "HEX to RGB", keyword: "hex rgb" },
];

describe("searchTools", () => {
  it("returns nothing for an empty query", () => {
    expect(searchTools(items, "   ")).toEqual([]);
  });

  it("is case-insensitive and prefers title/slug prefix matches", () => {
    const r = searchTools(items, "BMI");
    expect(r[0]?.slug).toBe("bmi-calculator");
  });

  it("matches slug words and substrings", () => {
    expect(searchTools(items, "rgb").map((x) => x.slug)).toEqual(["hex-to-rgb"]);
    expect(searchTools(items, "calc").map((x) => x.slug)).toContain("loan-calculator");
  });

  it("matches localized category keywords passed in", () => {
    const r = searchTools(items, "お金", { categoryKeywords: { finance: "金融 お金 ローン" } });
    expect(r.map((x) => x.slug)).toEqual(["loan-calculator"]);
  });

  it("matches built-in category words and descriptions", () => {
    expect(searchTools(items, "colour").map((x) => x.slug)).toEqual(["hex-to-rgb"]);
    expect(searchTools(items, "characters").map((x) => x.slug)).toEqual(["word-counter"]);
  });

  it("respects the limit", () => {
    expect(searchTools(items, "c", { limit: 2 })).toHaveLength(2);
  });
});
