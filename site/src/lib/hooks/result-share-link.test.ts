import { describe, expect, it } from "vitest";
import {
  classifyRestoredShareChange,
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

  it("preserves the share fragment while restoring state and clears on a later edit", () => {
    const initial = '{"a":1}';
    const restored = '{"a":5}';
    // Mount effect reads the pre-restoration value and must leave the URL alone.
    const mounted = classifyRestoredShareChange(null, initial, restored);
    expect(mounted).toEqual({ clearStale: false, nextExpected: restored });
    // Hydration updates React state to match the incoming shared payload.
    const hydrated = classifyRestoredShareChange(initial, restored, mounted.nextExpected);
    expect(hydrated).toEqual({ clearStale: false, nextExpected: null });
    // Editing the restored tool value makes the old share link stale.
    expect(classifyRestoredShareChange(restored, '{"a":9}', hydrated.nextExpected))
      .toEqual({ clearStale: true, nextExpected: null });
    // If the incoming payload equals defaults, the initial effect consumes it.
    expect(classifyRestoredShareChange(null, restored, restored))
      .toEqual({ clearStale: false, nextExpected: null });
  });

  it("clears the URL if a tool normalizes the restored value differently", () => {
    expect(classifyRestoredShareChange('{"a":1}', '{"a":5,"normalized":true}', '{"a":5}'))
      .toEqual({ clearStale: true, nextExpected: null });
    expect(classifyRestoredShareChange('{"a":5}', '{"a":5}', null))
      .toEqual({ clearStale: false, nextExpected: null });
  });

  it("removes only stale result state after an actual edit", () => {
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi?wf=data#s=SECRET"))
      .toBe("https://toolify365.com/en/tools/bmi?wf=data");
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi?wf=data&s=OLD"))
      .toBe("https://toolify365.com/en/tools/bmi?wf=data");
    expect(clearStaleResultShareState("https://toolify365.com/en/tools/bmi#reading")).toBeNull();
  });
});
