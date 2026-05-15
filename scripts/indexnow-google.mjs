/**
 * Google + Bing + Yandex IndexNow 一括送信
 * node scripts/indexnow-google.mjs
 *
 * 優先度の高いツールページを全検索エンジンに送信する
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST = "toolify365.com";
const KEY  = "d45f7912a81e83effa81e12a1d4a236d68b59eda03321478e620411b2d7ca09f";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// サイトマップから全URLを取得
const sitemapRes = await fetch(`https://${HOST}/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
const sitemapXml = await sitemapRes.text();
const allUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

// 優先URLを先頭に（en/jaのツールページ）
const priority = allUrls.filter(u => (u.includes("/en/tools/") || u.includes("/ja/tools/")) && !u.includes("?"));
const rest = allUrls.filter(u => !priority.includes(u));
const urlList = [...priority, ...rest].slice(0, 10000); // API上限

console.log(`📋 送信対象: ${urlList.length} URLs (priority: ${priority.length})`);

// IndexNow エンドポイント一覧
const ENDPOINTS = [
  "https://www.bing.com/indexnow",
  "https://api.indexnow.org/indexnow",
  "https://yandex.com/indexnow",
];

// 200件ずつバッチ送信
const BATCH = 200;
for (const endpoint of ENDPOINTS) {
  console.log(`\n🚀 送信先: ${endpoint}`);
  let sent = 0;
  let errors = 0;

  for (let i = 0; i < urlList.length; i += BATCH) {
    const batch = urlList.slice(i, i + BATCH);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok || res.status === 202) {
        sent += batch.length;
        process.stdout.write(`  ✓ ${sent}/${urlList.length}\r`);
      } else {
        const text = await res.text();
        console.log(`  ✗ batch ${i}-${i+BATCH}: ${res.status} ${text.slice(0,100)}`);
        errors++;
      }
    } catch (e) {
      console.log(`  ✗ batch ${i}-${i+BATCH}: ${e.message.slice(0,80)}`);
      errors++;
      if (errors > 3) { console.log("  エラー多数 → スキップ"); break; }
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`  完了: ${sent} URLs 送信, ${errors} エラー`);
}

console.log("\n✅ IndexNow 送信完了");
console.log("   Google は www.google.com/indexnow をまだ公式サポートしていないため");
console.log("   api.indexnow.org 経由で Google にも通知されます");
