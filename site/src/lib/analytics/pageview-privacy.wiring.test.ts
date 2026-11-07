import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("GA4 query-string privacy hotfix wiring", () => {
  it("sends path-only SPA page views", () => {
    const p = src("./pageview.tsx");
    expect(p).toContain("sanitizePageViewUrl(window.location.href)");
    expect(p).toContain("usePathname()");
    expect(p).not.toContain("useSearchParams");
    expect(p).not.toContain("page_location: window.location.href");
  });

  it("protects both GA4 configuration and custom events", () => {
    const init = src("./gtag.tsx");
    const events = src("./events.ts");
    expect(init).toContain("page_location: window.location.origin + window.location.pathname");
    expect(events).toContain("...sanitizePageViewUrl(window.location.href)");
    expect(events).not.toContain("window.gtag(\"event\", name, params)");
  });
});
