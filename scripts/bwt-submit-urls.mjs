/**
 * Bing Webmaster Tools — sitemap.xml の URL を API 経由で送信
 * node scripts/bwt-submit-urls.mjs [batch]
 *
 * クォータ: 100 URL/日, 2000 URL/月
 * batch指定なしなら最初の100件
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCreds } from "./asp-creds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDS = loadCreds("bing_webmaster");
const API_KEY = CREDS.api_key;
const BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const SITE_URL = "https://tools.appdevelopsk.com";

const BATCH_SIZE = parseInt(process.argv[2]) || 100;

// 1. sitemap.xml から URL を取得
console.log("📄 sitemap.xml から URL を取得...");
const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
const sitemapXml = await sitemapRes.text();
const allUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`  全 ${allUrls.length} URL`);

// 2. 重要度順 (短いパス優先)
allUrls.sort((a, b) => a.length - b.length);
const urls = allUrls.slice(0, BATCH_SIZE);
console.log(`  送信対象: 上位 ${urls.length} 件`);

// 3. クォータ確認
const quotaRes = await fetch(`${BASE}/GetUrlSubmissionQuota?siteUrl=${encodeURIComponent(SITE_URL)}&apikey=${API_KEY}`);
const quotaJson = await quotaRes.json();
console.log(`  日次クォータ: ${quotaJson.d.DailyQuota}, 月次: ${quotaJson.d.MonthlyQuota}`);

if (urls.length > quotaJson.d.DailyQuota) {
  console.log(`  ⚠ 日次クォータ超過 — ${quotaJson.d.DailyQuota}件に削減`);
  urls.length = quotaJson.d.DailyQuota;
}

// 4. SubmitUrlBatch でまとめて送信 (100URLずつ可)
console.log(`\n📤 URL 送信中...`);
const submitRes = await fetch(`${BASE}/SubmitUrlbatch?apikey=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    siteUrl: SITE_URL,
    urlList: urls,
  }),
});
const submitText = await submitRes.text();
console.log(`  HTTP ${submitRes.status}`);
console.log(`  レスポンス: ${submitText.slice(0, 300)}`);

if (submitRes.ok && submitText.includes("null")) {
  console.log(`\n✅ ${urls.length} 件送信完了`);

  // 残クォータ確認
  const quotaAfter = await fetch(`${BASE}/GetUrlSubmissionQuota?siteUrl=${encodeURIComponent(SITE_URL)}&apikey=${API_KEY}`);
  const qa = await quotaAfter.json();
  console.log(`  残クォータ: 日次 ${qa.d.DailyQuota}, 月次 ${qa.d.MonthlyQuota}`);
} else {
  console.log(`\n⚠ エラーの可能性 — レスポンスを確認してください`);
}
