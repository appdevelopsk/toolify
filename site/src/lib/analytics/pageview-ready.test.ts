import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { shouldSendPageView } from "./pageview-ready";
import { safePageViewUrl } from "./pageview-url";

const gtag = () => {};

describe("GA4 initial page view readiness", () => {
  it("does not lose the initial view when mounted before the site tag is ready", () => {
    const location = "https://toolify365.com/fr/tools";
    expect(shouldSendPageView(false, gtag, location, "")).toBe(false);
    expect(shouldSendPageView(undefined, gtag, location, "")).toBe(false);
    expect(shouldSendPageView(true, undefined, location, "")).toBe(false);
    expect(shouldSendPageView(true, gtag, location, "")).toBe(true);
  });

  it("deduplicates a ready event and preserves new SPA page navigations", () => {
    const original = "https://toolify365.com/fr/tools";
    expect(shouldSendPageView(true, gtag, original, original)).toBe(false);
    expect(shouldSendPageView(true, gtag, "https://toolify365.com/fr/tools/bmi-calculator", original)).toBe(true);
  });

  it("does not generate a new view when only private query values change", () => {
    const a = safePageViewUrl("/en/tools", "https://toolify365.com/en/tools?q=user%40example.com");
    const b = safePageViewUrl("/en/tools", "https://toolify365.com/en/tools?q=other");
    expect(shouldSendPageView(true, gtag, b.page_location, a.page_location)).toBe(false);
  });

  it("signals site readiness after GA4 config without creating a second automatic page view", () => {
    const init = readFileSync(new URL("./gtag.tsx", import.meta.url), "utf8");
    const tracker = readFileSync(new URL("./pageview.tsx", import.meta.url), "utf8");
    const configPos = init.indexOf("send_page_view: false");
    const readyPos = init.indexOf("window.__toolifyGa4Ready = true");
    const eventPos = init.indexOf("window.dispatchEvent(new Event('toolify:ga4-ready'))");
    expect(configPos).toBeGreaterThan(0);
    expect(readyPos).toBeGreaterThan(configPos);
    expect(eventPos).toBeGreaterThan(readyPos);
    expect(tracker).toContain('window.addEventListener("toolify:ga4-ready", sendWhenReady)');
    expect(tracker).toContain('window.removeEventListener("toolify:ga4-ready", sendWhenReady)');
    expect(tracker).toContain("sendWhenReady();");
    expect(tracker).toContain("shouldSendPageView(ready, gtag, page_location, lastPageLocation.current)");
    expect(tracker).toContain('if (typeof gtag !== "function") return;');
  });
});
