import { describe, expect, it } from "vitest";
import { isShareCancelled } from "./share-errors";

describe("Web Share API cancellation", () => {
  it("recognizes DOMException and Error-like AbortError rejections", () => {
    expect(isShareCancelled(new DOMException("User cancelled", "AbortError"))).toBe(true);
    const error = new Error("Share sheet closed");
    error.name = "AbortError";
    expect(isShareCancelled(error)).toBe(true);
    expect(isShareCancelled({ name: "AbortError" })).toBe(true);
  });

  it("preserves clipboard fallback for other share failures", () => {
    for (const error of [
      new Error("Unavailable"),
      new DOMException("Not allowed", "NotAllowedError"),
      null, undefined, "AbortError", { name: "aborterror" }, { message: "AbortError" },
    ]) {
      expect(isShareCancelled(error)).toBe(false);
    }
  });
});
