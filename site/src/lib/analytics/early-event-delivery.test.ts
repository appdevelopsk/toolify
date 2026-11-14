import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchGa4Event } from "./early-event-delivery";
import { readFileSync } from "node:fs";

type FakeWindow = EventTarget & {
  __toolifyGa4Ready?: boolean;
  gtag?: ReturnType<typeof vi.fn>;
  self?: unknown;
  top?: unknown;
};

function browserWindow(): FakeWindow {
  const w = Object.assign(new EventTarget(), {
    __toolifyGa4Ready: false,
    gtag: vi.fn(),
  }) as FakeWindow;
  w.self = w;
  w.top = w;
  vi.stubGlobal("window", w);
  return w;
}

describe("consent-aware early GA4 engagement delivery", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("buffers active user input until the site's own GA4 config and consent defaults finish", () => {
    const w = browserWindow();
    const calculated = { tool_slug: "percentage-calculator", locale: "fr", input_count: 2 };
    expect(dispatchGa4Event("calculate", calculated)).toBe(true);
    expect(w.gtag).not.toHaveBeenCalled();
    w.__toolifyGa4Ready = true;
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag).toHaveBeenCalledExactlyOnceWith("event", "calculate", calculated);
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag).toHaveBeenCalledTimes(1);
  });

  it("preserves search-click → interaction attribution order before initialization", () => {
    const w = browserWindow();
    dispatchGa4Event("search_result_click", { tool_slug: "word-counter", result_position: 1 });
    dispatchGa4Event("calculate", { tool_slug: "word-counter" });
    dispatchGa4Event("search_tool_interaction", { tool_slug: "word-counter" });
    expect(w.gtag).not.toHaveBeenCalled();
    w.__toolifyGa4Ready = true;
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag?.mock.calls.map((call) => call[1])).toEqual([
      "search_result_click", "calculate", "search_tool_interaction",
    ]);
  });

  it("sends instantly after consent-mode setup, without duplicating the earlier buffer", () => {
    const w = browserWindow();
    dispatchGa4Event("tool_search", { query_length: 7, results_count: 4 });
    w.__toolifyGa4Ready = true;
    dispatchGa4Event("related_click", { tool_slug: "json-formatter" });
    expect(w.gtag?.mock.calls.map((call) => call[1])).toEqual([
      "tool_search", "related_click",
    ]);
  });

  it("keeps the buffer bounded and discards stale actions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-14T00:00:00Z"));
    const w = browserWindow();
    for (let i = 0; i < 30; i++) dispatchGa4Event("calculate", { tool_slug: "tool-" + i });
    w.__toolifyGa4Ready = true;
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag).toHaveBeenCalledTimes(24);
    expect(w.gtag?.mock.calls[0]?.[2]).toEqual({ tool_slug: "tool-6" });

    w.__toolifyGa4Ready = false;
    dispatchGa4Event("calculate", { tool_slug: "stale" });
    vi.advanceTimersByTime(15_001);
    w.__toolifyGa4Ready = true;
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag).toHaveBeenCalledTimes(24);
  });

  it("does not collect analytics while framed on unrelated publishers", () => {
    const w = browserWindow();
    w.top = {};
    expect(dispatchGa4Event("calculate", { tool_slug: "workdays-calculator" })).toBe(false);
    w.__toolifyGa4Ready = true;
    w.dispatchEvent(new Event("toolify:ga4-ready"));
    expect(w.gtag).not.toHaveBeenCalled();
  });

  it("does not persist tool inputs, query text, identities, or events in browser storage", () => {
    const source = readFileSync(new URL("./early-event-delivery.ts", import.meta.url), "utf8");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("fetch(");
    expect(source).toContain("MAX_EVENTS = 24");
    expect(source).toContain("MAX_AGE_MS = 15_000");
  });

  it("wires the analytics sender and protects search/journey click attribution from a missing gtag stub", () => {
    const source = readFileSync(new URL("./events.ts", import.meta.url), "utf8");
    expect(source).toContain("dispatchGa4Event(name, params)");
    expect(source).toContain("rememberSearchClick(p.destination, p.source, p.position)");
    expect(source).toContain("rememberJourneyClick(p.journey, p.destination, p.position)");
    expect(source).not.toContain('typeof window.gtag !== "function"');
  });
});
