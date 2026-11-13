import { describe, expect, it } from "vitest";
import { prefilledToolQuery } from "./prefilled-query";

describe("browser OpenSearch query handoff", () => {
  it("prefills localized tool search from the q parameter", () => {
    expect(prefilledToolQuery("?q=sant%C3%A9")).toBe("santé");
    expect(prefilledToolQuery("?q=%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9")).toBe("حاسبة");
    expect(prefilledToolQuery("?q=%E6%97%A5%E4%BB%98")).toBe("日付");
    expect(prefilledToolQuery("?utm_source=telegram&q=timezone+converter")).toBe("timezone converter");
  });
  it("ignores unrelated URL parameters and blank searches", () => {
    expect(prefilledToolQuery("?utm_source=telegram")).toBe("");
    expect(prefilledToolQuery("?q=%20%20")).toBe("");
    expect(prefilledToolQuery("")).toBe("");
  });
  it("removes control characters and truncates large queries without splitting emoji", () => {
    expect(prefilledToolQuery("?q=%00hello%0Aworld")).toBe("hello world");
    expect(Array.from(prefilledToolQuery("?q=" + encodeURIComponent("🧮".repeat(110)))).length).toBe(100);
    expect(prefilledToolQuery("?q=" + "a".repeat(5000))).toBe("");
  });
  it("never reads serialized calculator state from a share URL", () => {
    expect(prefilledToolQuery("?s=PRIVATE_CALCULATOR_INPUT")).toBe("");
  });
});
