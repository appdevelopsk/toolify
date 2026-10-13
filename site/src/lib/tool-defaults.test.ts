import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TOOL_CURRENCY_OVERRIDES, isWholeUnitCurrency, toolCurrency } from "./currency";
import { TOOL_DEFAULTS, toolDefaults } from "./tool-defaults";

const LOCALES = ["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "pt-BR", "ru", "th", "tr", "vi", "zh-CN", "zh-TW"];
const toolsDir = join(__dirname, "..", "tools");
const msg = (tool: string, locale: string) =>
  JSON.parse(readFileSync(join(toolsDir, tool, "messages", `${locale}.json`), "utf8"));

describe("ツール別の表示通貨", () => {
  it("表のツール名は実在し、言語は17言語のどれか(または全言語指定)", () => {
    for (const [tool, map] of Object.entries(TOOL_CURRENCY_OVERRIDES)) {
      expect(existsSync(join(toolsDir, tool)), tool).toBe(true);
      for (const [locale, cur] of Object.entries(map)) {
        expect(locale === "*" || LOCALES.includes(locale), `${tool} ${locale}`).toBe(true);
        // Intl が受け付ける通貨コードであること
        expect(() => new Intl.NumberFormat("en", { style: "currency", currency: cur })).not.toThrow();
      }
    }
  });

  it("例文が米ドルの言語は米ドルのまま、現地通貨の言語は現地通貨", () => {
    expect(toolCurrency("loan-calculator", "en")).toBe("USD");
    expect(toolCurrency("loan-calculator", "ko")).toBe("KRW");
    expect(toolCurrency("loan-calculator", "zh-TW")).toBe("TWD");
    expect(toolCurrency("loan-calculator", "ja")).toBe("JPY");
    expect(toolCurrency("debt-payoff-calculator", "es")).toBe("EUR");
    expect(toolCurrency("debt-payoff-calculator", "ar")).toBe("SAR");
    expect(toolCurrency("savings-goal-calculator", "zh-CN")).toBe("USD");
    // 例文が米ドルなのに現地通貨で出ていた所を米ドルへ戻した
    expect(toolCurrency("lease-vs-buy-calculator", "ko")).toBe("USD");
    expect(toolCurrency("mortgage-refinance-calculator", "zh-CN")).toBe("USD");
    for (const l of LOCALES) expect(toolCurrency("house-affordability-calculator", l)).toBe("USD");
    // 表に無いツールは言語の基本表
    expect(toolCurrency("unknown-tool", "fr")).toBe("EUR");
    expect(toolCurrency("unknown-tool", "th")).toBe("USD");
  });

  it("補助単位の無い通貨は小数を出さない", () => {
    for (const c of ["JPY", "KRW", "VND", "IDR", "TWD"]) expect(isWholeUnitCurrency(c)).toBe(true);
    for (const c of ["USD", "EUR", "THB", "INR", "CNY"]) expect(isWholeUnitCurrency(c)).toBe(false);
  });
});

describe("言語別の初期値", () => {
  it("ツール名・言語は実在し、値は正の数の文字列", () => {
    for (const [tool, byLocale] of Object.entries(TOOL_DEFAULTS)) {
      expect(existsSync(join(toolsDir, tool)), tool).toBe(true);
      for (const [locale, fields] of Object.entries(byLocale)) {
        expect(LOCALES.includes(locale), `${tool} ${locale}`).toBe(true);
        for (const [k, v] of Object.entries(fields)) {
          expect(v, `${tool} ${locale} ${k}`).toMatch(/^\d+(\.\d+)?$/);
          expect(Number(v)).toBeGreaterThan(0);
        }
      }
    }
  });

  it("表に無い言語は空(各 Component の既定値に落ちる)", () => {
    expect(toolDefaults("loan-calculator", "en")).toEqual({});
    expect(toolDefaults("no-such-tool", "ja")).toEqual({});
    expect(toolDefaults("salary-converter", "ja").amount).toBe("10000000");
  });

  it("米ドル表示の言語に現地通貨の桁の初期値を入れていない", () => {
    for (const [tool, byLocale] of Object.entries(TOOL_DEFAULTS)) {
      if (tool === "salary-converter") continue;
      for (const locale of Object.keys(byLocale)) {
        expect(toolCurrency(tool, locale), `${tool} ${locale}`).not.toBe("USD");
      }
    }
  });
});

// 例文の数値が道具の計算と合うこと(2026-10-13 に検算して直した箇所の固定)。
describe("例文の検算", () => {
  const pmt = (p: number, ratePct: number, years: number) => {
    const i = ratePct / 1200;
    const n = years * 12;
    return (p * i) / (1 - Math.pow(1 + i, -n));
  };
  const near = (actual: number, expected: number, tol = 0.01) =>
    expect(Math.abs(actual - expected) / expected, `${actual} vs ${expected}`).toBeLessThan(tol);

  it("loan: 初期値で例文の月額になる", () => {
    near(pmt(250000, 4.5, 30), 1267);
    const cases: [string, number][] = [["ja", 76500], ["fr", 1160], ["hi", 26035], ["ru", 41800], ["pt-BR", 2633], ["tr", 15071], ["th", 25335], ["zh-CN", 5067]];
    for (const [locale, expected] of cases) {
      const d = toolDefaults("loan-calculator", locale);
      near(pmt(Number(d.principal), Number(d.ratePct ?? "4.5"), Number(d.years ?? "30")), expected);
    }
    expect(msg("loan-calculator", "tr").article.sections[0].paragraphs[0]).toContain("15.071 ₺");
  });

  it("mortgage: 頭金20%と5%の総利息", () => {
    const interest = (p: number, r: number, y: number) => pmt(p, r, y) * y * 12 - p;
    near(interest(320000, 6.5, 30), 408000);
    near(interest(380000, 6.5, 30), 485000);
    near(interest(240000, 4, 25), 140000);
    near(interest(270000, 4, 25), 157500);
    near(interest(8e6, 9, 20), 9.3e6);
    near(interest(9.5e6, 9, 20), 11.0e6);
    near(interest(320000, 3.5, 25), 161000);
    expect(msg("mortgage-calculator", "fr").article.sections[1].paragraphs[1]).toMatch(/~140\s000\s€/);
    expect(msg("mortgage-calculator", "zh-CN").article.sections[1].paragraphs[1]).toContain("6.5% 利率");
  });

  it("debt-payoff: 94か月で返す月額に上乗せした時の月数と節約額", () => {
    const run = (balance: number, ratePct: number, extra: number) => {
      const i = ratePct / 1200;
      const base = (balance * i) / (1 - Math.pow(1 + i, -94));
      let bal = balance;
      let months = 0;
      let paidInterest = 0;
      while (bal > 0.005 && months < 999) {
        const it = bal * i;
        paidInterest += it;
        bal = bal + it - (base + extra);
        months++;
      }
      return { months, saved: base * 94 - balance - paidInterest };
    };
    const en = run(5000, 20, 50);
    expect(en.months).toBe(47);
    near(en.saved, 2700, 0.02);
    const ja = run(500000, 18, 5000);
    expect(ja.months).toBe(47);
    near(ja.saved, 240000, 0.02);
    expect(msg("debt-payoff-calculator", "en").article.sections[1].paragraphs[0]).toContain("94 months to 47 months");
    expect(msg("debt-payoff-calculator", "ja").article.sections[1].paragraphs[0]).toContain("47か月");
  });

  it("investment-fee-impact: 50万ドル・7%・30年の手数料コスト", () => {
    const fv = (initial: number, r: number, e: number, years: number) => {
      let b = initial;
      for (let k = 0; k < years * 12; k++) b *= 1 + (r - e) / 1200;
      return b;
    };
    near(fv(5e5, 7, 0, 30) - fv(5e5, 7, 1, 30), 1050000);
    near(fv(5e5, 7, 0, 30) - fv(5e5, 7, 0.05, 30), 60000);
    near(fv(5e6, 7, 1, 30), 30.1e6);
    near(fv(5e6, 7, 0.05, 30), 40.0e6);
    expect(msg("investment-fee-impact-calculator", "en").faq[0].a).toContain("$1,050,000 vs $60,000");
  });

  it("compound-interest / fire-number / lease-vs-buy / tip の例文", () => {
    near(10000 * Math.pow(1 + 0.05 / 12, 360), 44677);
    near(350000 * Math.pow(1 + 0.05 / 12, 360), 1563700);
    near(1000 * Math.pow(1 + 0.05 / 12, 360), 4468); // ko: 1000만원 → 4468만원
    expect(Number(toolDefaults("fire-number-calculator", "ja").expenses) * 25).toBe(100000000);
    expect(Number(toolDefaults("fire-number-calculator", "zh-TW").expenses) * 25).toBe(25000000);
    near(175000 * (Math.pow(1.07, 5) - 1), 70000);
    expect(500 * 0.07 * 0.1).toBeCloseTo(3.5);
  });
});
