import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./useSearchIndex.ts", import.meta.url), "utf8");

describe("locale-aware search index hook", () => {
  it("never displays a previous locale's titles after a locale switch", () => {
    expect(source).toContain("setLoaded({ locale, items: list })");
    expect(source).toContain("loaded?.locale === locale");
    expect(source).toContain("return enabled && loaded?.locale === locale ? loaded.items : null");
  });
  it("ignores malformed search index payloads", () => {
    expect(source).toContain("parseSearchIndexPayload(payload)");
    expect(source).toContain('from "./search-index-payload"');
  });
});
