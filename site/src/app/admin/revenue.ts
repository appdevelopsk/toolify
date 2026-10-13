import { readFile } from "node:fs/promises";
import path from "node:path";

/** app-infra/revenue/latest.json(00_集客統合/growth/revenue-snapshot.mjs の出力)の形。 */
export type RevenueSource = {
  business: string;
  source: string;
  window: "mtd" | "last30d" | "unknown";
  amount: number | null;
  currency: string | null;
  jpy: number | null;
  status: "ok" | "zero" | "missing" | "unmeasured";
  snapDate: string | null;
  fetchedAt: string | null;
  note: string | null;
};
export type BusinessTotal = {
  mtdJpy: number;
  last30dJpy: number;
  sourcesTotal: number;
  sourcesWithValue: number;
  notCollected: string[];
};
export type RevenueSnapshot = {
  date: string;
  generatedAt: string;
  month: string;
  goal: { jpyPerBusinessPerMonth: number; by: string };
  businesses: Record<string, BusinessTotal>;
  sources: RevenueSource[];
};

/**
 * 収益スナップショットの置き場。VPS 上のパスは ADMIN_REVENUE_FILE で指定する
 * (未指定なら ./admin-data/revenue-latest.json)。ファイルが無い/壊れていれば null。
 */
export async function loadRevenue(): Promise<RevenueSnapshot | null> {
  const file = process.env.ADMIN_REVENUE_FILE || path.join(process.cwd(), "admin-data", "revenue-latest.json");
  try {
    return JSON.parse(await readFile(file, "utf8")) as RevenueSnapshot;
  } catch {
    return null;
  }
}

/** build-admin-history.py が作る履歴+所見(同じディレクトリの revenue-history.json)。 */
export type HistoryCompare = { date: string; last30d: number | null; mtd: number | null; sameMonth: boolean };
export type HistorySource = {
  source: string;
  window: string;
  jpy: number | null;
  prev7: number | null;
  status: string;
  note: string | null;
  metrics: Record<string, { now?: number; prev7?: number }>;
};
export type HistoryBusiness = {
  label: string;
  now: { mtd: number; last30d: number };
  compare: { d7?: HistoryCompare; d14?: HistoryCompare };
  projection: { landing: number; goalPct: number | null; needPerDay: number; elapsedDays: number; daysInMonth: number };
  series: { date: string; mtd: number | null; last30d: number | null }[];
  sources: HistorySource[];
  findings: string[];
  notCollected: string[];
};
export type History = {
  date: string;
  historyDays: number;
  firstDate: string;
  goal: { jpyPerBusinessPerMonth: number; by: string };
  businesses: Record<string, HistoryBusiness>;
};

export async function loadHistory(): Promise<History | null> {
  const base = process.env.ADMIN_REVENUE_FILE || path.join(process.cwd(), "admin-data", "revenue-latest.json");
  try {
    return JSON.parse(await readFile(path.join(path.dirname(base), "revenue-history.json"), "utf8")) as History;
  } catch {
    return null;
  }
}
