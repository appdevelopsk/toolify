"use client";

import { siteConfig } from "@/lib/config";

/**
 * GA4 カスタムイベントの一元送出。
 *
 * なぜ必要か: このリポジトリには page_view 以外のイベント送出が存在せず
 * (唯一の gtag("event") は PageViewTracker 内)、ツールが「実際に使われたか」を
 * 測る手段が無かった。滞在率改善(初期値投入・関連導線)の効果判定には
 * 「着地したか」ではなく「計算したか / 結果をコピーしたか」が要る。
 *
 * ガードは PageViewTracker と同一: gaId 未設定 / SSR / gtag 未ロードでは黙って no-op。
 * Consent Mode v2 は gtag.tsx 側で既定 denied(EEA) を設定済みのため、
 * ここで同意状態を再判定する必要はない(gtag 側が保留・破棄を行う)。
 *
 * パラメータ(2026-09-07): `tool_slug` / `locale` / `category` を追加。
 * GA4 で集計するには Admin > Custom definitions に event-scoped custom dimension
 * として登録が必要(未登録だと Data API の customEvent:tool_slug が空になる)。
 * 旧 `tool` パラメータは既存レポート互換のため当面併送する。
 */
export type ToolEventParams = {
  /** ツールの slug。GA4 では custom dimension `tool_slug` として使う。 */
  tool: string;
  /** ページのロケール(en / ja / ar ...)。custom dimension `locale`。 */
  locale?: string;
  /** ToolMeta.category(health / finance / ...)。custom dimension `category`。 */
  category?: string;
  /** 任意の補足(モード名・プリセット名など)。カーディナリティを抑えるため短い識別子のみ。 */
  label?: string;
};

/**
 * calculate 専用の追加パラメータ(2026-09-08)。
 * ToolInteractionTracker が DOM から算出する。個々のツールは触らない。
 */
export type CalculateParams = ToolEventParams & {
  /** 値の入っている input/textarea/select の数(checkbox/radio は checked のみ)。 */
  input_count?: number;
  /** 結果領域(aria-live / output / role=status / *result*)にテキストがあるか。 */
  has_result?: boolean;
};

function emit(name: string, params: Record<string, unknown>): void {
  if (!siteConfig.analytics.gaId) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** ToolEventParams を GA4 送出用の params に正規化する(undefined は落とす)。 */
function toParams(p: ToolEventParams): Record<string, unknown> {
  return {
    tool: p.tool,
    tool_slug: p.tool,
    ...(p.locale ? { locale: p.locale } : {}),
    ...(p.category ? { category: p.category, tool_category: p.category } : {}),
    ...(p.label ? { label: p.label } : {}),
  };
}

/** ツールが有効な入力で結果を算出したとき。ツール1着地につき最大1回に間引くこと。 */
export function trackCalculate(p: CalculateParams): void {
  emit("calculate", {
    ...toParams(p),
    ...(typeof p.input_count === "number" ? { input_count: p.input_count } : {}),
    ...(typeof p.has_result === "boolean" ? { has_result: p.has_result } : {}),
  });
}

/** お気に入りの ON/OFF。state は "on" | "off"。 */
export function trackFavoriteToggle(p: { tool: string; locale?: string; state: "on" | "off" }): void {
  emit("favorite_toggle", { tool_slug: p.tool, state: p.state, ...(p.locale ? { locale: p.locale } : {}) });
}

/**
 * ツール検索。クエリ文字列そのものは送らない(PII 回避・カーディナリティ抑制)。
 * 呼び出し側でデバウンスすること(ToolSearchBox は 600ms)。
 */
export function trackToolSearch(p: { query_length: number; results_count: number; locale?: string; source?: string }): void {
  emit("tool_search", {
    query_length: p.query_length,
    results_count: p.results_count,
    ...(p.locale ? { locale: p.locale } : {}),
    ...(p.source ? { source: p.source } : {}),
  });
}

/** 結果(またはコード/URL)をクリップボードへコピーしたとき。 */
export function trackCopyResult(p: ToolEventParams): void {
  emit("copy_result", toParams(p));
}

/** プリセット/サンプル/例示ボタンを押したとき。 */
export function trackPresetClick(p: ToolEventParams): void {
  emit("preset_click", toParams(p));
}

/**
 * 共有導線を踏んだとき(ネイティブ共有・SNSリンク)。
 *
 * copy_result はクリップボードのみを見ており、ShareBar の主要導線
 * (navigator.share / X / Facebook / LINE / WhatsApp / Reddit)は
 * 一切計測されていなかった。label に共有先を入れて内訳を取る。
 * 外部遷移は計測を待たずに起きるので、送出は必ず遷移前に行う。
 */
export function trackShare(p: ToolEventParams): void {
  emit("share", toParams(p));
}
