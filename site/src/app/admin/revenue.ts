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
