#!/usr/bin/env tsx
/**
 * 為替レート取得スクリプト（currency-converter 用）。
 *
 * open.er-api.com（exchangerate-api.com の無料エンドポイント）から USD 基準の
 * レートを取得し src/data/rates.json に書き出す。API キー不要・1日1回更新。
 *
 * fail-open: 取得に失敗した場合は既存の rates.json をそのまま残して exit 0 する。
 * ビルドを止めないのが目的なので、ネットワーク断や API 障害では警告のみ。
 * ただし rates.json が存在しない状態での失敗は exit 1（ビルドが壊れるため）。
 *
 * 使い方: npm run fetch:rates（prebuild から自動実行）
 */
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "rates.json");
const API = "https://open.er-api.com/v6/latest/USD";

/** Component.tsx の通貨セレクタに出す通貨。増やす場合はここに追加する。 */
const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CNY", "KRW", "INR", "AUD", "CAD", "CHF",
  "SGD", "HKD", "BRL", "MXN", "THB", "ZAR", "SEK", "NOK", "DKK", "NZD",
  "TRY", "IDR", "MYR", "PHP", "VND", "AED", "SAR", "QAR", "EGP", "PKR", "BDT",
];

function bail(msg: string): never | void {
  if (existsSync(OUT)) {
    console.warn(`[fetch-rates] ${msg} — 既存の rates.json を維持します`);
    const cur = JSON.parse(readFileSync(OUT, "utf8"));
    console.warn(`[fetch-rates] 現在の updatedAt: ${cur.updatedAt}`);
    process.exit(0);
  }
  console.error(`[fetch-rates] ${msg} — rates.json が無いため中断します`);
  process.exit(1);
}

async function main() {
  let json: { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return bail(`API が HTTP ${res.status} を返しました`);
    json = await res.json();
  } catch (e) {
    return bail(`API 取得に失敗: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (json.result !== "success" || !json.rates) {
    return bail(`API レスポンスが不正です (result=${json.result})`);
  }

  const missing = CURRENCIES.filter((c) => typeof json.rates![c] !== "number");
  if (missing.length > 0) {
    return bail(`API に含まれない通貨があります: ${missing.join(", ")}`);
  }

  const rates: Record<string, number> = {};
  for (const c of CURRENCIES) rates[c] = json.rates[c]!;
  // USD 基準なので 1.0 でなければレート体系が違う＝取り違え
  if (rates.USD !== 1) return bail(`USD が 1 ではありません (${rates.USD})`);

  const updatedAt = json.time_last_update_utc
    ? new Date(json.time_last_update_utc).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  writeFileSync(OUT, JSON.stringify({ base: "USD", updatedAt, rates }, null, 2) + "\n");
  console.log(`[fetch-rates] ${CURRENCIES.length} 通貨を更新しました (updatedAt=${updatedAt})`);
}

main();
