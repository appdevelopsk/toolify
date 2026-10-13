import { describe, expect, it } from "vitest";
import { currencyFormatter, currencyForLocale } from "./currency";

const LOCALES = ["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "pt-BR", "ru", "th", "tr", "vi", "zh-CN", "zh-TW"];

describe("currencyForLocale", () => {
  it("matches the currency the copy uses in each locale", () => {
    const got = Object.fromEntries(LOCALES.map((l) => [l, currencyForLocale(l)]));
    expect(got).toEqual({
      ar: "USD", de: "EUR", en: "USD", es: "USD", fr: "EUR", hi: "INR", id: "IDR", it: "EUR", ja: "JPY",
      ko: "USD", "pt-BR": "BRL", ru: "RUB", th: "USD", tr: "TRY", vi: "VND", "zh-CN": "USD", "zh-TW": "USD",
    });
  });

  it("lets a tool override a locale and falls back to USD for unknown locales", () => {
    expect(currencyForLocale("ko", { ko: "KRW" })).toBe("KRW");
    expect(currencyForLocale("de", { ko: "KRW" })).toBe("EUR");
    expect(currencyForLocale("xx")).toBe("USD");
  });
});

describe("currencyFormatter", () => {
  const digits = (s: string) => s.replace(/[^\d.,]/g, "");

  it("keeps the previous output for en and ja", () => {
    expect(currencyFormatter("en").format(28.846)).toBe("$28.85");
    expect(digits(currencyFormatter("ja").format(4807.69))).toBe("4,808");
  });

  it("prints the locale's currency symbol and separators", () => {
    expect(currencyFormatter("tr").format(39000)).toBe("₺39.000,00");
    expect(currencyFormatter("pt-BR").format(3813.333)).toMatch(/^R\$\s3\.813,33$/);
    expect(currencyFormatter("fr").format(3033.333)).toMatch(/^3\s033,33\s€$/);
    expect(currencyFormatter("de").format(1153.846)).toMatch(/^1\.153,85\s€$/);
    expect(currencyFormatter("hi").format(750000)).toContain("₹");
    expect(currencyFormatter("ru").format(1500)).toContain("₽");
  });

  it("shows no decimals for JPY, VND and IDR", () => {
    expect(currencyFormatter("vi").format(28846.15)).toMatch(/^28\.846\s₫$/);
    expect(currencyFormatter("id").format(28846.15)).toMatch(/^Rp\s?28\.846$/);
    expect(currencyFormatter("ja").resolvedOptions().maximumFractionDigits).toBe(0);
  });
});
