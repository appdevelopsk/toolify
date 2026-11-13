import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots.txt crawl policy", () => {
  it("keeps the sitemap and host on the configured site", () => {
    const result = robots();
    expect(result.sitemap).toBeTruthy();
    expect(result.host).toBeTruthy();
  });

  it("protects dynamic APIs but allows only safe public release and OG resources", () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    if (!rule) throw new Error("Missing robots crawl rules");

    expect(rule.userAgent).toBe("*");
    expect(rule.disallow).toContain("/api/");
    expect(rule.allow).toContain("/api/og");
    expect(rule.allow).toContain("/api/release");
    // This is a narrow, longer path override: no general /api access.\n    expect(rule.allow).not.toContain("/api/");
    expect(rule.allow).toContain("/");
  });
});
