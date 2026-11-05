import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const get = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("share URL controls", () => {
  it("uses change notifications rather than permanent URL polling", () => {
    const shareBar = get("./ShareBar.tsx");
    expect(shareBar).toContain('window.addEventListener("toolify:share-state-change", sync)');
    expect(shareBar).toContain('window.removeEventListener("toolify:share-state-change", sync)');
    expect(shareBar).toContain('window.addEventListener("popstate", sync)');
    expect(shareBar).toContain('window.addEventListener("pageshow", sync)');
    expect(shareBar).not.toContain("setInterval(sync");
  });

  it("notifies ShareBar after both URL writer implementations update state", () => {
    for (const file of [
      "../../lib/hooks/useShareableState.ts",
      "../../lib/hooks/useAutoShareableState.ts",
    ]) {
      const source = get(file);
      const replaceAt = source.indexOf("window.history.replaceState(");
      const notifyAt = source.indexOf('window.dispatchEvent(new Event("toolify:share-state-change"))');
      expect(replaceAt).toBeGreaterThan(0);
      expect(notifyAt).toBeGreaterThan(replaceAt);
    }
  });
});
