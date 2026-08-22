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
 */
export type ToolEventParams = {
  /** ツールの slug。GA4 では custom dimension として使う。 */
  tool: string;
  /** 任意の補足(モード名・プリセット名など)。カーディナリティを抑えるため短い識別子のみ。 */
  label?: string;
};

function emit(name: string, params: Record<string, unknown>): void {
  if (!siteConfig.analytics.gaId) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** ツールが有効な入力で結果を算出したとき。ツール1着地につき最大1回に間引くこと。 */
export function trackCalculate(p: ToolEventParams): void {
  emit("calculate", { tool: p.tool, ...(p.label ? { label: p.label } : {}) });
}

/** 結果(またはコード/URL)をクリップボードへコピーしたとき。 */
export function trackCopyResult(p: ToolEventParams): void {
  emit("copy_result", { tool: p.tool, ...(p.label ? { label: p.label } : {}) });
}

/** プリセット/サンプル/例示ボタンを押したとき。 */
export function trackPresetClick(p: ToolEventParams): void {
  emit("preset_click", { tool: p.tool, ...(p.label ? { label: p.label } : {}) });
}
