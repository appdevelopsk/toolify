import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ToolFrame.tsx", import.meta.url), "utf8");

describe("tool result follow-up placement", () => {
  it("places related and recent tools after the workspace but ahead of ads", () => {
    const workspace = source.indexOf("<ToolInteractionTracker");
    const related = source.indexOf("{related.length > 0");
    const recent = source.indexOf("<ContinueWithRecent");
    const software = source.indexOf("<ToolSoftwareRecommendations");
    const resultAd = source.indexOf("<AdBelowResult");
    const bannerAd = source.indexOf('<AdBanner className="mt-4"');
    expect([workspace, related, recent, software, resultAd, bannerAd].every((i) => i >= 0)).toBe(true);
    expect(workspace).toBeLessThan(related);
    expect(related).toBeLessThan(recent);
    expect(recent).toBeLessThan(software);
    expect(software).toBeLessThan(resultAd);
    expect(resultAd).toBeLessThan(bannerAd);
  });
  it("retains the existing ad inventory", () => {
    expect(source).toContain("<AdBelowResult");
    expect(source).toContain("<AdBanner");
    expect(source).toContain("<AdInArticle");
    expect(source).toContain("<AdSticky");
  });
});
