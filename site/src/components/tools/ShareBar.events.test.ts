import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const get = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("on-demand result sharing", () => {
  it("copies result state only from an explicit click without mutating browser location", () => {
    const bar = get("./ShareBar.tsx");
    expect(bar).toContain("function copyResultLink()");
    expect(bar).toContain("new CustomEvent<ResultLinkRequest>(RESULT_LINK_REQUEST");
    expect(bar).toContain('onClick={copyResultLink}');
    expect(bar).toContain('copy(resultLink, setResultCopied, "result")');
    expect(bar).not.toContain("copy(window.location.href");
    expect(bar).not.toContain("hasResultLink &&");
  });

  it("both share hooks respond to current result requests without per-keystroke URLs", () => {
    for (const name of ["useShareableState.ts", "useAutoShareableState.ts"]) {
      const src = get("../../lib/hooks/" + name);
      expect(src).toContain("window.addEventListener(RESULT_LINK_REQUEST, onRequest)");
      expect(src).toContain("window.removeEventListener(RESULT_LINK_REQUEST, onRequest)");
      expect(src).toContain("createResultShareLink(window.location.href, encoded,");
      expect(src).not.toContain('url.searchParams.set("s", encoded)');
    }
  });

  it("restores legacy query state, then removes stale data after edits", () => {
    for (const name of ["useShareableState.ts", "useAutoShareableState.ts"]) {
      const src = get("../../lib/hooks/" + name);
      expect(src).toContain("readResultShareState(window.location.href)");
      expect(src).toContain("migrateLegacyShareQuery(window.location.href)");
      expect(src).toContain("clearStaleResultShareState(window.location.href)");
      expect(src).toContain('window.history.replaceState(window.history.state, "",');
      expect(src).toContain('window.dispatchEvent(new Event("toolify:share-state-change"))');
    }
  });

  it("uses fragment-only result links and keeps native share cancellation safe", () => {
    const policy = get("../../lib/hooks/result-share-link.ts");
    expect(policy).toContain('url.hash = `s=${encoded}`');
    expect(policy).toContain('url.searchParams.delete("s")');
    const bar = get("./ShareBar.tsx");
    expect(bar).toContain("if (isShareCancelled(error)) return;");
    expect(bar).toContain('copy(url, setLinkCopied, "link")');
  });
});
