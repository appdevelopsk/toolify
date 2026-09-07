#!/usr/bin/env node
/**
 * GA4 Data API から `calculate` イベントをツール別に集計し、直近 28 日のランキングを出す。
 *
 * 前提(重要): GA4 Admin > Data display > Custom definitions に
 *   event-scoped custom dimension  "tool_slug" (event parameter: tool_slug)
 * を登録しておくこと。未登録だと `customEvent:tool_slug` は "(not set)" だけになる。
 * 併せて "locale" / "category" も登録すると --by locale / --by category で切れる。
 * (登録前のイベントは遡って集計されない。登録日以降のデータのみ)
 *
 * 認証: サービスアカウント JWT(RS256) → OAuth2 token → analyticsdata v1beta runReport。
 * 00_集客統合/growth/ga4-snapshot.mjs と同じパターン。秘密情報はすべて env から読む。
 *
 * env:
 *   GA4_PROPERTY_ID                数値の property ID(例 123456789)
 *   GOOGLE_APPLICATION_CREDENTIALS サービスアカウント JSON のパス
 *     または GA4_SA_JSON            サービスアカウント JSON 文字列(CI 向け)
 *   GA4_SA_EMAIL + GA4_SA_KEY       client_email / private_key を個別に渡す形式も可
 *
 * 使い方:
 *   node scripts/calculate-ranking.mjs                # 28日 / tool_slug 上位 50
 *   node scripts/calculate-ranking.mjs --days 7 --limit 20
 *   node scripts/calculate-ranking.mjs --by category  # tool_slug の代わりに category で集計
 *   node scripts/calculate-ranking.mjs --json         # JSON 出力(他スクリプトへパイプ)
 */
import { createSign } from "node:crypto";
import fs from "node:fs";

const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}
const DAYS = Number(opt("days", "28"));
const LIMIT = Number(opt("limit", "50"));
const BY = opt("by", "tool_slug"); // tool_slug | locale | category
const JSON_OUT = args.includes("--json");
const EVENT = opt("event", "calculate");

const propertyId = process.env.GA4_PROPERTY_ID;
if (!propertyId) {
  console.error("GA4_PROPERTY_ID が未設定です。GA4 Admin > Property settings の数値 ID を指定してください。");
  process.exit(1);
}

function loadServiceAccount() {
  if (process.env.GA4_SA_EMAIL && process.env.GA4_SA_KEY) {
    return { client_email: process.env.GA4_SA_EMAIL, private_key: process.env.GA4_SA_KEY.replace(/\\n/g, "\n") };
  }
  if (process.env.GA4_SA_JSON) return JSON.parse(process.env.GA4_SA_JSON);
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (p && fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  console.error(
    "サービスアカウント認証情報が見つかりません。GOOGLE_APPLICATION_CREDENTIALS / GA4_SA_JSON / GA4_SA_EMAIL+GA4_SA_KEY のいずれかを設定してください。",
  );
  process.exit(1);
}

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const signature = signer.sign(sa.private_key, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${header}.${payload}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function runReport(token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`runReport: ${res.status} ${await res.text()}`);
  return res.json();
}

const token = await getAccessToken(loadServiceAccount());
const report = await runReport(token, {
  dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
  dimensions: [{ name: `customEvent:${BY}` }],
  metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
  dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: EVENT } } },
  orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  limit: LIMIT,
});

const rows = (report.rows ?? []).map((r) => ({
  [BY]: r.dimensionValues[0].value,
  events: Number(r.metricValues[0].value),
  users: Number(r.metricValues[1].value),
}));

if (JSON_OUT) {
  console.log(JSON.stringify({ event: EVENT, days: DAYS, by: BY, rows }, null, 2));
} else {
  console.log(`# ${EVENT} by ${BY} — last ${DAYS} days (top ${LIMIT})`);
  if (rows.length === 0) {
    console.log("(no rows) — custom dimension が未登録か、登録後にまだイベントが溜まっていない可能性があります。");
  }
  const w = Math.max(8, ...rows.map((r) => String(r[BY]).length));
  console.log(`${"#".padStart(3)}  ${BY.padEnd(w)}  ${"events".padStart(8)}  ${"users".padStart(8)}`);
  rows.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(3)}  ${String(r[BY]).padEnd(w)}  ${String(r.events).padStart(8)}  ${String(r.users).padStart(8)}`);
  });
  const notSet = rows.find((r) => r[BY] === "(not set)");
  if (notSet && rows.length <= 1) {
    console.log("\n注意: すべて (not set) です。GA4 Admin で custom dimension を登録してください。");
  }
}
