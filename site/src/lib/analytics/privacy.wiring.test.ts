import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const text = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

describe("tool input and browser event privacy", () => {
  it("never collects URL query strings in the SPA page view", () => {
    const page = text("./pageview.tsx");
    expect(page).toContain("createPageViewSender(");
    expect(page).toContain("__toolifyGtagReady === true");
    expect(page).toContain('window.addEventListener("toolify:gtag-ready", send)');
    const sender = text("./pageview-once.ts");
    expect(sender).toContain("sanitizePageViewUrl(current.href)");
    expect(page).toContain("usePathname()");
    expect(page).not.toContain("useSearchParams");
    expect(page).not.toContain("page_location: window.location.href");
  });

  it("sanitizes global GA4 config and all custom events", () => {
    const init = text("./gtag.tsx");
    const events = text("./events.ts");
    expect(init).toContain("page_location: window.location.origin + window.location.pathname");
    expect(init).toContain("window.__toolifyGtagReady = true");
    expect(init).toContain("window.dispatchEvent(new Event('toolify:gtag-ready'))");
    expect(init.indexOf("gtag('consent', 'default'"))
      .toBeLessThan(init.indexOf("gtag('config'"));
    expect(init.indexOf("gtag('config'"))
      .toBeLessThan(init.indexOf("window.__toolifyGtagReady = true"));
    expect(init.indexOf("window.__toolifyGtagReady = true"))
      .toBeLessThan(init.indexOf("window.dispatchEvent(new Event('toolify:gtag-ready'))"));
    expect(events).toContain("...sanitizePageViewUrl(window.location.href)");
    expect(events).not.toContain("page_location: window.location.href");
  });

  it("sanitizes page_referrer across initial GA4 setup, SPA pageviews and custom events", () => {
    const boot = text("./gtag.tsx");
    const sender = text("./pageview-once.ts");
    const page = text("./pageview.tsx");
    const events = text("./events.ts");
    const urls = text("./pageview-url.ts");
    expect(boot).toContain("page_referrer: toolifySafeReferrer");
    expect(boot).toContain("previousUrl.origin + previousUrl.pathname");
    expect(boot).not.toContain("page_referrer: document.referrer");
    expect(sender).toContain("sanitizePageReferrer(current.referrer, current.href)");
    expect(page).toContain("lastSentLocation.current ?? document.referrer");
    expect(page).toContain("lastSentLocation.current = payload.page_location");
    expect(events).toContain("page_referrer: sanitizePageReferrer(document.referrer, window.location.href)");
    expect(urls).toContain("export function sanitizePageReferrer(");
  });

  it("keeps affiliate analytics source-safe and ignores synthetic clicks", () => {
    const events = text("./events.ts");
    const tracker = text("./affiliate-click.tsx");
    const urls = text("./pageview-url.ts");
    expect(events).toContain("link_url: sanitizeOutboundLinkUrl(p.link_url)");
    expect(urls).toContain("export function sanitizeOutboundLinkUrl(");
    expect(tracker).toContain("if (!e.isTrusted) return");
    expect(tracker).toContain("a[data-offer-id]");
  });

  it("masks browser-local tool and software content from Clarity recordings", () => {
    const tracker = text("../../components/tools/ToolInteractionTracker.tsx");
    const software = text("../../components/software/SoftwareWorkbench.tsx");
    expect(tracker).toContain('<div ref={ref} data-clarity-mask="true">');
    expect(software).toContain('data-clarity-mask="true"');
  });

  it("ignores synthetic workflow clicks and requires trusted tool input", () => {
    const link = text("../../components/workflows/WorkflowToolLink.tsx");
    const tracker = text("../../components/tools/ToolInteractionTracker.tsx");
    expect(link).toContain("event.nativeEvent.isTrusted");
    expect(tracker).toContain("!e.isTrusted");
    expect(tracker).toContain("getWorkflowContext(window.location.search, slug)");
  });
});
