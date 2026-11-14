import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);

describe("actual generator button usage is measured but not inferred from every click", () => {
  const slugs = [
    "random-number-generator",
    "password-generator",
    "uuid-generator",
    "dice-roller",
    "lorem-ipsum-generator",
  ] as const;

  it.each(slugs)("marks only one intended result-generation button in %s", (slug) => {
    const source = readFileSync(new URL(`tools/${slug}/Component.tsx`, root), "utf8");
    expect(source.match(/data-calculate-action/g)).toHaveLength(1);
    expect(source).toContain("onClick");
    expect(source).toContain("data-calculate-action");
    expect(source).toContain("<button");
  });

  it("does not mark the parameter toggles or copy actions as calculations", () => {
    const source = readFileSync(new URL("tools/password-generator/Component.tsx", root), "utf8");
    expect(source).toMatch(/onClick=\{copy\}[\s\S]{0,200}?className/);
    expect(source).not.toMatch(/onClick=\{copy\}[\s\S]{0,60}?data-calculate-action/);

    const uuid = readFileSync(new URL("tools/uuid-generator/Component.tsx", root), "utf8");
    expect(uuid).not.toMatch(/onClick=\{\(\) => setVersion\([\s\S]{0,60}?data-calculate-action/);
    const dice = readFileSync(new URL("tools/dice-roller/Component.tsx", root), "utf8");
    expect(dice).not.toMatch(/onClick=\{\(\) => setSides\([\s\S]{0,60}?data-calculate-action/);
  });

  it("tracks trusted clicks once per mount and only after result paint", () => {
    const source = readFileSync(new URL("components/tools/ToolInteractionTracker.tsx", root), "utf8");
    expect(source).toContain("if (!e.isTrusted) return;");
    expect(source).toContain('if (btn.hasAttribute("data-calculate-action"))');
    expect(source).toContain("if (sent.current.calculate) return;");
    expect(source).toContain("sent.current.calculate = true;");
    expect(source).toContain("calculateDelay = window.setTimeout(() => {");
    expect(source).toContain("has_result: hasVisibleResult(root)");
    expect(source).toContain("input_count: countFilledInputs(root)");
    expect(source).toContain("el.removeEventListener(\"click\", onClick)");
  });
});
