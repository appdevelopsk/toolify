import { afterEach, describe, expect, it, vi } from "vitest";
import { consumeSearchForTool, parseSearchAttribution, rememberSearchClick } from "./search-attribution";

const valid = { destination_tool: "json-formatter", search_source: "header", result_position: 3, at: 1000 };

describe("search-to-active-tool attribution", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("accepts only recent exact tool matches", () => {
    expect(parseSearchAttribution(JSON.stringify(valid), 5000, "json-formatter")).toEqual(valid);
    expect(parseSearchAttribution(JSON.stringify(valid), 5000, "date-calculator")).toBeUndefined();
    expect(parseSearchAttribution(JSON.stringify(valid), 601001, "json-formatter")).toBeUndefined();
    expect(parseSearchAttribution(JSON.stringify(valid), 999, "json-formatter")).toBeUndefined();
  });

  it("rejects unsupported sources, positions, malformed data and user strings", () => {
    const cases = [
      null, "not-json", "[]",
      JSON.stringify({ ...valid, search_source: "external_ad" }),
      JSON.stringify({ ...valid, result_position: 0 }),
      JSON.stringify({ ...valid, result_position: 11 }),
      JSON.stringify({ ...valid, result_position: 1.5 }),
      JSON.stringify({ ...valid, destination_tool: "json-formatter?email=private" }),
      JSON.stringify({ ...valid, at: "1000" }),
    ];
    for (const raw of cases) expect(parseSearchAttribution(raw, 5000, "json-formatter")).toBeUndefined();
  });

  it("keeps a valid click across an unrelated tool, then consumes it once", () => {
    const entries = new Map<string, string>();
    vi.stubGlobal("window", { sessionStorage: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => { entries.set(key, value); },
      removeItem: (key: string) => { entries.delete(key); },
    } });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-13T01:00:00Z"));
    rememberSearchClick("json-formatter", "tools_page", 2);
    expect(entries.size).toBe(1);
    expect(JSON.stringify([...entries.values()])).not.toContain("search_query");
    expect(consumeSearchForTool("word-counter")).toBeUndefined();
    expect(entries.size).toBe(1);
    expect(consumeSearchForTool("json-formatter")).toMatchObject({
      destination_tool: "json-formatter", search_source: "tools_page", result_position: 2,
    });
    expect(consumeSearchForTool("json-formatter")).toBeUndefined();
    expect(entries.size).toBe(0);
  });

  it("clears expired records and never attributes a stale interaction", () => {
    const entries = new Map<string, string>();
    vi.stubGlobal("window", { sessionStorage: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => { entries.set(key, value); },
      removeItem: (key: string) => { entries.delete(key); },
    } });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-13T01:00:00Z"));
    rememberSearchClick("json-formatter", "header", 1);
    vi.advanceTimersByTime(11 * 60 * 1000);
    expect(consumeSearchForTool("json-formatter")).toBeUndefined();
    expect(entries.size).toBe(0);
  });

  it("ignores unsupported identifiers and invalid ranks when storing", () => {
    const entries = new Map<string, string>();
    vi.stubGlobal("window", { sessionStorage: {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => { entries.set(key, value); },
      removeItem: (key: string) => { entries.delete(key); },
    } });
    rememberSearchClick("word-counter?secret", "header", 1);
    rememberSearchClick("word-counter", "header", 99);
    expect(entries.size).toBe(0);
  });
});
