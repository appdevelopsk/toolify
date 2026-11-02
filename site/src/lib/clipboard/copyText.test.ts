import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./copyText";

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
afterEach(() => {
  if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
  else Reflect.deleteProperty(globalThis, "navigator");
});

function setClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { clipboard: writeText ? { writeText } : undefined },
  });
}

describe("copyText", () => {
  it("returns false for empty values", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    expect(await copyText("")).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
  it("returns false when clipboard support is unavailable", async () => {
    setClipboard();
    expect(await copyText("hello")).toBe(false);
  });
  it("returns true only after a successful clipboard write", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    expect(await copyText("hello")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });
  it("returns false when permission or write fails", async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error("NotAllowedError")));
    expect(await copyText("hello")).toBe(false);
  });
});
