import { describe, expect, it } from "vitest";
import { parseSearchIndexPayload } from "./search-index-payload";

const tool = { slug: "percentage-calculator", category: "math", title: "Percentage Calculator" };

describe("search index payload validation", () => {
  it("accepts valid tools in order", () => {
    expect(parseSearchIndexPayload({ tools: [tool, { ...tool, slug: "tip-calculator" }] }))
      .toEqual([tool, { ...tool, slug: "tip-calculator" }]);
  });
  it("does not mistakenly discard structurally valid short slugs", () => {
    expect(parseSearchIndexPayload({ tools: [{ ...tool, slug: "s" }] }))
      .toEqual([{ ...tool, slug: "s" }]);
  });
  it("fails closed for malformed payloads without crashing recommendations", () => {
    for (const payload of [null, {}, [], { tools: null }, { tools: "bad" }, 7]) {
      expect(parseSearchIndexPayload(payload)).toEqual([]);
    }
  });
  it("rejects unsafe links, unknown categories, duplicate slugs and oversized labels", () => {
    const payload = { tools: [
      { ...tool, slug: "../secret" },
      { ...tool, slug: "other/path" },
      { ...tool, slug: "%2F%2Fevil" },
      { ...tool, category: "unknown" },
      { ...tool, title: " " },
      { ...tool, title: "X".repeat(201) },
      tool,
      { ...tool, title: "Duplicate" },
      { ...tool, slug: "tip-calculator" },
    ] };
    expect(parseSearchIndexPayload(payload))
      .toEqual([tool, { ...tool, slug: "tip-calculator" }]);
  });
  it("ignores malformed entries without losing valid recommendations", () => {
    const data = { tools: [null, "invalid", [], { slug: "", title: "Empty", category: "math" }, { slug: "../unsafe", title: "Unsafe", category: "math" }, tool] };
    expect(parseSearchIndexPayload(data)).toEqual([tool]);
  });
});
