/**
 * ValueCommerce API — 提携中プログラム一覧 + 広告リンク取得
 * node scripts/vc-check-programs.mjs
 *
 * 公式API: https://developer.valuecommerce.ne.jp/
 * 認証: OAuth2 Client Credentials
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHmac } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "asp-output");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// .env.local から読み込み
import { readFileSync } from "node:fs";
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => l.split("=").map(s => s.trim()))
);

const CLIENT_KEY    = env.VC_CLIENT_KEY;
const CLIENT_SECRET = env.VC_CLIENT_SECRET;
const SITE_ID       = env.VC_SITE_ID;

if (!CLIENT_KEY || !CLIENT_SECRET || !SITE_ID) {
  console.error("❌ .env.local に VC_CLIENT_KEY / VC_CLIENT_SECRET / VC_SITE_ID が必要です");
  process.exit(1);
}

// ── OAuth2 アクセストークン取得 ──
async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     CLIENT_KEY,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch("https://api.valuecommerce.ne.jp/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token取得失敗 ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ── API GETヘルパー ──
async function vcGet(token, path, params = {}) {
  const url = new URL(`https://api.valuecommerce.ne.jp/v1${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`API ${path} failed ${res.status}: ${text}`);

  try { return JSON.parse(text); }
  catch { return text; }
}

// ── メイン ──
console.log("🔑 ValueCommerce API — アクセストークン取得中...");
let token;
try {
  token = await getAccessToken();
  console.log("✓ トークン取得成功");
} catch (e) {
  console.error("❌ 認証失敗:", e.message);

  // フォールバック: 旧API形式（HMAC署名）を試みる
  console.log("\n⚠️  OAuth2が失敗。APIエンドポイントを別途確認します...");
  console.log("   VC_CLIENT_KEY:", CLIENT_KEY.slice(0, 8) + "...");

  // VC APIの仕様確認
  const testRes = await fetch("https://api.valuecommerce.ne.jp/v1/", {
    headers: { "Accept": "application/json" },
  });
  console.log("   API root status:", testRes.status);
  const testText = await testRes.text();
  console.log("   Response:", testText.slice(0, 300));
  process.exit(1);
}

// ── 1. サイト情報確認 ──
console.log("\n📊 サイト情報...");
try {
  const siteInfo = await vcGet(token, `/sites/${SITE_ID}`);
  console.log(JSON.stringify(siteInfo, null, 2).slice(0, 500));
  writeFileSync(path.join(outDir, "vc-site-info-api.json"), JSON.stringify(siteInfo, null, 2), "utf-8");
} catch (e) {
  console.log("  サイト情報取得エラー:", e.message);
}

// ── 2. 提携中プログラム一覧 ──
console.log("\n📋 提携中プログラム...");
let affiliatedPrograms = [];
try {
  const programs = await vcGet(token, "/programs", {
    site_id: SITE_ID,
    status: "active",
    per_page: 100,
  });
  affiliatedPrograms = programs.programs || programs.data || programs || [];
  console.log(`  ${affiliatedPrograms.length} 件`);
  writeFileSync(path.join(outDir, "vc-programs-api.json"), JSON.stringify(programs, null, 2), "utf-8");
} catch (e) {
  console.log("  取得エラー:", e.message);

  // 別エンドポイントを試す
  const endpoints = [
    "/affiliate/programs",
    `/sites/${SITE_ID}/programs`,
    "/publishers/programs",
  ];
  for (const ep of endpoints) {
    try {
      console.log(`  → ${ep} を試行...`);
      const r = await vcGet(token, ep, { site_id: SITE_ID });
      console.log("  ✓ 成功:", JSON.stringify(r).slice(0, 200));
      writeFileSync(path.join(outDir, `vc-programs-${ep.replace(/\//g, "-")}.json`), JSON.stringify(r, null, 2), "utf-8");
      break;
    } catch (e2) {
      console.log(`  ✗ ${ep}: ${e2.message.slice(0, 100)}`);
    }
  }
}

// ── 3. 広告リンク取得 ──
if (affiliatedPrograms.length > 0) {
  console.log("\n🔗 広告リンク取得...");
  const links = [];
  for (const prog of affiliatedPrograms.slice(0, 20)) {
    const progId = prog.id || prog.program_id;
    try {
      const linkData = await vcGet(token, "/ad_links", {
        site_id: SITE_ID,
        program_id: progId,
        per_page: 5,
      });
      const adLinks = linkData.ad_links || linkData.data || [];
      const textLinks = adLinks.filter(l => l.type === "text" || l.link_type === "text");
      links.push({
        id: progId,
        name: prog.name || prog.program_name,
        adLinks: textLinks.slice(0, 2).map(l => ({
          url: l.click_url || l.url || l.affiliate_url,
          text: l.text || l.anchor_text,
        })),
      });
      if (textLinks.length > 0) {
        console.log(`  ✅ ${prog.name}: ${textLinks[0].click_url || textLinks[0].url}`);
      }
    } catch (e) {
      console.log(`  ✗ ${prog.name}: ${e.message.slice(0, 80)}`);
    }
  }
  writeFileSync(path.join(outDir, "vc-ad-links-api.json"), JSON.stringify(links, null, 2), "utf-8");
} else {
  // ── フォールバック: 全エンドポイント探索 ──
  console.log("\n🔍 利用可能なAPIエンドポイントを探索...");
  const testPaths = [
    "/me",
    "/user",
    "/publisher",
    "/publishers/me",
    "/sites",
    `/sites/${SITE_ID}`,
    "/programs",
    "/ad_links",
    "/links",
  ];
  for (const p of testPaths) {
    try {
      const r = await vcGet(token, p);
      console.log(`  ✅ ${p}: ${JSON.stringify(r).slice(0, 120)}`);
      writeFileSync(path.join(outDir, `vc-endpoint${p.replace(/\//g, "-")}.json`), JSON.stringify(r, null, 2), "utf-8");
    } catch (e) {
      console.log(`  ✗ ${p}: ${e.message.slice(0, 80)}`);
    }
  }
}

console.log("\n📄 出力: scripts/asp-output/vc-*.json");
