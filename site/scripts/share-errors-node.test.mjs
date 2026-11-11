import { test } from "node:test";
import { strict as assert } from "node:assert";
import { isShareCancelled } from "../src/lib/tools/share-errors.ts";

test("cancelling the system share sheet must not trigger clipboard fallback", () => {
  assert.equal(isShareCancelled(new DOMException("User cancelled", "AbortError")), true);
  assert.equal(isShareCancelled({ name: "AbortError" }), true);
  const err = new Error("cancelled");
  err.name = "AbortError";
  assert.equal(isShareCancelled(err), true);
});

test("non-cancellation errors may use clipboard fallback", () => {
  for (const error of [
    null, undefined, "AbortError", new Error("share failed"),
    new DOMException("Permission denied", "NotAllowedError"), { name: "aborterror" },
  ]) {
    assert.equal(isShareCancelled(error), false);
  }
});
