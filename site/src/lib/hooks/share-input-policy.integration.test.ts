import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./useAutoShareableState.ts", import.meta.url), "utf8");
const manual = readFileSync(new URL("./useShareableState.ts", import.meta.url), "utf8");

describe("share policy integration", () => {
  it("uses the PII-aware policy for inputs, textareas and selects", () => {
    expect(source).toContain("isShareableField(el.type, el.autocomplete, privateField, identifier)");
    expect(source).toContain('isShareableField("textarea", el.autocomplete, privateField, identifier)');
    expect(source).toContain('isShareableField("select", el.getAttribute("autocomplete") ?? "", privateField, identifier)');
    expect(source).toContain('const privateField = !!el.closest(');
    expect(source).toContain('data-share=');
    expect(source).toContain('const identifier = `${el.getAttribute("name") ?? ""} ${el.id}`');
  });
  it("ignores malformed decoded fields and out-of-range mode buttons", () => {
    expect(source).toContain('typeof v !== "string" && typeof v !== "boolean"');
    expect(source).toContain('Number.isSafeInteger(i)');
    expect(source).toContain('i >= all.length');
  });

  it("replays URL button indices only within a mode-selector group", () => {
    expect(source).toContain("function isModeButton(btn: HTMLButtonElement)");
    expect(source).toContain("siblings.length >= 2");
    expect(source).toContain("btn.closest(\"form\")");
    expect(source).toContain("btn && isModeButton(btn)");
    expect(source).toContain("isModeButton(b) && b.className.includes(ACTIVE_CLASS)");
  });

  it("retains payload size limits in both sharing hooks", () => {
    expect(source).toContain("isSharePayloadWithinLimit(raw, MAX_ENCODED)");
    expect(source).toContain("isSharePayloadWithinLimit(encoded, MAX_ENCODED)");
    expect(manual).toContain("raw.length > MAX_SHARED_STATE_LENGTH");
    expect(manual).toContain("encoded.length > MAX_SHARED_STATE_LENGTH");
  });
});
