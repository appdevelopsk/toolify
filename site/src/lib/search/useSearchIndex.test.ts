import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSearchIndex, loadSearchIndexResult } from "./useSearchIndex";

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

describe("localized search index failure recovery", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

  const healthy = { tools: [
    { slug: "word-counter", category: "text", title: "Word Counter" },
  ] };

  it("loads and shares a valid index without repeated fetches", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => healthy });
    vi.stubGlobal("fetch", fetchMock);
    const first = await loadSearchIndexResult("test-healthy");
    expect(first.failed).toBe(false);
    expect(first.items[0]?.slug).toBe("word-counter");
    expect(await loadSearchIndex("test-healthy")).toEqual(first.items);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("distinguishes unavailable network from no matching search results", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => healthy });
    vi.stubGlobal("fetch", fetchMock);
    expect(await loadSearchIndexResult("test-network-retry")).toEqual({ items: [], failed: true });
    const retry = await loadSearchIndexResult("test-network-retry");
    expect(retry.failed).toBe(false);
    expect(retry.items).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("treats malformed and empty index payloads as errors and permits recovery", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ tools: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => healthy });
    vi.stubGlobal("fetch", fetchMock);
    expect((await loadSearchIndexResult("test-empty-retry")).failed).toBe(true);
    expect((await loadSearchIndexResult("test-empty-retry")).failed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("continues to provide an empty fallback to noninteractive recommendations", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    expect(await loadSearchIndex("test-legacy-offline")).toEqual([]);
  });

  it("offers an explicit retry and offline state without sending false no-results analytics", () => {
    expect(source).toContain("export function useSearchIndexStatus");
    expect(source).toContain("failed: result?.failed ?? false");
    expect(source).toContain("setAttempt((previous) => previous + 1)");
    expect(source).toContain("cache.delete(locale)");
  });
});
