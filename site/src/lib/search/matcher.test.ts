import { describe, it, expect } from "vitest";
import { normalize, searchTools, type SearchItem } from "./matcher";

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

  it("matches accent-free French, Spanish and Portuguese user searches", () => {
    const multilingual: SearchItem[] = [
      { slug: "health-helper", category: "health", title: "Santé & forme" },
      { slug: "price-helper", category: "finance", title: "Cálculo de precio" },
      { slug: "text-helper", category: "text", title: "Conversão de texto" },
    ];
    expect(searchTools(multilingual, "sante")[0]?.slug).toBe("health-helper");
    expect(searchTools(multilingual, "calculo")[0]?.slug).toBe("price-helper");
    expect(searchTools(multilingual, "conversao")[0]?.slug).toBe("text-helper");
  });

  it("finds Vietnamese and Turkish category terms without diacritics", () => {
    const subset = [
      { slug: "unit-helper", category: "converter" as const, title: "Đơn vị" },
      { slug: "health-helper", category: "health" as const, title: "Sức khỏe" },
      { slug: "turkish-helper", category: "math" as const, title: "Sağlık Endeksi" },
    ];
    expect(searchTools(subset, "don vi")[0]?.slug).toBe("unit-helper");
    expect(searchTools(subset, "suc khoe")[0]?.slug).toBe("health-helper");
    expect(searchTools(subset, "saglik")[0]?.slug).toBe("turkish-helper");
  });

  it("preserves Japanese, Arabic and Devanagari combining marks", () => {
    expect(normalize("ＡＢＣ")).toBe("abc");
    expect(normalize("ガ")).toBe(normalize("ガ"));
    expect(normalize("हिन्दी")).toBe("हिन्दी");
    expect(normalize("العَرَبيّة")).toBe("العَرَبيّة");
  });

  it("maps common non-decomposing Latin letters", () => {
    expect(normalize("Straße")).toBe("strasse");
    expect(normalize("Œuvre")).toBe("oeuvre");
    expect(normalize("İNDİRİM")).toBe("indirim");
  });

  it("respects the limit", () => {
    expect(searchTools(items, "c", { limit: 2 })).toHaveLength(2);
  });
});
