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

  it("resyncs result-link visibility when the tool or locale route changes", () => {
    const shareBar = get("./ShareBar.tsx");
    expect(shareBar).toContain("}, [url, slug]);");
  });

  it("does not copy a link after explicit native share cancellation", () => {
    const shareBar = get("./ShareBar.tsx");
    expect(shareBar).toContain('import { isShareCancelled } from "@/lib/tools/share-errors"');
    expect(shareBar).toContain("if (isShareCancelled(error)) return;");
    expect(shareBar).toContain('copy(url, setLinkCopied, "link")');
  });

  it("clears previously shared result links when new inputs become too large", () => {
    for (const file of [
      "../../lib/hooks/useShareableState.ts",
      "../../lib/hooks/useAutoShareableState.ts",
    ]) {
      const source = get(file);
      expect(source).toContain('stale.searchParams.has("s")');
      expect(source).toContain('stale.searchParams.delete("s")');
      expect(source).toContain('window.history.replaceState(window.history.state, "", stale.toString())');
      expect(source).toContain('window.dispatchEvent(new Event("toolify:share-state-change"))');
    }
  });

  it("notifies ShareBar after both URL writer implementations update state", () => {
    for (const file of [
      "../../lib/hooks/useShareableState.ts",
      "../../lib/hooks/useAutoShareableState.ts",
    ]) {
      const source = get(file);
      expect(source).toContain('window.history.replaceState(window.history.state, "", url.toString())');
      expect(source).not.toContain('window.history.replaceState(null, "", url.toString())');
      const replaceAt = source.indexOf("window.history.replaceState(");
      const notifyAt = source.indexOf('window.dispatchEvent(new Event("toolify:share-state-change"))');
      expect(replaceAt).toBeGreaterThan(0);
      expect(notifyAt).toBeGreaterThan(replaceAt);
    }
  });
});
