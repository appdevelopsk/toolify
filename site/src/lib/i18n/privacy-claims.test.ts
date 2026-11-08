import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ALL_LOCALES } from "./locales";

/** Each locale must explain optional result-link sharing, not promise that
 * entered data can never appear in a link or third-party context. */
const SHARE_NOTICE: Record<string, string> = {
  en: "Result links",
  ja: "結果リンク",
  "zh-CN": "结果分享链接",
  "zh-TW": "結果分享連結",
  ko: "결과 공유 링크",
  es: "Los enlaces de resultados",
  "pt-BR": "Links de resultados",
  fr: "Les liens de résultat",
  de: "Ergebnislinks",
  it: "I link ai risultati",
  ru: "Ссылки на результаты",
  ar: "روابط النتائج",
  hi: "परिणाम के लिंक",
  id: "Tautan hasil",
  th: "ลิงก์ผลลัพธ์",
  vi: "Liên kết kết quả",
  tr: "Sonuç bağlantıları",
};

describe("homepage privacy copy stays accurate in all locales", () => {
  it("covers every active UI locale", () => {
    expect(ALL_LOCALES).toHaveLength(17);
    expect(Object.keys(SHARE_NOTICE).sort()).toEqual([...ALL_LOCALES].sort());
  });
  for (const locale of ALL_LOCALES) {
    it(`includes a localized explanation of browser processing and result links: ${locale}`, () => {
      const file = new URL(`../../messages/${locale}.json`, import.meta.url);
      const messages = JSON.parse(readFileSync(file, "utf8"));
      const home = messages.home;
      expect(home.subheading.length).toBeGreaterThanOrEqual(20);
      expect(home.whyPrivacyTitle.length).toBeGreaterThanOrEqual(4);
      expect(home.whyPrivacyText.length).toBeGreaterThanOrEqual(30);
      expect(home.whyPrivacyText).toContain(SHARE_NOTICE[locale]);
      if (locale === "en") {
        expect(home.whyPrivacyText).not.toContain("We never see your inputs");
      }
      if (locale === "ja") {
        expect(home.whyPrivacyText).not.toContain("ログも取りません");
      }
    });
  }
});
