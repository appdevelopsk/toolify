import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ToolInteractionTracker.tsx", import.meta.url), "utf8");
const restore = readFileSync(new URL("../../lib/hooks/useAutoShareableState.ts", import.meta.url), "utf8");

describe("user-initiated tool engagement telemetry", () => {
  it("does not count synthetic input/change restoration events as calculate", () => {
    expect(source).toContain("function onInput(e: Event)");
    expect(source).toContain("if (!e.isTrusted || sent.current.calculate) return");
    expect(source).toContain('el.addEventListener("input", onInput)');
    expect(source).toContain('el.addEventListener("change", onInput)');
    expect(restore).toContain('el.dispatchEvent(new Event("input", { bubbles: true }))');
  });

  it("resets event dedup for client navigation and cancels delayed telemetry on unmount", () => {
    expect(source).toContain("sent.current = { calculate: false, copy: false, preset: false }");
    expect(source).toContain("let calculateDelay: number | undefined");
    expect(source).toContain("let disposed = false");
    expect(source).toContain("if (disposed) return");
    expect(source).toContain("disposed = true");
    expect(source).toContain("window.clearTimeout(calculateDelay)");
    expect(source).toContain("}, [slug, locale, category])");
  });

  it("does not count programmatic mode replay as preset or copy actions", () => {
    expect(source).toContain("function onClick(e: Event)");
    expect(source).toContain("if (!e.isTrusted) return");
    expect(restore).toContain("btn.click()");
  });
});
