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
    expect(events).toContain("...sanitizePageViewUrl(window.location.href)");
    expect(events).not.toContain("page_location: window.location.href");
  });

  it("ignores synthetic workflow clicks and requires trusted tool input", () => {
    const link = text("../../components/workflows/WorkflowToolLink.tsx");
    const tracker = text("../../components/tools/ToolInteractionTracker.tsx");
    expect(link).toContain("event.nativeEvent.isTrusted");
    expect(tracker).toContain("!e.isTrusted");
    expect(tracker).toContain("getWorkflowContext(window.location.search, slug)");
  });
});
