import { describe, expect, it } from "vitest";
import { parseSearchIndexPayload } from "./search-index-payload";

const tool = { slug: "percentage-calculator", category: "math", title: "Percentage Calculator" };

describe("search index payload validation", () => {
  it("accepts valid tools in order", () => {
    expect(parseSearchIndexPayload({ tools: [tool, { ...tool, slug: "tip-calculator" }] }))
      .toEqual([tool, { ...tool, slug: "tip-calculator" }]);
  });
  it("fails closed for malformed payloads without crashing recommendations", () => {
    for (const payload of [null, {}, [], { tools: null }, { tools: "bad" }, 7]) {
      expect(parseSearchIndexPayload(payload)).toEqual([]);
    }
  });
  it("ignores malformed entries without losing valid recommendations", () => {
    const data = { tools: [null, "invalid", [], { slug: "", title: "Empty", category: "math" }, { slug: "s", category: "math" }, tool] };
    expect(parseSearchIndexPayload(data)).toEqual([tool]);
  });
});
