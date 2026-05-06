import { describe, it, expect } from "vitest";
import { LOCALE_DEFS, LOCALES, ALL_LOCALES, DEFAULT_LOCALE, getLocaleDef, getDirection } from "./locales";

describe("locales", () => {
  it("has 17 total locale definitions", () => {
    expect(LOCALE_DEFS).toHaveLength(17);
  });

  it("includes en and ja in active locales", () => {
    expect(LOCALES).toContain("en");
    expect(LOCALES).toContain("ja");
  });

  it("DEFAULT_LOCALE is en", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("LOCALES is a subset of ALL_LOCALES", () => {
    for (const locale of LOCALES) {
      expect(ALL_LOCALES).toContain(locale);
    }
  });

  it("each locale def has required fields", () => {
    for (const def of LOCALE_DEFS) {
      expect(def.code).toBeTruthy();
      expect(def.name).toBeTruthy();
      expect(def.native).toBeTruthy();
      expect(["ltr", "rtl"]).toContain(def.dir);
      expect(typeof def.active).toBe("boolean");
    }
  });

  it("getLocaleDef returns correct def for known code", () => {
    const ja = getLocaleDef("ja");
    expect(ja?.code).toBe("ja");
    expect(ja?.native).toBe("日本語");
  });

  it("getLocaleDef returns undefined for unknown code", () => {
    expect(getLocaleDef("xx")).toBeUndefined();
  });

  it("getDirection returns rtl for arabic", () => {
    expect(getDirection("ar")).toBe("rtl");
  });

  it("getDirection returns ltr for unknown locale", () => {
    expect(getDirection("xx")).toBe("ltr");
  });

  it("locale codes follow BCP-47-ish format", () => {
    for (const def of LOCALE_DEFS) {
      expect(def.code).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    }
  });
});
