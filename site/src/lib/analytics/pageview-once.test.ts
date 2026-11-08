import { describe, expect, it } from "vitest";
import { createPageViewSender, type PageViewPayload } from "./pageview-once";

describe("consent-ready one-shot GA4 pageview", () => {
  it("waits for the configured GA bootstrap instead of trusting a premature gtag function", () => {
    let ready = false;
    const payloads: PageViewPayload[] = [];
    const send = createPageViewSender(() => ({
      ready,
      href: "https://toolify365.com/ja/tools/word-counter?s=private&wf=writing&ws=1#secret",
      title: "Word Counter",
      emit: (value) => payloads.push(value),
    }));
    expect(send()).toBe(false);
    expect(payloads).toHaveLength(0);
    ready = true;
    expect(send()).toBe(true);
    expect(payloads).toEqual([{
      page_path: "/ja/tools/word-counter",
      page_location: "https://toolify365.com/ja/tools/word-counter",
      page_title: "Word Counter",
    }]);
    expect(send()).toBe(false);
    expect(payloads).toHaveLength(1);
  });

  it("retries if the GA emitter is absent or errors, without duplicating a successful send", () => {
    let available = false;
    let failure = true;
    const results: PageViewPayload[] = [];
    const send = createPageViewSender(() => ({
      ready: true,
      href: "https://toolify365.com/en/tools/date-calculator?ref=sensitive",
      title: "Date calculator",
      emit: available ? (payload) => {
        if (failure) throw Error("temporary emitter failure");
        results.push(payload);
      } : undefined,
    }));
    expect(send()).toBe(false);
    available = true;
    expect(() => send()).toThrow("temporary emitter failure");
    failure = false;
    expect(send()).toBe(true);
    expect(send()).toBe(false);
    expect(results).toHaveLength(1);
  });

  it("allows another page view only when pathname navigation creates a new sender", () => {
    const results: PageViewPayload[] = [];
    let href = "https://toolify365.com/en/tools/word-counter";
    const snapshot = () => ({
      ready: true,
      href,
      title: "Toolify",
      emit: (payload: PageViewPayload) => { results.push(payload); },
    });
    const firstRoute = createPageViewSender(snapshot);
    expect(firstRoute()).toBe(true);
    href = "https://toolify365.com/en/tools/word-counter?s=updated";
    expect(firstRoute()).toBe(false);
    href = "https://toolify365.com/en/tools/slug-generator";
    const secondRoute = createPageViewSender(snapshot);
    expect(secondRoute()).toBe(true);
    expect(results.map((item) => item.page_path)).toEqual([
      "/en/tools/word-counter", "/en/tools/slug-generator",
    ]);
  });
});
