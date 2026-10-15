import { describe, expect, it } from "vitest";
import { CATALOG, getOffersFor, trackedOfferUrl } from "./catalog";

const ids = (category: string, locale: string, tool: string) =>
  getOffersFor(category, locale, { tool }).map((o) => o.id);

describe("ツールの用件と広告の関連(2026-10-15 T2)", () => {
  it("妊娠系ツールに VPN・美顔器を出さない", () => {
    for (const loc of ["ja", "en", "es", "de"]) {
      const got = ids("health", loc, "due-date-calculator");
      expect(got.some((id) => id.startsWith("nordvpn"))).toBe(false);
      expect(got).not.toContain("bioaestech-jp");
    }
  });
  it("ペットの年齢計算に人の健康機器を出さない", () => {
    expect(ids("health", "ja", "dog-age-calculator")).toEqual([]);
    expect(ids("health", "en", "cat-age-calculator")).toEqual([]);
  });
  it("VPN は text と旅行系ツールだけ", () => {
    for (const [cat, tool] of [["health", "bmi-calculator"], ["finance", "tip-calculator"], ["math", "prime-checker"], ["color", "color-converter"], ["datetime", "age-calculator"], ["converter", "temperature-converter"]]) {
      for (const loc of ["ja", "en", "es"]) {
        expect(ids(cat!, loc, tool!).some((id) => id.startsWith("nordvpn"))).toBe(false);
      }
    }
    expect(ids("text", "ja", "password-generator")).toContain("nordvpn-jp");
    expect(ids("text", "en", "password-generator")).toContain("nordvpn-awin");
    expect(ids("converter", "en", "currency-converter")).toContain("nordvpn-awin");
    expect(ids("datetime", "ja", "timezone-converter")).toContain("nordvpn-jp");
  });
  it("楽天モバイルは金融とデータ容量換算、FXEA は金融と率・統計の数学だけ", () => {
    expect(ids("converter", "ja", "temperature-converter")).not.toContain("rakuten-mobile-jp");
    expect(ids("converter", "ja", "data-size-converter")).toContain("rakuten-mobile-jp");
    expect(ids("math", "en", "prime-checker")).not.toContain("fxea365-house");
    expect(ids("math", "en", "percentage-change-calculator")).toContain("fxea365-house");
    expect(ids("finance", "ja", "compound-interest-calculator")).toContain("fxea365-house");
  });
  it("tools / excludeTools は実在するオファーの live のものだけで、pending は出ない", () => {
    for (const o of CATALOG) {
      if (o.pending) {
        expect(o.tools ?? []).toEqual([]);
      }
    }
    expect(ids("finance", "en", "loan-calculator").every((id) => !CATALOG.find((o) => o.id === id)?.pending)).toBe(true);
  });
});

describe("AWIN clickref(d573a94)", () => {
  it("awin リンクに toolify-<context> を付ける", () => {
    const nord = CATALOG.find((o) => o.id === "nordvpn-awin")!;
    const href = trackedOfferUrl(nord, nord.url.default!, "password-generator");
    expect(href).toContain("clickref=toolify-password-generator&ued=");
  });
});
