#!/usr/bin/env tsx
/**
 * IndexNow submission script.
 *
 * IndexNow（https://www.indexnow.org/）は Bing/Yandex/Naver/Seznam に
 * URL 変更を即時通知するためのプロトコル。Google は2026年時点で未対応だが
 * Bing 経由でクロール頻度が大幅に上がるため、デプロイ後に呼ぶ価値あり。
 *
 * 使い方:
 *   1. 初回セットアップ:
 *      KEY=$(openssl rand -hex 32)
 *      echo "$KEY" > site/public/$KEY.txt
 *      INDEXNOW_KEY=$KEY pnpm tsx scripts/indexnow.ts
 *
 *   2. デプロイ後の通知:
 *      INDEXNOW_KEY=<your_key> SITE_URL=https://toolify.example npx tsx scripts/indexnow.ts
 *
 * 環境変数:
 *   - INDEXNOW_KEY: 32〜128文字の英数字。public/ 以下に <KEY>.txt として配置必須
 *   - SITE_URL: 通知対象サイトの URL（環境変数 NEXT_PUBLIC_SITE_URL でも可）
 *   - URLS: カンマ区切りURL一覧（省略時は sitemap から全 URL を抽出）
 */
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.INDEXNOW_KEY;
const SITE_URL = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

if (!KEY) {
  console.error("error: INDEXNOW_KEY environment variable is required.");
  console.error("Generate one with: openssl rand -hex 32");
  process.exit(1);
}
if (!SITE_URL) {
  console.error("error: SITE_URL or NEXT_PUBLIC_SITE_URL is required.");
  process.exit(1);
}

const host = new URL(SITE_URL).hostname;

// Verify the key file is in public/
const keyFile = path.resolve(__dirname, `../public/${KEY}.txt`);
if (!fs.existsSync(keyFile)) {
  console.error(`error: key file not found at ${keyFile}`);
  console.error(`Create it: echo "${KEY}" > site/public/${KEY}.txt`);
  process.exit(1);
}

async function fetchSitemapUrls(): Promise<string[]> {
  const xml = await fetch(`${SITE_URL}/sitemap.xml`).then((r) => r.text());
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => m[1]!);
}

async function submitBatch(urls: string[]): Promise<void> {
  const body = {
    host,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList: urls,
  };
  // Bing endpoint also forwards to Yandex/Naver/Seznam
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (res.status === 200 || res.status === 202) {
    console.log(`✓ submitted ${urls.length} URLs (HTTP ${res.status})`);
  } else {
    const text = await res.text().catch(() => "");
    console.error(`✗ HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
}

async function main() {
  let urls: string[];
  if (process.env.URLS) {
    urls = process.env.URLS.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    console.log(`Fetching sitemap from ${SITE_URL}/sitemap.xml...`);
    urls = await fetchSitemapUrls();
  }
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);
  // Submit in chunks of 10000 (IndexNow limit)
  const CHUNK = 10000;
  for (let i = 0; i < urls.length; i += CHUNK) {
    await submitBatch(urls.slice(i, i + CHUNK));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
