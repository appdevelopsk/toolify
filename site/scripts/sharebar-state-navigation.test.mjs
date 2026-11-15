import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const share = readFileSync(new URL("../src/components/tools/ShareBar.tsx", import.meta.url), "utf8");

test("share state resynchronizes after URL or tool slug changes", () => {
  assert.match(share, /setHasResultLink\(new URLSearchParams\(window\.location\.search\)\.has\("s"\)\)/);
  assert.match(share, /\}, \[url, slug\]\);/);
  for (const event of ["toolify:share-state-change", "popstate", "pageshow"]) {
    assert.ok(share.includes(`window.addEventListener("${event}", sync)`), event + " listener");
    assert.ok(share.includes(`window.removeEventListener("${event}", sync)`), event + " cleanup");
  }
});

test("safe embed and tracked share attribution stay intact", () => {
  assert.match(share, /buildToolEmbedSnippet\(title, embedUrl, url\)/);
  assert.match(share, /socialShareUrl\(url, source\)/);
  assert.match(share, /if \(isShareCancelled\(error\)\) return;/);
});
