import { describe, expect, it } from "vitest";
import {
  clearStaleResultShareState,
  createResultShareLink,
  migrateLegacyShareQuery,
  readResultShareState,
} from "./result-share-link";

describe("privacy-first on-demand tool result links", () => {
  it("creates a hash link without sending tool inputs in HTTP query strings", () => {
    const link = createResultShareLink(
      "https://toolify365.com/en/tools/bmi-calculator?wf=writing&ws=2&s=OLD#intro",
      "YWJjLTEyMw", 1800
    );
    expect(link).toBe("https://toolify365.com/en/tools/bmi-calculator?wf=writing&ws=2#s=YWJjLTEyMw");
    const url = new URL(link!);
    expect(url.searchParams.has("s")).toBe(false);
    expect(url.hash).toBe("#s=YWJjLTEyMw");
  });

  it("refuses absent, oversized and invalid payloads", () => {
    for (const payload of ["", "abc+", "a/=", "a b", "x".repeat(5)]) {
      expect(createResultShareLink("https://toolify365.com/en", payload, 4)).toBeNull();
    }
    expect(createResultShareLink("https://toolify365.com/en", "abc", 0)).toBeNull();
  });

  it("restores modern fragment links and legacy query links", () => {
    expect(readResultShareState("https://toolify365.com/en/tools/bmi#s=HASH")).toBe("HASH");
    expect(readResultShareState("https://toolify365.com/en/tools/bmi?s=LEGACY")).toBe("LEGACY");
    expect(readResultShareState("https://toolify365.com/en/tools/bmi?wf=data&s=LEGACY#s=HASH")).toBe("HASH");
    expect(readResultShareState("https://toolify365.com/en/tools/bmi#section")).toBeNull();
  });

  it("moves existing query links to fragments without deleting other tracking state", () => {
    expect(migrateLegacyShareQuery("https://toolify365.com/ja/tools/bmi?s=OLD&wf=data"))
      .toBe("https://toolify365.com/ja/tools/bmi?wf=data#s=OLD");
    expect(migrateLegacyShareQuery("https://toolify365.com/ja/tools/bmi#s=NEW")).toBeNull();
  });

  it("removes only stale result state after an actual edit", () => {
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi?wf=data#s=SECRET"))
      .toBe("https://toolify365.com/en/tools/bmi?wf=data");
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi?wf=data&s=OLD"))
      .toBe("https://toolify365.com/en/tools/bmi?wf=data");
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi#reading")).toBeNull();
  });
});
